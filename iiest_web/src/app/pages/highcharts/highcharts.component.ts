import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as Highcharts from 'highcharts';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegisterService } from 'src/app/services/register.service';
import { HighchartDataModalComponent } from '../modals/highchart-data-modal/highchart-data-modal.component';
import { DepartmentListComponent } from '../modals/department-list/department-list.component';
import drilldown from 'highcharts/modules/drilldown';
import HighchartsMore from 'highcharts/highcharts-more';
// import HighchartsExporting from 'highcharts/modules/exporting';
// import HC_exporting from 'highcharts/modules/export-data';

HighchartsMore(Highcharts);
// HighchartsExporting(Highcharts);
// HC_exporting(Highcharts);
drilldown(Highcharts);


import * as HighchartsScroll from 'highcharts/highstock'; // Import the scrollbar module/

@Component({
  selector: 'app-highcharts',
  templateUrl: './highcharts.component.html',
  styleUrls: ['./highcharts.component.scss'],
})
export class HighchartsComponent implements OnChanges {

  chart: Highcharts.Options;

  @Input() chartData: any = {};

  categories: string[];

  values: number[];

  salesCategory: string;

  selectedChartType: string;

  Highcharts: typeof Highcharts = Highcharts;

  intervalType: string  = '';

  noData: string = `<div>No data avilable </div> this ${this.intervalType}`;

  isDataAvilable: boolean = true;

  otherChartTypes: any;

  drillDownInfo: any = {};

  drilldownData: any = {};

  defaultChartType: string = '';

  events: any = {};

  constructor(private modalService: NgbModal,
    private _registerService: RegisterService) { }

  user: any = this._registerService.LoggedInUserData();
  parsedUser = JSON.parse(this.user);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes['chartData'] && changes['chartData'].currentValue) {
      this.selectedChartType = this.chartData.chartType;
      this.defaultChartType = this.chartData.chartType;
      this.plotChart();
      // this.otherChartTypes = this.chartData.otherChartTypeOptions;
    }
  }

  // -------Column Chart Function---------
  plotColumnChart() {
    this.chart = {
      chart: {
        type: 'column',
        spacingBottom: -5,
      },
      title: {
        text: undefined
      },
      credits: {
        enabled: false
      },
     xAxis: {
        type: 'category',
      },
      yAxis: {
        title: {
          text: this.chartData.yAxisTitle
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
      scrollbar: {
        enabled: true
      },
      series: [
        {
          name: this.chartData.seriesName,
          type: 'column',
          data: this.values,
          events: {
            click: this.clickEvent
          }
        }
      ]
    }
  }

  // --------Column Drill Down Chart--------
  plotColumnDrillDownChart() {
    this.chart = {
      chart: {
        type: 'column',
        spacingBottom: -5,
      },
      title: {
        text: undefined
      },
      credits: {
        enabled: false
      },
     xAxis: {
        type: 'category',
      },
      yAxis: {
        title: {
          text: this.chartData.yAxisTitle
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
      scrollbar: {
        enabled: true
      },
      series: [
        {
          name: this.chartData.seriesName,
          type: 'column',
          data: this.values,
          events: {
            click: () => {

            }
          }
        }
      ],
      drilldown: {
        breadcrumbs: {
          position: {
            x: 13,
            y: -48
          }
        },
        series : this.drilldownData
      }
    }
  }

  // -------Line Chart Function---------
  plotLineChart() {
    this.chart = {
      chart: {
        // ---------Edit chart spacing---------
        spacingBottom: -5,
      },
      title: {
        text: undefined
      },
      credits: {
        enabled: false,
      },
      xAxis: {
        type: 'category'
      },
      yAxis: {
        title: {
          text: this.chartData.yAxisTitle
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
        },
      ],
      drilldown: {
        breadcrumbs: {
          position: {
            x: 13,
            y: -48
          }
        },
        series : this.drilldownData
      }
    };
  }

  // -------Pie Chart Function---------
  plotPieChart() {
    this.chart = {
      chart: {
        // ---------Edit chart spacing---------
        spacingBottom: -5,
      },
      title: {
        text: undefined
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
            format: '<b>{point.name}</b>: {point.y}',
          },
          showInLegend: true,
        },
      },
      yAxis: {
        title: {
          text: null
        }
      },
      series: [
        {
          name: this.chartData.seriesName,
          type: 'pie',
          data: this.values,
          events: this.events
        }
      ],
      drilldown: {
        breadcrumbs: {
          position: {
            x: 13,
            y: -48
          }
        },
        series : this.drilldownData
      }
    };
  }

  // ---------Area Chart Function---------
  plotAreaChart() {
    this.chart = {
      chart: {
        // ---------Edit chart spacing---------
        spacingBottom: -5,
        // spacingTop: 10,
        // spacingLeft: 10,
        // spacingRight: 10,
      },
      credits: {
        enabled: false,
      },
      xAxis: {
        type: 'category'
      },
      yAxis: {
        title: {
          text: this.chartData.yAxisTitle
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
        },
      ],
      drilldown: {
        breadcrumbs: {
          position: {
            x: 13,
            y: -48
          }
        },
        series : this.drilldownData
      }
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

  viewChartData(res: any): void {
    const modalRef = this.modalService.open(HighchartDataModalComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.chartData = res;
  }

  plotChart() {

    this.initializeChartData();

    if (this.values.every(value => value === 0)) {
      this.values = [];
      this.isDataAvilable = false;
      return;
    } else {
      this.isDataAvilable = true;
    }

    // if(this.chartData.isDrillDown){
      
    // }

    switch (this.selectedChartType) {
      case "Column": 
        if(this.chartData.isDrilldown) {
          this.plotColumnDrillDownChart();
        } else {
          this.plotColumnChart();
        }
        break;
      case "Line": this.plotLineChart();
        break;
      case "Pie": this.plotPieChart();
        break;
      case "Area": this.plotAreaChart();
        break;
    }
  }

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

  initializeChartData() {
    
    this.checkkDrillDown();

    this.checkNoData();

  }

  checkkDrillDown(){
    if (this.chartData.isDrilldown) {
      // this.categories = this.chartData.data.map((item: any) => item.name);
      this.values = this.chartData.data.map((item: any) => {
        return {
          name: item.name,
          y: item.value,
          drilldown: item.name
        }
      });
      // this.values = this.values.sort((a:any ,b: any) => a.y - b.y);
      this.drilldownData = this.chartData.data.map((item: any) => {
        return {
          type: this.selectedChartType.toLocaleLowerCase(),
          name: item.name,
          id: item.name,
          data: item.categories.map((e: any) => [e.name, e.value]),
          point: {
            events: {
              click : this.clickEvent
            }
          }
        }
      });
      this.events = {}
      // this.drilldownData = this.drilldownData.sort((a:any, b:any) => a.name - b.name);
    } else {
      this.values = this.chartData.data.map((item: any) => {
        return {
          name: item.name,
          y: item.value, 
        }
      });
    }

  }

  checkNoData(){
    if (this.values.every(value => value === 0)) {
      this.values = [];
      this.isDataAvilable = false;
      return;
    } else {
      this.isDataAvilable = true;
    }
  }

  clickEvent = (e:any) => {
    if(e.point.options.name){
      if (e.point.options.name === "Retail" || e.point.options.name === "Catering") {
        this.salesCategory = "Fostac";
      } else if (e.point.options.name === "Registration" || e.point.options.name === "State") {
        this.salesCategory = "Foscos";
      }
    } else if(e.point.category){
      if (e.point.category === "Retail" || e.point.category === "Catering") {
        this.salesCategory = "Fostac";
      } else if (e.point.category === "Registration" || e.point.options.name === "State") {
        this.salesCategory = "Foscos";
      }
    }
    let chartData = {
      filterValue: e.point.options.name || e.point.category.toString() ,
      salesCategory: this.salesCategory,
      userDept: this.parsedUser.department, 
      interval: this.intervalType,
      chartTitile: this.chartData.chartTitle
    };
    if(chartData.chartTitile === 'Employee Count By Department') {
      this.viewDepartmentData(chartData.userDept);
      return;
    }
    this.viewChartData(chartData);
  }
}