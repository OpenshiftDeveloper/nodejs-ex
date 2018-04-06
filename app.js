
app = angular.module("app", ["chart.js", "angularMoment", 'ngMaterial', 'ngMessages']);
app.controller("ChartCtrl", function ($scope, $http) {    
    $scope.datasetOverride = [{yAxisID: 'y-axis-1'}, {yAxisID: 'y-axis-2'}];
    $scope.options = {
        tooltips: {
           mode: "index",
           intersect: false
        },
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

app.controller('DateCtrl', ['$scope', 'moment', function ($scope, moment) {
        preparePresetDates($scope);

        $scope.datePicker = new Object();
        $scope.datePicker.date = {startDate: $scope.monthDate, endDate: $scope.nowDate};

        updateChartOnDateChange($scope, moment);
        setChartInitialDates($scope);

        $scope.startDate = $scope.yearDate;
        $scope.endDate = $scope.nowDate;

    }]);

function  setChartInitialDates($scope) {
    $scope.datePicker.date.startDate = $scope.monthDate;
    $scope.datePicker.date.endDate = $scope.nowDate;
}

function  preparePresetDates($scope) {
    $scope.nowDateMoment = moment().utc().startOf('day');
    $scope.nowDate = $scope.nowDateMoment.clone().toDate();
    $scope.latestDate = moment().utc().subtract(1, 'days').toDate();

    $scope.weekDate = $scope.nowDateMoment.clone().subtract(6, 'days').toDate();
    $scope.monthDate = $scope.nowDateMoment.clone().subtract(1, 'months').toDate();
    $scope.halfYearDate = $scope.nowDateMoment.clone().subtract(6, 'months').toDate();
    $scope.yearDate = $scope.nowDateMoment.clone().subtract(1, 'years').toDate();
    $scope.year2Date = $scope.nowDateMoment.clone().subtract(2, 'years').toDate();
    $scope.year5Date = $scope.nowDateMoment.clone().subtract(5, 'years').toDate();
    $scope.earliestDate = moment("2015-01-01").utc().endOf('day').utc().toDate();
}

function  updateChartOnDateChange($scope, moment) {  
    $scope.$watch('startDate', function () {
        $scope.loadChartModel(adjustTheStartDateToUtcDayStart($scope.startDate, moment),
                $scope.endDate);
    }, true);

    $scope.$watch('endDate', function () {                    
        $scope.loadChartModel($scope.startDate,
                 adjustTheEndDateToUtcDayEnd($scope.endDate, moment));                 
    }, true);
}

function  adjustTheStartDateToUtcDayStart(startDate, moment) {  
    return moment(startDate).add(moment().utcOffset(), "minutes").utc().startOf('day').toDate()
}

function  adjustTheEndDateToUtcDayEnd(endDate, moment) {  
    return moment(endDate).utc().endOf('day').toDate();
}

app.controller('InfoCtrl', ['$scope', '$mdDialog', function ($scope, $mdDialog) {
        $scope.showInfo = function (ev) {
            // Appending dialog to document.body to cover sidenav in docs app
            var confirm = $mdDialog.alert()
                    .title('What do you see on the chart?')
                    .textContent('The chart shows bitcoin price (USD) compared with how much people search for the term "bitcoin" on Google.\n\
 The bitcoin price (blue) is fetched from CoinDesk. The search interest (grey) is fetched from Google Trends. The search interest numbers represent interest relative to the highest point on the chart for the given time in percents. The times are in the UTC time zone.')
                    .ok('Ok')
            $mdDialog.show(confirm).then(function () {
            }, function () {
            });
        };
    }]);


