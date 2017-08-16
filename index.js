//----====|| Angular App ||====----\\
var app = angular.module('globeViewDemo', ['ngMaterial', 'ngStreamingVisualizationsView']).config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default').dark();
});

app.controller('globeViewDemoController', function($scope) {
});
