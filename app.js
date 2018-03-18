angular.module("app", ["chart.js"]).controller("LineCtrl", function ($scope, $http) {

    $http({method: 'GET',
        url: '/chartmodel'
    }).then(function (response) {
        chartModel = response.data;
        $scope.labels = chartModel.labels;
        $scope.series = chartModel.series;
        $scope.data = chartModel.data;
    }, function (error) {});


    $scope.onClick = function (points, evt) {
        console.log(points, evt);
    };
    $scope.datasetOverride = [{yAxisID: 'y-axis-1'}, {yAxisID: 'y-axis-2'}];
    $scope.options = {
        scales: {
            yAxes: [
                {
                    id: 'y-axis-1',
                    type: 'linear',
                    display: true,
                    position: 'left'
                },
                {
                    id: 'y-axis-2',
                    type: 'linear',
                    display: true,
                    position: 'right'
                }
            ]
        }
    };
});