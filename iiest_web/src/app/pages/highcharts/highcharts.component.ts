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
  @Input() chartCategories: any = [];
  @Input() chartData: any = [];
  // -------line chart Varibles-------
  @Input() lineChartData: any = [];
  @Input() lineChartSeriesTitle: string;
  @Input() lineChartStartPoint: number;

  Highcharts: typeof Highcharts = Highcharts;
  datas: any = [1, 2, 3, 4];
  //New Variables
  intervals: any = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  intervalType: string = 'week';
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
    if (changes && changes['chartData']) {
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
        categories: this.chartCategories,
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
          data: this.chartData,
          color: '#128c54'
        }
      ],
    }
  }

  // -------Line Chart Function---------
  plotLineChart() {
    this.chart =  {
      title: {
        text: this.ChartTitle,
      },
      credits: {
        enabled: false,
      },
      xAxis: {
        categories: this.chartCategories,
      },
      yAxis: {
        title: {
          text: this.yaxixTitle,
        },
      },
      plotOptions: {
        line: {
          marker: {
            enabled: true,
          },
        },
      },
      series: [
        {
          type: 'line',
          name: 'Your Line Name',
          data: this.chartData,
        },
      ],
    };

  }

  // -------Pie Chart Function---------
  plotPieChart() {
    this.chart = {
      title: {
        text: this.ChartTitle,
      },
      credits: {
        enabled: false,
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
          },
          showInLegend: true,
        },
      },
      series: [
        {
          type: 'pie',
          data:  this.chartData.map((value:any, index:number) => ({
            name: this.chartCategories[index],
            y: value,
          })),
        }
      ]
    };
  
  }

  // ---------Donut Chart Function---------
  plotDonutChart() {
    this.chart = {
      title: {
        text: this.ChartTitle,
      },
      credits: {
        enabled: false,
      },
      xAxis: {
        categories: this.chartCategories,
      },
      yAxis: {
        title: {
          text: this.yaxixTitle,
        },
      },
      plotOptions: {
        area: {
          marker: {
            enabled: false, // Disable markers on data points
          },
        },
      },
      series: [
        {
          type: 'area',
          name: 'Your Area Name',
          data: this.chartData,
        },
      ],
    };
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
