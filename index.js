//----====|| Angular App ||====----\\
var app = angular.module('globeViewDemo', ['ngMaterial', 'ngStreamingVisualizationsView']).config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default').dark();
});

app.controller('globeViewDemoController', [
    '$rootScope',
    '$scope',
    function($rootScope, $scope) {
        $scope.coordinateData = {
            source: {
                lat: 36.66830062866211,
                lon: 116.99720001220703,
                color: '#b5bd68'
            },
            destination: {
                lat: 34.05839920043945,
                lon: -118.27799987792969,
                color: '#f0c674'
            }
        };

        $scope.mapData = function() {
            $rootScope.$broadcast('ADD_DATA', angular.copy($scope.coordinateData));
        }
    }
]);
