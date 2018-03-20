app = angular.module("app", ["chart.js","daterangepicker","angularMoment"]);
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

    $scope.loadChartModel = function (startTime, endTime) {
        $http({method: 'GET',
            url: '/chartmodel',
            params: {startTime: startTime,
            endTime:endTime}
        }).then(function (response) {
            chartModel = response.data;
            $scope.labels = chartModel.labels;
            $scope.series = chartModel.series;
            $scope.data = chartModel.data;
        }, function (error) {});
    };
    
    
});

app.controller('TestCtrl', ['$scope', 'moment', function ($scope, moment) {
    $scope.datePicker = new Object();
    $scope.datePicker.date = {startDate: null, endDate: null};
    $scope.nowDate = moment().toDate();
    $scope.weekDate = moment().subtract(7, 'days').toDate();
    $scope.mothDate = moment().subtract(1, 'months').toDate();
    $scope.halfYearDate = moment().subtract(6, 'months').toDate();
    $scope.yearDate = moment().subtract(1, 'years').toDate();
    $scope.year5Date = moment().subtract(5, 'years').toDate();
    
    $scope.loadChartModel($scope.mothDate, $scope.nowDate);
    
    $scope.datePicker.options = {
        eventHandlers: {'apply.daterangepicker': function(ev, picker) {$scope.loadChartModel( $scope.datePicker.date.startDate.toDate(),
                $scope.datePicker.date.endDate.toDate()) }}
    };
    
 }]);

