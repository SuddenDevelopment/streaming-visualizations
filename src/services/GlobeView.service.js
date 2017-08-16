angular.module("ngGlobeViewService", ["ngGlobeViewConstant"])
.service('globeViewSV', ['globeViewCNST', function (globeViewCNST) {
  // couple of constants
  var _drawConfig, _shaders, _renderer, _mapDiv, _camera, _scene, _geoms, _tweens = [],
  _lines = [], _points = [], _lineColors = [], _overlay, _rotation = { x: 0, y: 0 },
  _ctx = document.querySelector('#canvas').getContext('2d');

  // _initialize();
  return;

  function _initialize() {
    _drawConfig = globeViewCNST.drawConfig;
    _drawConfig.WIDTH = window.innerWidth;      // Canvas width
    _drawConfig.HEIGHT = window.innerHeight;    // Canvas height
    _shaders = globeViewCNST.shaders;

    // some global variables and initialization code
    // simple basic renderer
    _renderer = new THREE.WebGLRenderer({ alpha: true });
    _renderer.setSize(_drawConfig.WIDTH, _drawConfig.HEIGHT);
    _renderer.setClearColor(0x00000000, 0.0);

    // add it to the target element
    _mapDiv = document.getElementById("globe");
    _mapDiv.appendChild(_renderer.domElement);

    // setup a camera that points to the center
    _camera = new THREE.PerspectiveCamera(_drawConfig.FOV, _drawConfig.WIDTH/_drawConfig.HEIGHT, _drawConfig.NEAR, _drawConfig.FAR);
    _camera.position.set(_drawConfig.POS_X, _drawConfig.POS_Y, _drawConfig.POS_Z);
    _camera.lookAt(new THREE.Vector3(0,0,0));

    // create a basic scene and add the camera
    _scene = new THREE.Scene();
    _scene.add(_camera);

    var _geoms = [];
    (function () {
      for (var i = 0; i < 500; i++) {
        _geoms[i] = [];
      }
    })();

    // Generate a set of colors to use
    (function (){
      for (var i = 0; i < 10; i++) {
        var c = new THREE.Color();
        var x = Math.random();
        c.setHSL( (0.6 - ( x * 0.5 ) ), 1.0, 0.5);

        _lineColors.push(new THREE.LineBasicMaterial({
          color: c,
          linewidth: 2
        }));
      }
    })();

    if (_drawConfig.DEBUG) {
      document.body.appendChild( stats.domElement );
    }

    window.addEventListener('resize', onWindowResize);

    addEarth();
    addOverlay();
    animate();
  }

  // Function for adding the earth, atmosphere, and the moon
  //var pivot;
  function addEarth() {
    // Add sphere earth geometry
    var spGeo = new THREE.SphereGeometry(600,50,50);

    var shader = _shaders['earth'];
    var uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    uniforms['texture'].value = THREE.ImageUtils.loadTexture('./images/world2.png');

    var material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader
    });

    var mesh = new THREE.Mesh(spGeo, material);
    _scene.add(mesh);

    // Add atmosphere glow
    var shader = _shaders['atmosphere'];
    uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
      , opacity: 0.5
    });

    mesh = new THREE.Mesh(spGeo, material);
    mesh.scale.set(1.1, 1.1, 1.1);
    _scene.add(mesh);
  }

  // Calculate a Vector3 from given lat/long
  function latLonToVector3(lat, lon) {
    var point = new THREE.Vector3(0, 0, 0);

    lon = lon + 10;
    lat = lat - 2;

    var phi = _drawConfig.PI_HALF - lat * Math.PI / 180 - Math.PI * 0.01;
    var theta = 2 * Math.PI - lon * Math.PI / 180 + Math.PI * 0.06;
    var rad = 600;

    point.x = Math.sin(phi) * Math.cos(theta) * rad;
    point.y = Math.cos(phi) * rad;
    point.z = Math.sin(phi) * Math.sin(theta) * rad;

    return point;
  };

  // Takes two points on the globe and turns them into a bezier curve point array
  function bezierCurveBetween(startVec3, endVec3) {
    var distanceBetweenPoints = startVec3.clone().sub(endVec3).length();

    var anchorHeight = 600 + distanceBetweenPoints * 0.4;

    var mid = startVec3.clone().lerp(endVec3, 0.5);
    var midLength = mid.length();
    mid.normalize();
    mid.multiplyScalar(midLength + distanceBetweenPoints * 0.4);

    var normal = (new THREE.Vector3()).subVectors(startVec3, endVec3);
    normal.normalize();

    var anchorScalar = distanceBetweenPoints * 0.4;

    var startAnchor = startVec3;
    var midStartAnchor = mid.clone().add(normal.clone().multiplyScalar(anchorScalar));
    var midEndAnchor = mid.clone().add(normal.clone().multiplyScalar(-anchorScalar));
    var endAnchor = endVec3;

    // Now make a bezier curve
    var splineCurveA = new THREE.CubicBezierCurve3(startVec3, startAnchor, midStartAnchor, mid);
    var splineCurveB = new THREE.CubicBezierCurve3(mid, midEndAnchor, endAnchor, endVec3);

    var vertexCountDesired = Math.floor(distanceBetweenPoints * 0.02 + 6);

    var points = splineCurveA.getPoints(vertexCountDesired);
    points = points.splice(0, points.length - 1);
    points = points.concat(splineCurveB.getPoints(vertexCountDesired));

    return points;
  }

  function getGeom(points) {
    var geometry;

    if (_geoms[points.length].length > 0) {
      geometry = _geoms[points.length].pop();

      var point = points[0];
      for (var i = 0; i < points.length; i++) {
        geometry.vertices[i].set(0, 0, 0);
      }
      geometry.verticesNeedUpdate = true;

      return geometry;
    }

    geometry = new THREE.Geometry();
    geometry.dynamic = true;
    geometry.size = 10.05477225575;

    for (var i = 0; i < points.length; i++) {
      geometry.vertices.push(new THREE.Vector3());
    }

    return geometry;
  };

  function returnGeom(geometry) {
    _geoms[geometry.vertices.length].push(geometry);
  }

  /* Tween functions */

  // Linear
  function tweenFnLinear(elapsed) {
    return elapsed;
  }

  // Ease In
  function tweenFnEaseIn(elapsed) {
    return elapsed * elapsed * elapsed * elapsed;
  }

  // Ease Out
  function tweenFnEaseOut(elapsed) {
    return 1 - (--elapsed * elapsed * elapsed * elapsed);
  }

  // Stores a list of current line tweens
  function tweenPoints(geometry, points, duration, tweenFn) {
    var tween = {
      n: 0,
      points: points,
      geometry: geometry,
      time: Date.now(),
      duration: duration,
      tweenFn: tweenFn,
      line: null
    };
    _tweens.push(tween);
    return tween;
  }

  // Steps the animations forward
  function tweenPoint() {
    var i = _tweens.length,
        now = Date.now();
    while(i--) {
      var tween = _tweens[i],
          point = tween.points[tween.n],
          geometry = tween.geometry,
          geo_length = geometry.vertices.length,
          elapsed = (now - tween.time) / tween.duration,
          value = tween.tweenFn(elapsed > 1 ? 1 : elapsed),
          next_n = Math.floor(geo_length * value);

      if (next_n > tween.n) {
        for (var j = tween.n; j < geo_length; j++) {
          if (j < next_n)
            point = tween.points[j];
          geometry.vertices[j].set(point.x, point.y, point.z);
        }
        tween.n = next_n;

        geometry.verticesNeedUpdate = true;
      }

      if (elapsed >= 1) {
        var line = tween.line;
        scene.remove(line);
        _lines.splice(_lines.indexOf(line), 1);
        returnGeom(geometry);
        _tweens.splice(i, 1);
      }
    }
  }

  function addData(src, dst) {
    var i = _points.length;

    while(i--) {
      if (Date.now() - _points[i].time > 100000) { _points.splice(i, 1); }
    }
    var srcVec3 = latLonToVector3(src.lat, src.lon);
    var pub_x =   ((1024/360.0) * (180 + src.lon));
    var pub_y =   ((512/180.0) * (90 - src.lat));

    _points.push({
      x: pub_x,
      y: pub_y,
      time: Date.now()
    });

      var dstVec3 = latLonToVector3(dst.lat, dst.lon);
      var linePoints = bezierCurveBetween(srcVec3, dstVec3);
      var geometry = getGeom(linePoints);

      var tween = tweenPoints(
        geometry,
        linePoints,
        Math.random() * 500 + 200,
        tweenFnEaseOut
      );
      var materialIndex = Math.floor(Math.random() * 10);
      var line = new THREE.Line(geometry, _lineColors[materialIndex]);
      _lines.push(line);
      tween.line = line;
      scene.add(line);
  }

  // Move the globe automatically if idle
  function checkIdle() {
    if (_drawConfig.IDLE === true) {
      target.x -= 0.001;

      if (target.y > 0) target.y -= 0.001;
      if (target.y < 0) target.y += 0.001;

      if (Math.abs(target.y) < 0.01) target.y = 0;
    }else{
      //console.log(camera.position.z);
    }
  };

  // Add a canvas-based overlay to the globe that we can draw points on
  function addOverlay() {
    var spGeo = new THREE.SphereGeometry(604, 50, 50);
    _overlay = new THREE.Texture(document.querySelector('#canvas'));

    var material = new THREE.MeshBasicMaterial({
      map: _overlay,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    var meshOverlay = new THREE.Mesh(spGeo, material);
    _scene.add(meshOverlay);
  }

  // Main render loop
  function render() {
    tweenPoint();

    // Draw our publish points every frame
    _ctx.clearRect(0,0,1024,512);
    for (var i = 0; i < _points.length; i++) {
      //points on the globe that are colored for source or destination
      _ctx.fillStyle = "#b5bd68";
      _ctx.globalAlpha = 0.75;
      _ctx.beginPath();
      _ctx.arc(_points[i].x, _points[i].y, 3, 0, 2*Math.PI, false);
      _ctx.fill();
    };

    _overlay.needsUpdate = true;

   //pivot.rotation.y += 0.01;

    _rotation.x += (target.x - _rotation.x) * 0.1;
    _rotation.y += (target.y - _rotation.y) * 0.1;
    _drawConfig.DISTANCE += (target.zoom - _drawConfig.DISTANCE) * 0.3;

    checkIdle();

    // Convert our 2d camera target into 3d world coords
    camera.position.x = _drawConfig.DISTANCE * Math.sin(_rotation.x) * Math.cos(_rotation.y);
    camera.position.y = _drawConfig.DISTANCE * Math.sin(_rotation.y);
    camera.position.z = _drawConfig.DISTANCE * Math.cos(_rotation.x) * Math.cos(_rotation.y);
    camera.lookAt( scene.position );

    renderer.autoClear = false;
    renderer.clear();
    renderer.render( scene, camera );
  }
  /*
  var stats = new Stats();
  stats.setMode(0); // 0: fps, 1: ms

  // Align top-left
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.right = '0px';
  stats.domElement.style.top = '0px';
  */
  function animate() {
    requestAnimationFrame(animate);
    if (_drawConfig.VISIBLE) {
      if (_drawConfig.DEBUG) stats.begin();
      render();
      if (_drawConfig.DEBUG) stats.end();
    }
  }

  // Resizing the canvas based on window size
  function onWindowResize(event) {
    _camera.aspect = window.innerWidth / window.innerHeight;
    _camera.updateProjectionMatrix();
    _renderer.setSize(window.innerWidth, window.innerHeight);
  }

}]);
