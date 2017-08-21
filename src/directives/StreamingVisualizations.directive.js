angular.module("ngStreamingVisualizationsView", ["ngGlobeViewService", "ngGlobeViewConstant"]).directive('streamingVisualizationsView', function(){
	'use strict';
	return {
		 restrict:'A',
		 controller:["$scope", "globeViewSV", "globeViewCNST", function($scope, globeViewSV, globeViewCNST){
			$scope.initialize = function() {
				var visualization = $scope.visualization;
				switch (visualization) {
					case "globe":
					$scope.visualizationSV = globeViewSV;
					$scope.visualizationCNST = globeViewCNST;
					break;
				}
			};
		}],
		link: function(scope, element, attrs) {
			scope.visualization = attrs.visualization;
			scope.initialize();
			scope.render = function () {
				scope.visualizationSV.render();
			};
			scope.addData = function () {
				scope.visualizationSV.render();
			};
			scope.prune = function () {
				scope.visualizationSV.render();
			};
			scope.render();
		}
	};
});
