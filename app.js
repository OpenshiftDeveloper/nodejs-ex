app = angular.module("app", ["chart.js", "daterangepicker", "angularMoment", 'ngMaterial']);
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

        $scope.nowDate = moment();
        $scope.weekDate = moment().subtract(7, 'days');
        $scope.monthDate = moment().subtract(1, 'months');
        $scope.halfYearDate = moment().subtract(6, 'months');
        $scope.yearDate = moment().subtract(1, 'years');
        $scope.year5Date = moment().subtract(5, 'years');

        $scope.datePicker = new Object();
        $scope.datePicker.date = {startDate: $scope.monthDate, endDate: $scope.nowDate};

        $scope.$watchCollection('datePicker', function () {
            $scope.loadChartModel($scope.datePicker.date.startDate.toDate(),
                    $scope.datePicker.date.endDate.toDate());
        }, true);
    }]);

app.controller('InfoCtrl', ['$scope', '$mdDialog', function ($scope, $mdDialog) {
        $scope.showConfirm = function (ev) {
            // Appending dialog to document.body to cover sidenav in docs app
            var confirm = $mdDialog.confirm()
                    .title('What do you see on the chart?')
                    .textContent('All of the banks have agreed to forgive you your debts.')
                    .ariaLabel('Lucky day')
                    .targetEvent(ev)
                    .ok('Ok')


            $mdDialog.show(confirm).then(function () {
                $scope.status = 'You decided to get rid of your debt.';
            }, function () {
                $scope.status = 'You decided to keep your debt.';
            });
        };
    }]);


