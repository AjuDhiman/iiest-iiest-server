import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as Highcharts from 'highcharts';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegisterService } from 'src/app/services/register.service';
import { HighchartDataModalComponent } from '../modals/highchart-data-modal/highchart-data-modal.component';
import { DepartmentListComponent } from '../modals/department-list/department-list.component';


@Component({
  selector: 'app-highcharts',
  templateUrl: './highcharts.component.html',
  styleUrls: ['./highcharts.component.scss']
})
export class HighchartsComponent implements OnChanges {

  salesCategory: string;
  categories: string[];
  values: number[];

  //------Common variables for chart-----
  @Input() yaxixTitle: string;
  @Input() chartSubCategoryTitle: string;
  chart: Highcharts.Options;
  // ------column chart variables------
  @Input() columnColorShade: any = ['#1a9850', '#1a9862', '#1a9874', '#1a9886', '#1a9898', '#1a9910', '#1a9922', '#1a9934', '#1a9946'];
  @Input() chartData: any;
  // -------line chart Varibles-------

  Highcharts: typeof Highcharts = Highcharts;
  intervalType: string = 'week';
  allEmployees: any;

  constructor(private modalService: NgbModal,
    private _registerService: RegisterService) {}

  loggedInUserData: any = this._registerService.LoggedInUserData();
  loggedInUserData1 = JSON.parse(this.loggedInUserData);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes['chartData'] && this.chartData?.chartType) {
      console.log(1)
      this.plotChart(this.chartData.chartType);
      console.log(this.chartData);
    }
  }

  ChangeInterval(event: any) {
    this.intervalType = event.target.value;
    this.plotChart(this.chartData.chartType);
  }

  // -------Column Chart Function---------
  plotColumnChart() {
    this.chart = {
      chart: {
        type: 'column'
      },
      title: {
        text: this.chartData.chartTitle,
      },
      credits: {
        enabled: false
      },
      xAxis: {
        categories: this.categories,
      },
      yAxis: {
        title: {
          // text: this.yaxixTitle,
        },
      },
      plotOptions: {
        column: {
          colorByPoint: true,
          colors: this.columnColorShade
        },
      },
      series: [
        {
          name: this.chartData.seriesName,
          type: 'column',
          data: this.values ,
          color: '#128c54',
          events: {
            click: (e) => {
              console.log(e);
              if (e.point.category === "retail" || e.point.category === "catering") {
                this.salesCategory = "Fostac";
              } else if (e.point.category === "registration" || e.point.category === "state") {
                this.salesCategory = "Foscos";
              }
              console.log(this.salesCategory);
              this.viewSalesDataProdWise(e.point.category, this.salesCategory, this.loggedInUserData1.department);
            }
          }
        }
      ],
    }
  }

  // -------Line Chart Function---------
  plotLineChart() {
    this.chart = {
      title: {
        text: this.chartData.chartTitle,
      },
      credits: {
        enabled: false,
      },
      xAxis: {
        categories: this.chartData.category
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
          name: this.chartData.seriesName,
          data: this.chartData.data,
          events: {
            click: (e) => {
              console.log(e);
              if (e.point.category === "retail" || e.point.category === "catering") {
                this.salesCategory = "Fostac";
              } else if (e.point.category === "registration" || e.point.category === "state") {
                this.salesCategory = "Foscos";
              }
              console.log(this.salesCategory);
              this.viewSalesDataProdWise(e.point.category, this.salesCategory, this.loggedInUserData1.department);
            }
          }
        },
      ],
    };

  }

  // -------Pie Chart Function---------
  plotPieChart() {
    this.chart = {
      title: {
        text: this.chartData.chartTitle,
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
          data: this.chartData.map((value: any, index: number) => ({
            name: index,
            y: value,
          })),
        }
      ]
    };

  }

  // ---------Area Chart Function---------
  plotAreaChart() {
    this.chart = {
      title: {
        text: this.chartData.chartTitle,
      },
      credits: {
        enabled: false,
      },
      xAxis: {
        categories: this.chartData.category,
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
          name: this.chartData.seriesName,
          data: this.chartData.data,
          events: {
            click: (e) => {
              console.log(e);
              if (e.point.category === "retail" || e.point.category === "catering") {
                this.salesCategory = "Fostac";
              } else if (e.point.category === "registration" || e.point.category === "state") {
                this.salesCategory = "Foscos";
              }
              console.log(this.salesCategory);
              this.viewSalesDataProdWise(e.point.category, this.salesCategory, this.loggedInUserData1.department);
            }
          }
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

  viewDepartmentData(res: any) {
    console.log(res);
    const modalRef = this.modalService.open(DepartmentListComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.department = res;
  }

  viewSalesDataProdWise(res: any, salesCategory: any, userDept: string) {
    const modalRef = this.modalService.open(HighchartDataModalComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.department = res;
    modalRef.componentInstance.salesCategory = salesCategory;
    modalRef.componentInstance.userDept = userDept;
  }

  plotChart(type: string) {
    if(this.chartData.showIntervalSelection){
      this.categories=Object.keys(this.chartData.data[this.intervalType]);
      this.values=Object.values(this.chartData.data[this.intervalType]);
    } else{
      this.categories=Object.keys(this.chartData.data);
      this.values=Object.values(this.chartData.data);
    }
    switch (type) {
      case "column": this.plotColumnChart();
        break;
      case "line": this.plotLineChart();
        break;
      case "pie": this.plotPieChart();
        break;
      case "area": this.plotAreaChart();
    }
  }
}
