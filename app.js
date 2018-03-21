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
    
    $scope.nowDate = moment();
    $scope.weekDate = moment().subtract(7, 'days');
    $scope.monthDate = moment().subtract(1, 'months');
    $scope.halfYearDate = moment().subtract(6, 'months');
    $scope.yearDate = moment().subtract(1, 'years');
    $scope.year5Date = moment().subtract(5, 'years');
    
    $scope.datePicker = new Object();
    $scope.datePicker.date = {startDate: $scope.monthDate, endDate: $scope.nowDate};
   
    $scope.$watchCollection('datePicker', function() {
        $scope.loadChartModel( $scope.datePicker.date.startDate.toDate(),
                $scope.datePicker.date.endDate.toDate());
    }, true);

    
 }]);

