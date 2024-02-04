import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as Highcharts from 'highcharts';
import { UtilitiesService } from 'src/app/services/utilities.service';
// import {} from 'highcharts-angular';


@Component({
  selector: 'app-highcharts',
  templateUrl: './highcharts.component.html',
  styleUrls: ['./highcharts.component.scss']
})
export class HighchartsComponent implements OnInit, OnChanges {

  //------Common variables for chart-----
  @Input() chartType: string;
  @Input() ChartTitle: string;
  @Input() yaxixTitle: string;
  @Input() chartSubCategoryTitle: string;
  chart: Highcharts.Options;
  // ------column chart variables------
  @Input() columnColorShade: any = ['#1a9850', '#1a9862', '#1a9874', '#1a9886', '#1a9898', '#1a9910', '#1a9922', '#1a9934', '#1a9946'];
  @Input() columnChartCategory: any = [];
  @Input() columnChartData: any = [];
  // -------line chart Varibles-------
  @Input() lineChartData: any = [];
  @Input() lineChartSeriesTitle: string;
  @Input() lineChartStartPoint: number;

  Highcharts: typeof Highcharts = Highcharts;
  datas: any = [1, 2, 3, 4];
  //New Variables
  intervals: any = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  intervalType: string = 'week';
  @Input() chartData: Highcharts.Options;
  allEmployees: any;

  ngOnInit(): void {
    this.plotChart(this.chartType);
  }

  // fetchAllEmployees(): void {
  //   this.allEmployees = this._utililitesService.getData();
  //   if(this.allEmployees.length === 0){
  //       this.getEmployees();
  //       this.employees$.subscribe(res => {
  //         this.allEmployees = res;
  //       })
  //   }
  // }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes['columnChartData']) {
      this.plotChart(this.chartType);
    }
  }

  ChangeInterval(event: any) {
    this.intervalType = event.target.value;
    console.log(this.intervalType);
    switch (this.intervalType) {
      case 'today':
        this.intervals = ['Today'];
        break;
      case 'week':
        this.intervals = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        break;
      case 'year':
        this.intervals = ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'];
        break;
    }
  }

  // -------Column Chart Function---------
  plotColumnChart() {
    this.chart = {
      title: {
        text: this.ChartTitle,
      },
      credits: {
        enabled: false
      },
      xAxis: {
        categories: this.columnChartCategory,
      },
      yAxis: {
        title: {
          text: this.yaxixTitle,
        },
      },
      plotOptions: {
        column: {
          colorByPoint: true,
          colors: this.columnColorShade,
          events: {
            click: (e) => {
              console.log(e)
            }
          }
        },
      },
      series: [
        {
          type: 'column',
          data: this.columnChartData,
          color: '#128c54'
        }
      ],
    }
  }

  // -------Line Chart Function---------
  plotLineChart() {
    this.chart = {

      title: {
        text: this.ChartTitle,
        align: 'left'
      },

      credits: {
        enabled: false
      },

      subtitle: {
        text: this.chartSubCategoryTitle,
        align: 'left'
      },

      yAxis: {
        title: {
          text: this.yaxixTitle
        }
      },

      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle'
      },

      plotOptions: {
        series: {
          label: {
            connectorAllowed: false
          },
          pointStart: this.lineChartStartPoint
        }
      },

      series: [{
        name: this.lineChartSeriesTitle,
        data: this.lineChartData,
        type: "line"
      }],

      responsive: {
        rules: [{
          condition: {
            maxWidth: 500
          },
          chartOptions: {
            legend: {
              layout: 'horizontal',
              align: 'center',
              verticalAlign: 'bottom'
            }
          }
        }]
      }
    }
  }

  // -------Pie Chart Function---------
  plotPieChart() {
    this.chart = {
      chart: {
        type: 'pie'
      },
      title: {
        text: 'Pie Graph'
      },
      tooltip: {
        valueSuffix: '%'
      },
      subtitle: {
        text: 'General pie data'
      },
      plotOptions: {
        series: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: [{
            enabled: true,
            // distance: 20
          }, {
            enabled: true,
            // distance: -40,
            format: '{point.percentage:.1f}%',
            style: {
              fontSize: '1.2em',
              textOutline: 'none',
              opacity: 0.7
            },
            filter: {
              operator: '>',
              property: 'percentage',
              value: 10
            }
          }]
        }
      },
      series: [
        {
          type: 'pie',
          name: 'Percentage',
          // colorByPoint: true,
          data: [
            {
              name: 'Water',
              y: 55.02
            },
            {
              name: 'Fat',
              sliced: true,
              y: 26.71
            },
            {
              name: 'Carbohydrates',
              y: 1.09
            },
            {
              name: 'Protein',
              y: 15.5
            },
            {
              name: 'Ash',
              y: 1.68
            }
          ]
        }
      ]
    }
  }

  // ---------Donut Chart Function---------
  plotDonutChart() {
    this.chart = {
      chart: {
        type: 'pie'
      },
      title: {
        text: this.ChartTitle,
        align: 'left'
      },
      subtitle: {
        text: this.chartSubCategoryTitle,
        align: 'left'
      },
      plotOptions: {
        pie: {
          shadow: false,
          center: ['50%', '50%']
        }
      },
      tooltip: {
        valueSuffix: '%'
      },
      series: [{
        name: 'Browsers',
        // data: browserData,
        size: '45%',
        dataLabels: {
          color: '#ffffff',
          distance: '-50%'
        },
        type: "pie"
      },
      {
        name: 'Versions',
        // data: versionsData,
        size: '80%',
        innerSize: '60%',
        dataLabels: {
          format: '<b>{point.name}:</b> <span style="opacity: 0.5">{y}%</span>',
          filter: {
            property: 'y',
            operator: '>',
            value: 1
          },
          style: {
            fontWeight: 'normal'
          }
        },
        type: "pie",
        id: 'versions'
      }],
      responsive: {
        rules: [{
          condition: {
            maxWidth: 400
          },
          chartOptions: {
            // series: [{
            //   id: 'versions',
            //   dataLabels: {
            //     distance: 10,
            //     format: '{point.custom.version}',
            //     filter: {
            //       property: 'percentage',
            //       operator: '>',
            //       value: 2
            //     }
            //   }
            // }]
          }
        }]
      }
    }
  }

  ChangeProduct() {
    //  switch(){

    //  }
  }

  UpdateData(Series: any, data: Number[]) {

  }

  // for second type of sales chart
  ChangeInterval1(event: any) {
    //   var today = new Date();

    //   switch (event.target.value) {
    //     case 'week':
    //       var currentDayOfWeek = today.getDay();
    //       var difference = currentDayOfWeek - 0; // 0 is Sunday
    //       today.setDate(today.getDate() - difference);

    //       for (var i = 0; i <= currentDayOfWeek; i++) {
    //           console.log("Day of the week:", today.toDateString());
    //           today.setDate(today.getDate() + 1);
    //       }
    //       break;

    //   case 'month':
    //       var currentDayOfMonth = today.getDate();
    //       today.setDate(1);

    //       while (today.getDate() <= currentDayOfMonth) {
    //           console.log("Day of the month:", today.toDateString());
    //           today.setDate(today.getDate() + 1);
    //       }
    //       break;

    //   case 'year':
    //       var currentDayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    //       today = new Date(today.getFullYear(), 0, 1);

    //       while (Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)) <= currentDayOfYear) {
    //           console.log("Day of the year:", today.toDateString());
    //           today.setDate(today.getDate() + 1);
    //       }
    //       break;

    //   default:
    //       console.log("Invalid type. Use 'week', 'month', or 'year'.");
    //       break;
    //   }
  }

  chartTypeEvent(event: any) {
    this.plotChart(event.target.value);
  }

  plotChart(type:string) {
    switch (type) {
      case "column": this.plotColumnChart();
        break;
      case "line": this.plotLineChart();
        break;
      case "pie": this.plotPieChart();
        break;
      case "donut": this.plotDonutChart();
    }
  }
}
