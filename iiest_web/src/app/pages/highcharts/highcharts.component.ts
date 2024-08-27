import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import * as Highcharts from 'highcharts';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegisterService } from 'src/app/services/register.service';
import { HighchartDataModalComponent } from 'src/app/pages/modals/highchart-data-modal/highchart-data-modal.component';
import { DepartmentListComponent } from 'src/app/pages/modals/department-list/department-list.component';
import drilldown from 'highcharts/modules/drilldown';
import HighchartsMore from 'highcharts/highcharts-more';
import Scrollbar from 'highcharts/modules/stock'
import HighchartsAccessibility from 'highcharts/modules/accessibility';
// import HighchartsExporting from 'highcharts/modules/exporting';
// import HC_exporting from 'highcharts/modules/export-data';

HighchartsMore(Highcharts);
HighchartsAccessibility(Highcharts);
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

  intervalType: string = '';

  isDataAvilable: boolean = true;

  drilldownData: any = {};

  defaultChartType: string = '';

  isSrcollable: boolean = false; //var for deciding chart is scrollable or not

  events: any = {};

  drillName: string = '';

  loading: boolean = true;

  intervalList: string[] = [];

  chartInstance: any;

  @ViewChild('highchart') highchartRef: any;

  constructor(private modalService: NgbModal,
    private _registerService: RegisterService) { }

  user: any = this._registerService.LoggedInUserData();
  parsedUser = JSON.parse(this.user);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes['chartData'] && changes['chartData'].currentValue) {
      this.selectedChartType = this.chartData.chartType;
      this.defaultChartType = this.chartData.chartType;
      if (this.chartData.showIntervalSelection) {
        this.intervalList = Object.keys(this.chartData.data);
        this.intervalType = this.chartData.selectedInterval;
      }
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
        max: this.isSrcollable ? 10 : null,
        labels: {
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
            click: this.clickEvent,
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
        max: this.isSrcollable ? 10 : null
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
            format: '₹{y:.1f}',
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
        series: this.drilldownData
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
          events: {
            click: this.clickEvent
          }
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
        series: this.drilldownData
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
          events: {
            click: this.clickEvent
          }
        }
      ]
    };
  }

  // -------Pie Drill Down Chart Function---------
  plotPieDrillDownChart() {
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
        series: this.drilldownData
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
        series: this.drilldownData
      }
    };
  }

  ChangeInterval(event: any): void {
    // if (this.chart.drilldown) {
    //   this.chart.drilldown = undefined;
    // }

    // if (this.chart.series) {
    //   console.log(this.highchartRef.chart.drilldownLevels);
    //   console.log(this.chart);
    // }

    // this.chartCallback(this.highchartRef.chart)

    if(this.highchartRef && this.highchartRef.chart){
      let chart = this.highchartRef.chart;
      if(chart.drilldownLevels){
        chart.drillUp();
      }
    }
  
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
    const modalRef = this.modalService.open(HighchartDataModalComponent, { size: 'xl', backdrop: 'static' });
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
        if (this.chartData.isDrilldown) {
          this.plotColumnDrillDownChart();
        } else {
          this.plotColumnChart();
        }
        break;
      case "Line":
        if (this.chartData.isDrilldown) {
          this.plotLineDrillDownChart();
        } else {
          this.plotLineChart();
        }
        break;
      case "Pie":
        if (this.chartData.isDrilldown) {
          this.plotPieDrillDownChart()
        } else {
          this.plotPieChart()
        }
        break;
      case "Area":
        if (this.chartData.isDrilldown) {
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

    if (this.values.length >= 10) {
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

  checkkDrillDown() {
    let data = this.chartData.data;
    if (this.chartData.showIntervalSelection) {
      data = this.chartData.data[this.intervalType];
    }
    if (this.chartData.isDrilldown) {
      this.values = data.map((item: any) => {
        return {
          name: item.name,
          y: item.value,
          drilldown: item.name,
        }
      });
      this.drilldownData = data.map((item: any) => {
        return {
          type: this.selectedChartType.toLocaleLowerCase(),
          name: item.name,
          id: item.name,
          data: item.categories.map((e: any) => [e.name, e.value]),
          point: {
            events: {
              click: this.clickEvent
            }
          }
        }
      });
      this.events = {}
      // this.drilldownData = this.drilldownData.sort((a:any, b:any) => a.name - b.name);
    } else {
      this.values = data.map((item: any) => {
        return {
          name: item.name,
          y: item.value,
        }
      });
    }

  }

  checkNoData() {
    if (this.values.every(value => value === 0)) {
      this.values = [];
      this.isDataAvilable = false;
      return;
    } else {
      this.isDataAvilable = true;
    }
  }

  clickEvent = (e: any) => {
    if(this.chartData.department === 'Assesment And Audit Department'){
      return;
    }
    if (e.point.options.name) {
      if (e.point.options.name === "Retail" || e.point.options.name === "Catering") {
        this.salesCategory = "Fostac";
      } else if (e.point.options.name === "Registration" || e.point.options.name === "State") {
        this.salesCategory = "Foscos";
      } else if (e.point.options.name === "HRA") {
        this.salesCategory = "HRA";
      } else if (e.point.options.name === "Medical") {
        this.salesCategory = "Medical";
      } else if ((e.point.options.name === "NABL") || (e.point.options.name === "Non NABL")) {
        this.salesCategory = "Water Test Report";
      }else if (e.point.options.name === "Khadya Paaln") {
        this.salesCategory = "Khadya Paaln";
      }
    } else if (e.point.category) {
      if (e.point.category === "Retail" || e.point.category === "Catering") {
        this.salesCategory = "Fostac";
      } else if (e.point.category === "Registration" || e.point.category === "State") {
        this.salesCategory = "Foscos";
      } else if (e.point.category === "HRA") {
        this.salesCategory = "HRA";
      } else if (e.point.category === "Medical") {
        this.salesCategory = "Medical";
      } else if ((e.point.category === "NABL") || (e.point.category === "Non NABL")) {
        this.salesCategory = "Water Test Report";
      }else if (e.point.category === "Khadya Paaln") {
        this.salesCategory = "Khadya Paaln";
      }
    }
    let chartData = {
      filterValue: e.point.options.name || e.point.category.toString(),
      salesCategory: this.salesCategory,
      userDept: this.chartData.department,
      interval: this.intervalType,
      chartTitile: this.chartData.chartTitle
    };
    if (chartData.chartTitile === 'Employee Count By Department') {
      this.viewDepartmentData(chartData.filterValue);
      return;
    }
    this.viewChartData(chartData);
  }

  onChartInstance($event: any): void {
    this.chartInstance = $event;
  }

  changeNameFormat(inputStr: string): string {
    const strArr: string[] = inputStr.split('_');
    strArr.forEach((str: string) => str[0].toUpperCase());
    const convertedStr: string = strArr.join(' ');
    return convertedStr;
  }
}