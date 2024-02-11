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

  chart: Highcharts.Options;

  @Input() chartData: any;

  columnColorShade: any = ['#1a9850', '#1a9862', '#1a9874', '#1a9886', '#1a9898', '#1a9910', '#1a9922', '#1a9934', '#1a9946'];

  categories: string[];

  values: number[];

  salesCategory: string;

  selectedChartType: string;

  Highcharts: typeof Highcharts = Highcharts;

  intervalType: string = 'week';

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
          data: this.values,
          color: '#128c54',
          events: {
            click: (e) => {
              console.log(e)
              if (e.point.category === "retail" || e.point.category === "catering") {
                this.salesCategory = "Fostac";
              } else if (e.point.category === "registration" || e.point.category === "state") {
                this.salesCategory = "Foscos";
              }
              this.viewSalesDataProdWise(e.point.category, this.salesCategory, this.parsedUser.department);
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
              this.viewSalesDataProdWise(e.point.category, this.salesCategory, this.parsedUser.department);
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
              this.viewSalesDataProdWise(e.point.name, this.salesCategory, this.parsedUser.department);
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
              this.viewSalesDataProdWise(e.point.category, this.salesCategory, this.parsedUser.department);
            }
          }
        },
      ],
    };
  }

  ChangeInterval(event: any): void {
    this.intervalType = event.target.value;
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

  viewSalesDataProdWise(res: any, salesCategory: any, userDept: string): void {
    const modalRef = this.modalService.open(HighchartDataModalComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.department = res;
    modalRef.componentInstance.salesCategory = salesCategory;
    modalRef.componentInstance.userDept = userDept;
  }

  plotChart() {
    if (this.chartData.showIntervalSelection) {
      this.categories = Object.keys(this.chartData.data[this.intervalType]);
      this.values = Object.values(this.chartData.data[this.intervalType]);
    } else {
      this.categories = Object.keys(this.chartData.data);
      this.values = Object.values(this.chartData.data);
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
  }
}
