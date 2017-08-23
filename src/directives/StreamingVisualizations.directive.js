angular.module("ngStreamingVisualizationsView", ["ngGlobeViewService", "ngGlobeViewConstant"]).directive('streamingVisualizationsView', function() {
    'use strict';
    return {
        restrict: 'A',
        controller: ["$scope", "globeViewSV", "globeViewCNST", function($scope, globeViewSV, globeViewCNST) {
            var _addDataEventListner;

            $scope.initialize = _initialize;
            $scope.render = _render;
            $scope.addData = _addData;
            $scope.prune = _prune;

            function _initialize() {
                var visualization = $scope.visualization;
                switch (visualization) {
                    case "globe":
                        $scope.visualizationSV = globeViewSV;
                        $scope.visualizationCNST = globeViewCNST;
                        break;
                }

                _addDataEventListner = $scope.$on('ADD_DATA', function(event, data) {
                    $scope.addData(data.source, data.destination)
                });

                $scope.$on('$destroy', function() {
                    _removeListener();
                });
            }

            function _render() {
                $scope.visualizationSV.render();
            }

            function _addData(src, dst) {
                $scope.visualizationSV.addData(src, dst);
            }

            function _prune() {
                $scope.visualizationSV.prune();
            }

            function _removeListener() {
                _addDataEventListner();
            }
        }],
        link: function(scope, element, attrs) {
            scope.visualization = attrs.visualization;
            scope.initialize();
            scope.render();
        }
    };
});
