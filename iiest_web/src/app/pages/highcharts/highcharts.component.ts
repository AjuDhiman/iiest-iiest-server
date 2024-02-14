import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as Highcharts from 'highcharts';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegisterService } from 'src/app/services/register.service';
import { HighchartDataModalComponent } from '../modals/highchart-data-modal/highchart-data-modal.component';
import { DepartmentListComponent } from '../modals/department-list/department-list.component';
import { chartData } from 'src/app/utils/config';
import noData from 'highcharts/modules/no-data-to-display';

// Initialize the noData module
noData(Highcharts);

@Component({
  selector: 'app-highcharts',
  templateUrl: './highcharts.component.html',
  styleUrls: ['./highcharts.component.scss']
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

  noData: string =  'NO data to show';

  noDataStyle: any =  {
    fontWeight: 'bold',
    fontSize: '15px',
    color: '#303030'
  };

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
        categories: this.categories,
      },
      yAxis: {
        title: {
          // text: this.yaxixTitle,
        },
      },
      lang: {
        noData: '<div>No data avilable </div>',
      },
      noData: {
        style: {
          fontSize: '20px',
          color: '#967921',
          fontWeight: '400',
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          padding: '10px', 
          borderRadius: 5,
        },
      },
      plotOptions: {
        column: {
          colorByPoint: true,
          // colors: this.columnColorShade
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
      lang: {
        noData: '<div>No data avilable </div>',
      },
      noData: {
        style: {
          fontSize: '20px',
          color: '#967921',
          fontWeight: '400',
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          padding: '10px', 
          borderRadius: 5,
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
      lang: {
        noData: '<div>No data avilable </div>',
      },
      noData: {
        style: {
          fontSize: '20px',
          color: '#967921',
          fontWeight: '400',
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          padding: '10px', 
          borderRadius: 5,
        },
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
      lang: {
        noData: '<div>No data avilable </div>',
      },
      noData: {
        style: {
          fontSize: '20px',
          color: '#967921',
          fontWeight: '400',
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          padding: '10px', 
          borderRadius: 5,
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
    }

    if (this.values.every((item: number) => item == 0)) {
      this.noData = 'NO data to show';
      this.noDataStyle = {
        fontWeight: 'bold',
        fontSize: '15px',
        color: '#303030'
      }
    } else {
      this.noData = ''
    }
   if(this.values.every(value => value === 0)){
    this.values=[];
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

  // myFunction(): void {
  //   if (this.chart.series) {
  //       if ((this.chart.series[0] as any).data.every((item: number) => Number(item) === 0)) {
  //           this.chart.renderer.rect(
  //               this.chart.plotLeft + (this.chart.plotWidth - 400) / 2,
  //               this.chart.plotTop + (this.chart.plotHeight - 50) / 2,
  //               400,
  //               50,
  //               3
  //           )
  //               .attr({
  //                   'fill': '#fff3cd'
  //               })
  //               .add();
  //           this.chart.renderer.text('No data to display!', this.chart.plotLeft + (this.chart.plotWidth - 400) / 2 + 400 / 2, this.chart.plotTop + (this.chart.plotHeight - 50) / 2 + 30)
  //               .attr({
  //                   'text-anchor': 'middle',
  //                   'fill': '#cab475',
  //                   'font-size': '20px',
  //               })
  //               .add();
  //       }
  //   }
  // }

}
