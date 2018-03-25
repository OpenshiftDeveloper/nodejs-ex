
app = angular.module("app", ["chart.js", "daterangepicker", "angularMoment", 'ngMaterial', 'ui.bootstrap']);
app.controller("ChartCtrl", function ($scope, $http) {
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
                endTime: endTime}
        }).then(function (response) {
            chartModel = response.data;
            $scope.labels = chartModel.labels;
            $scope.series = chartModel.series;
            $scope.data = chartModel.data;
        }, function (error) {});
    };




});

app.controller('DateCtrl', ['$scope', 'moment', '$mdDialog', function ($scope, moment, $mdDialog) {

        $scope.nowDate = moment().utc().startOf('day');
        $scope.latestDate = moment().utc().subtract(1, 'days');

        $scope.weekDate = $scope.nowDate.clone().subtract(6, 'days');
        $scope.monthDate = $scope.nowDate.clone().subtract(1, 'months');
        $scope.halfYearDate = $scope.nowDate.clone().subtract(6, 'months');
        $scope.yearDate = $scope.nowDate.clone().subtract(1, 'years');
        $scope.year2Date = $scope.nowDate.clone().subtract(2, 'years');
        $scope.year5Date = $scope.nowDate.clone().subtract(5, 'years');       
        $scope.earliestDate = moment("2015-01-01").utc().endOf('day').utc();

        $scope.datePicker = new Object();
        $scope.datePicker.date = {startDate: $scope.monthDate, endDate: $scope.nowDate};

        $scope.$watchCollection('datePicker', function () {
            $scope.datePicker.date.startDate.add(moment().utcOffset(), "minutes").utc().startOf('day');            
            $scope.datePicker.date.endDate.endOf('day');
            $scope.loadChartModel($scope.datePicker.date.startDate.toDate(),
                    $scope.datePicker.date.endDate.toDate());
        }, true);
    }]);

app.controller('InfoCtrl', ['$scope', '$mdDialog', function ($scope, $mdDialog) {
        $scope.showInfo = function (ev) {
            // Appending dialog to document.body to cover sidenav in docs app
            var confirm = $mdDialog.alert()
                    .title('What do you see on the chart?')
                    .textContent('The chart shows bitcoin price (USD) compared with how much people search for the term "bitcoin" on Google.\n\
 The bitcoin price is fetched from coindesk.com. The search interest is fetched from trends.google.com. The search interest numbers represent interest relative to the highest point on the chart for the given time in percents. The times are in the UTC time zone.')
                    .ok('Ok')
            $mdDialog.show(confirm).then(function () {
            }, function () {
            });
        };
    }]);


