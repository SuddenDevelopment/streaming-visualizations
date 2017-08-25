angular.module("ngGlobeViewConstant", []).constant('globeViewCNST', {
    drawConfig: {
        // couple of constants
        POS_X: 1800, // Initial camera pos x
        POS_Y: 500, // Cam pos y
        POS_Z: 0, // Cam pos z
        DISTANCE: 10000, // Camera distance from globe
        WIDTH: 0, // Canvas width
        HEIGHT: 0, // Canvas height
        PI_HALF: Math.PI / 2, // Minor perf calculation
        IDLE: true, // If user is using mouse to control
        IDLE_TIME: 1000 * 3, // Time before idle becomes true again

        FOV: 45, // Camera field of view
        NEAR: 1, // Camera near
        FAR: 150000, // Draw distance

        // Use the visibility API to avoid creating a ton of data when the user is not looking
        VISIBLE: true,
        DEBUG: false, // Show stats or not
        TARGET: {
            x: 0,
            y: 0,
            zoom: 2000
        }
    },
    shaders: {
        'earth': {
            uniforms: {
                'texture': {
                    type: 't',
                    value: null
                }
            },
            vertexShader: [
                'varying vec3 vNormal;',
                'varying vec2 vUv;',
                'void main() {',
                'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
                'vNormal = normalize( normalMatrix * normal );',
                'vUv = uv;',
                '}'
            ].join('\n'),
            fragmentShader: [
                'uniform sampler2D texture;',
                'varying vec3 vNormal;',
                'varying vec2 vUv;',
                'void main() {',
                'vec3 diffuse = texture2D( texture, vUv ).xyz;',
                'float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );',
                'vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( intensity, 3.0 );',
                'gl_FragColor = vec4( diffuse + atmosphere, 0.5 );',
                '}'
            ].join('\n')
        },
        'atmosphere': {
            uniforms: {},
            vertexShader: [
                'varying vec3 vNormal;',
                'void main() {',
                'vNormal = normalize( normalMatrix * normal );',
                'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
                '}'
            ].join('\n'),
            fragmentShader: [
                'varying vec3 vNormal;',
                'void main() {',
                'float intensity = pow( 0.8 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 12.0 );',
                'gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ) * intensity;',
                '}'
            ].join('\n')
        }
    }
});
