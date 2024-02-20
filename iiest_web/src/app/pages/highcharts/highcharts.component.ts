import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as Highcharts from 'highcharts';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegisterService } from 'src/app/services/register.service';
import { HighchartDataModalComponent } from '../modals/highchart-data-modal/highchart-data-modal.component';
import { DepartmentListComponent } from '../modals/department-list/department-list.component';
import { chartData } from 'src/app/utils/config';

@Component({
  selector: 'app-highcharts',
  templateUrl: './highcharts.component.html',
  styleUrls: ['./highcharts.component.scss'],
})
export class HighchartsComponent implements OnChanges {

  chart: Highcharts.Options;

  @Input() chartData: chartData;

  // columnColorShade: any = ['#1a9850', '#1a9862', '#1a9874', '#1a9886', '#1a9898', '#1a9910', '#1a9922', '#1a9934', '#1a9946'];

  categories: string[];

  values: number[];

  salesCategory: string;

  selectedChartType: string;

  Highcharts: typeof Highcharts = Highcharts;

  intervalType: string = 'week';

  noData: string = `<div>No data avilable </div> this ${this.intervalType}`;

  isDataAvilable: boolean = true;

  constructor(private modalService: NgbModal,
    private _registerService: RegisterService) { }

  user: any = this._registerService.LoggedInUserData();
  parsedUser = JSON.parse(this.user);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes['chartData'] && this.chartData?.chartType) {
      this.selectedChartType = this.chartData.chartType;
      if (changes && changes['chartData']) {
        this.plotChart();
      }
    }
  }

  // -------Column Chart Function---------
  plotColumnChart() {
    this.chart = {
      chart: {
        type: 'column',
      },
      title: {
        text: this.chartData.chartTitle,
      },
      credits: {
        enabled: false
      },
      xAxis: {
        labels: {
          style: {
            width: 70, // Set a fixed width for the labels
            overflow: 'hidden', // Hide overflow text
            textOverflow: 'ellipsis'
          }
        },
        scrollbar: {
          enabled: true
        },
        categories: this.categories,
        tickLength: 0
      },
      yAxis: {
        title: {
          // text: this.yaxixTitle,
        }
      },
      plotOptions: {
        column: {
          colorByPoint: true,
          // colors: this.columnColorShade
          dataLabels: {
            enabled: true,
            align: 'center',
            verticalAlign: 'top',
            inside: false,
            color: 'black',
            style: {
              textOutline: 'none'
            }
          }
        },
      },
      series: [
        {
          name: this.chartData.seriesName,
          type: 'column',
          data: this.values,
          color: '#128c54',
          events: {
            click: (e) => {
              console.log(e);
              if (e.point.category === "retail" || e.point.category === "catering") {
                this.salesCategory = "Fostac";
              } else if (e.point.category === "registration" || e.point.category === "state") {
                this.salesCategory = "Foscos";
              }
              this.viewSalesDataProdWise(e.point.category, this.salesCategory, this.parsedUser.department, this.intervalType);
            }
          }
        }
      ],
    }
    console.log(this.chart);
  }

  // --------Column Drill Down Chart--------
  plotDrillDownChart() {
    this.chart = {
      chart: {
        type: 'column'
      },
      title: {
        text: 'Main Chart'
      },
      xAxis: {
        type: 'category'
      },
      yAxis: {
        title: {
          text: 'Values'
        }
      },
      series: [{
        type: 'column',
        name: 'Main',
        data: [{
          name: 'Category 1',
          y: 100,
          drilldown: 'category1'
        }, {
          name: 'Category 2',
          y: 200,
          drilldown: 'category2'
        }]
      }],
      drilldown: {
        series: [{
          type: 'column',
          id: 'category1',
          name: 'Category 1',
          data: [
            ['Subcategory 1.1', 50],
            ['Subcategory 1.2', 50]
          ]
        }, {
          type: 'column',
          id: 'category2',
          name: 'Category 2',
          data: [
            ['Subcategory 2.1', 100],
            ['Subcategory 2.2', 100]
          ]
        }]
      }
    };
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
        categories: this.categories
      },
      yAxis: {
        title: {
          // text: this.yaxixTitle,
        },
        min: 0
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
          data: this.values,
          events: {
            click: (e) => {
              if (e.point.category === "retail" || e.point.category === "catering") {
                this.salesCategory = "Fostac";
              } else if (e.point.category === "registration" || e.point.category === "state") {
                this.salesCategory = "Foscos";
              }
              this.viewSalesDataProdWise(e.point.category, this.salesCategory, this.parsedUser.department, this.intervalType);
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
          data: this.values.map((value: any, index: number) => ({
            name: this.categories[index],
            y: value,
          })),
          events: {
            click: (e: any) => {
              if (e.point.name === "retail" || e.point.name === "catering") {
                this.salesCategory = "Fostac";
              } else if (e.point.name === "registration" || e.point.name === "state") {
                this.salesCategory = "Foscos";
              }
              this.viewSalesDataProdWise(e.point.name, this.salesCategory, this.parsedUser.department, this.intervalType);
            }
          }
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
        categories: this.categories,
      },
      yAxis: {
        title: {
          // text: this.yaxixTitle,
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
          data: this.values,
          events: {
            click: (e) => {
              if (e.point.category === "retail" || e.point.category === "catering") {
                this.salesCategory = "Fostac";
              } else if (e.point.category === "registration" || e.point.category === "state") {
                this.salesCategory = "Foscos";
              }
              this.viewSalesDataProdWise(e.point.category, this.salesCategory, this.parsedUser.department, this.intervalType);
            }
          }
        },
      ],
    };
  }

  ChangeInterval(event: any): void {
    this.intervalType = event.target.value;
    // if (this.chart.lang) this.chart.lang.noData = `<div>No data avilable </div> this ${this.intervalType}`;
    this.plotChart();
  }

  chartTypeEvent(event: any): void {
    this.selectedChartType = event.target.value;
    this.plotChart();
  }

  viewDepartmentData(res: any): void {
    const modalRef = this.modalService.open(DepartmentListComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.department = res;
  }

  viewSalesDataProdWise(res: any, salesCategory: any, userDept: string, intervalType: string): void {
    const modalRef = this.modalService.open(HighchartDataModalComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.department = res;
    modalRef.componentInstance.salesCategory = salesCategory;
    modalRef.componentInstance.userDept = userDept;
    modalRef.componentInstance.intervalType = intervalType;
  }

  plotChart() {

    if (this.chartData.showIntervalSelection) {
      this.categories = Object.keys(this.chartData.data[this.intervalType]);
      this.values = Object.values(this.chartData.data[this.intervalType]);
    } else {
      this.categories = Object.keys(this.chartData.data);
      this.values = Object.values(this.chartData.data);
      console.log(this.values);
    }
    if (this.values.every(value => value === 0)) {
      this.values = [];
      this.isDataAvilable = false;
      return;
    } else {
      this.isDataAvilable = true;
    }

    switch (this.selectedChartType) {
      case "column": this.plotColumnChart();
        break;
      case "line": this.plotLineChart();
        break;
      case "pie": this.plotPieChart();
        break;
      case "area": this.plotAreaChart();
    }

    console.log(this.chart.lang);
  }

  // onWindowResize($event:WindowEventHandlers){
  //   this.plotChart();
  // }

  formatIntervalType(type: string): string {
    switch (type) {
      case 'halfYearly':
        return 'this Half Year'
        break;
      case 'tillNow':
        return 'Till Now'
        break;
      default:
        return `this ${type}`
    }
  }

}
