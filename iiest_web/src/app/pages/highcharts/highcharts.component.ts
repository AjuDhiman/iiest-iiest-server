import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as Highcharts from 'highcharts';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegisterService } from 'src/app/services/register.service';
import { HighchartDataModalComponent } from '../modals/highchart-data-modal/highchart-data-modal.component';
import { DepartmentListComponent } from '../modals/department-list/department-list.component';
import drilldown from 'highcharts/modules/drilldown';
import HighchartsMore from 'highcharts/highcharts-more';
import Scrollbar from 'highcharts/modules/stock'
// import HighchartsExporting from 'highcharts/modules/exporting';
// import HC_exporting from 'highcharts/modules/export-data';

HighchartsMore(Highcharts);
// HighchartsExporting(Highcharts);
// HC_exporting(Highcharts);
drilldown(Highcharts);
Scrollbar(Highcharts);

@Component({
  selector: 'app-highcharts',
  templateUrl: './highcharts.component.html',
  styleUrls: ['./highcharts.component.scss'],
})
export class HighchartsComponent implements OnChanges {

  Highcharts: typeof Highcharts = Highcharts;

  chart: Highcharts.Options;

  @Input() chartData: any = {};

  categories: string[];

  values: number[];

  salesCategory: string;

  selectedChartType: string;

  intervalType: string  = '';

  isDataAvilable: boolean = true;

  drilldownData: any = {};

  defaultChartType: string = '';

  isSrcollable: boolean = false; //var for deciding chart is scrollable or not

  events: any = {};

  drillName: string = '';

  loading: boolean = true;

  constructor(private modalService: NgbModal,
    private _registerService: RegisterService) { }

  user: any = this._registerService.LoggedInUserData();
  parsedUser = JSON.parse(this.user);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes['chartData'] && changes['chartData'].currentValue) {
      this.selectedChartType = this.chartData.chartType;
      this.defaultChartType = this.chartData.chartType;
      this.plotChart();
      this.loading = false;
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
        max: this.isSrcollable?10:null,
        labels :{
          style: {
            width: 60,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }
        }
      },
      yAxis: {
        title: {
          text: this.chartData.yAxisTitle
        }
      },
      plotOptions: {
        column: {
          colorByPoint: true,
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
        enabled: this.isSrcollable,
        height: 5
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
        max: this.isSrcollable?10:null
      },
      yAxis: {
        title: {
          text: this.chartData.yAxisTitle
        }
      },
      plotOptions: {
        column: {
          colorByPoint: true,
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
        enabled: this.isSrcollable
      },
      series: [
        {
          name: this.chartData.seriesName,
          type: 'column',
          data: this.values,
          events: {
            click: () => {

            },
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
        type: 'category',
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
          type: 'line',
          name: this.chartData.seriesName,
          data: this.values,
        },
      ]
    };
  }

  // --------Line Drill Down Chart--------
  plotLineDrillDownChart() {
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
        type: 'category',
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
      ]
    };
  }

  // -------Pie Drill Down Chart Function---------
  plotPieDrillDownChart(){
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
            enabled: true,
          },
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
          type: 'area',
          name: this.chartData.seriesName,
          data: this.values,
        },
      ]
    };
  }

  // -------Area Drill Down Chart Function---------
  plotAreaDrillDownChart() {
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
      },
      plotOptions: {
        area: {
          marker: {
            enabled: true,
          },
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

    this.chart = {}

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
      case "Line":
        if(this.chartData.isDrilldown) {
          this.plotLineDrillDownChart();
        } else {
          this.plotLineChart();
        }
        break;
      case "Pie": 
        if(this.chartData.isDrilldown) {
          this.plotPieDrillDownChart()
        } else {
          this.plotAreaChart()
        }
        break;
      case "Area": 
        if(this.chartData.isDrilldown){
          this.plotAreaDrillDownChart()
        } else {
          this.plotAreaChart();
        }
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

    if(this.values.length >=10 ) {
      this.isSrcollable = true;
    } else {
      this.isSrcollable = false;
    }

    // if(this.chartData.isDrilldown){
    //   if(this.drilldownData.data.length >=10 ) {
    //     this.isSrcollable = true;
    //   } else {
    //     this.isSrcollable = false;
    //   }
    // }

  }

  checkkDrillDown(){
    if (this.chartData.isDrilldown) {
      this.values = this.chartData.data.map((item: any) => {
        return {
          name: item.name,
          y: item.value,
          drilldown: item.name,
        }
      });
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
      this.viewDepartmentData(chartData.filterValue);
      return;
    }
    this.viewChartData(chartData);
  }
}