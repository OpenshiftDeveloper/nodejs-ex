app = angular.module("app", ["chart.js","daterangepicker"]);
app.controller("LineCtrl", function ($scope, $http) {

    


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

    $scope.loadChartModel = function (daysBack) {
        $http({method: 'GET',
            url: '/chartmodel',
            params: {daysBack: daysBack}
        }).then(function (response) {
            chartModel = response.data;
            $scope.labels = chartModel.labels;
            $scope.series = chartModel.series;
            $scope.data = chartModel.data;
        }, function (error) {});
    };
    
    $scope.loadChartModel(31);
});

app.controller('TestCtrl', function ($scope) {
    $scope.datePicker = new Object();
    $scope.datePicker.date = {startDate: null, endDate: null};
});