(function () {
  "use strict";

  angular
    .module("mnStatisticsNew")
    .controller("mnStatisticsChartFocusDialogController", mnStatisticsChartFocusDialogController)

  function mnStatisticsChartFocusDialogController(mnStatisticsNewService, chartConfig, chartNodes, mnPoller, $scope, mnStatisticsDescriptionService, mnPrepareQuantityFilter, mnTruncateTo3DigitsFilter, $state) {
    var vm = this;

    vm.chartConfig = chartConfig;
    vm.chartNodes = chartNodes;
    vm.onSelectZoom = onSelectZoom;
    vm.selectedZoom = "3600000";
    var unit = Object.keys(mnStatisticsNewService.getStatsUnits(chartConfig.stats))[0];
    activate();

    function onSelectZoom() {
      $scope.$broadcast("reloadStatsPoller");
    }

    function activate() {
      vm.title = mnStatisticsNewService.getStatsTitle(vm.chartConfig.stats);

      new mnPoller($scope, function () {
        return mnStatisticsNewService.getStatsV2(vm.chartConfig, vm.selectedZoom, $state.params.scenarioBucket);
      })
        .subscribe("mnChartData", vm)
        .reloadOnScopeEvent("reloadStatsPoller")
        .cycle();

      $scope.$watch("chartFocusDialogCtl.mnChartData", onChartDataUpdate);
    }

    function onChartDataUpdate(stats) {
      if (!stats) {
        return;
      }

      var chartData = [];
      if (vm.chartConfig.specificStat) {
        angular.forEach(stats[0].data.stats, function (stats, nodeName) {
          chartData.push({
            key: nodeName,
            values: _.map(stats.samples, function (val, i) {
              return {x: stats.timestamps[i], y: val};
            })
          });
        });
      } else {
        angular.forEach(stats, function (resp) {
          var stats = resp.data.stats.aggregate
          chartData.push({
            key: resp.data.statName,
            values: _.map(stats.samples, function (val, i) {
              return {x: stats.timestamps[i], y: val};
            })
          });
        });
      }
      vm.chartApi.updateWithData(chartData);
    }

    function formatValue(d) {
      switch (unit) {
      case "bytes":
        var val = mnPrepareQuantityFilter(d, 1024);
        return [mnTruncateTo3DigitsFilter(d/val[0]), val[1]].join('');
      case "percent":
        return  mnTruncateTo3DigitsFilter(d) + "%";
      default: return d;
      }
    }

    vm.chartOptions = {
      chart: {
        type: 'lineWithFocusChart',
        height: 450,
        legend: {
          align: false,
          rightAlign: false,
        },
        margin : {
          top: 40,
          right: 40,
          bottom: 40,
          left: 40
        },
        xScale: d3.time.scale(),
        focus: {
          xScale: d3.time.scale(),
        },
        duration: 0,
        useInteractiveGuideline: true,
        interpolate: "linear",
        xAxis: {
          showMaxMin: false,
          axisLabel: "",
          tickFormat: function (d) {
            return mnStatisticsNewService.tickMultiFormat(new Date(d));
          }
        },
        x2Axis: {
          showMaxMin: false,
          tickFormat: function (d) {
            return mnStatisticsNewService.tickMultiFormat(new Date(d));
          }
        },
        yAxis: {
          showMaxMin: false,
          axisLabel: "",
          tickFormat: function (d){
            return formatValue(d);
          },
          rotateYLabel: false
        },
        y2Axis: {
          showMaxMin: false,
          tickFormat: function (d){
            return formatValue(d)
          }
        }

      }
    };

  }
})();