import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscriber, Subscription, interval, skipLast } from 'rxjs';
import { GetdataService } from 'src/app/services/getdata.service';
import { GetEmployee } from 'src/app/store/actions/employee.action';
import { Employee } from '../../utils/registerinterface';
import { EmployeeState } from 'src/app/store/state/employee.state';
import { RegisterService } from 'src/app/services/register.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { faIndianRupeeSign } from '@fortawesome/free-solid-svg-icons';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  employees: Employee;
  genericData: any;
  data: any;
  empName: String;
  product: any;
  fssaiData: any;
  dpiitData: any;
  userTotalSales: number;
  overallSalesCount: number;
  userPendingSales: number;
  userApprovedSales: number;
  pendingSalesCount: number;
  approvedSalesCount: number;
  faIndianRupeeSign = faIndianRupeeSign;
  @Select(EmployeeState.GetEmployeeList) employees$: Observable<Employee>;
  @Select(EmployeeState.employeeLoaded) employeeLoaded$: Observable<boolean>
  empLoadedSub: Subscription;
  msg: Subscription;
  dnone: boolean = true;
  projectType: any;
  Highcharts: typeof Highcharts = Highcharts;
  datas: any = [1, 2, 3, 4];
  //New Variables
  intervals: any =  ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  cateringSale: any[] = [88,78,98,120,140,123,111];
  retailSale: any[] = [34,88,55,33,55,32,90];
  constructor(
    private _registerService: RegisterService,
    private store: Store,
    private _utilitiesService: UtilitiesService,
    private _getDataService: GetdataService,

  ) { }
  ngOnInit(): void {
    this.getEmployees();
    this.getProductData();
    this.getUserRecord();
    this.employees$.subscribe(res => {
      this.data = res;
      console.log(this.data)
    })
    let loggedInUserData: any = this._registerService.LoggedInUserData();
    loggedInUserData = JSON.parse(loggedInUserData)
    this.projectType = loggedInUserData.project_name;
    console.log(this.projectType)
    this.empName = loggedInUserData.employee_name;
    const message = interval(2000);
    this.msg = message.subscribe((res) => {
      if (res >= 2) {
        this.dnone = false;
        this.msg.unsubscribe()
      }
    })
  }

  barChart: Highcharts.Options = {
    title: {
      text: 'Sales Chart',
    },
    xAxis: {
      categories: this.intervals,
    },
    yAxis: {
      title: {
        text: 'Values',
      },
    },
    series: [
      {
        name: 'Retail',
        type: 'column',
        data: this.retailSale,
        color: '#128c54',
      },
      {
        name: 'Catering',
        type: 'column',
        data: this.cateringSale,
        color: '#20c997',
      },
    ],
    // colors: ['#15a362', '#33FF57', '#5733FF', '#FF33A3', '#33A3FF'], // Add your desired colors here
  };

  // barxher 1
  // barChart1: Highcharts.Options = {
  //   title: {
  //     text: 'Sales Chart',
  //   },
  //   xAxis: {
  //     categories: ['Fostac(Retail)', 'Fostac(Catering)', 'Foscos(Registration)', 'Foscos(State)', 'Hygine Audit', 'Membership', 'Events'],
  //   },
  //   yAxis: {
  //     title: {
  //       text: 'Values',
  //     },
  //   },
  //   series: [
  //     {
  //       name: 'Retail',
  //       type: 'column',
  //       data: [65, 59, 80, 81, 56],
  //       color: '#128c54',
  //     }
  //   ],
  //   // colors: ['#15a362', '#33FF57', '#5733FF', '#FF33A3', '#33A3FF'], // Add your desired colors here
  // };


  //High charts
  chartOptions: Highcharts.Options = {
    credits: {
      enabled: false
    },
    series: [
      {
        type: 'line',
        data: this.datas,
      },
    ],
    colors: ['#15a362', '#33FF57', '#5733FF', '#FF33A3', '#33A3FF'], // Add your desired colors here
  };
  getEmployees() {
    this.empLoadedSub = this.employeeLoaded$.subscribe(loadedEmployee => {
      if (!loadedEmployee) {
        this.store.dispatch(new GetEmployee());
      }
    })
  }

  getProductData() {
    this._getDataService.getProductData().subscribe({
      next: (res) => {
        console.log(res)
        this.product = res;
        this.fssaiData = res.FSSAI;
        this.dpiitData = res.DPIIT;
        console.log(this.fssaiData);
        console.log(this.dpiitData);
      },
      error: (err) => {
      }
    }
    )
  }

  getUserRecord() {
    this._getDataService.getUserRecord().subscribe({
      next: (res) => {
        this.userTotalSales = res.overAllSales;
        this.userPendingSales = res.pendingSales;
        this.userApprovedSales = res.approvedSales;
        this.pendingSalesCount = res.pendingSalesCount;
        this.approvedSalesCount = res.approvedSalesCount;
        this.overallSalesCount = res.overallSalesCount;
      }
    })
  }

  ChangeInterval(event: any) {
    console.log(event.target.value);
    switch (event.target.value) {
      case '1':
        this.intervals = ['Today'];
        this.retailSale = [34];
        this.cateringSale = [88];
        break;
      case '2':
        this.intervals = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        this.retailSale = [34,88,55,33,55,32,90];
        this.cateringSale = [88,78,98,120,140,123,111];
        break;
      case '3':
        this.intervals = ['January','February','March','April','May','June',
        'July','August','September','October','November','December'];
        this.retailSale = [34,88,55,33,55,32,90,88,0,8,23,45];
        this.cateringSale = [88,78,98,120,140,123,111,34,56,78,90,123];
        break;
    }

    // Update the xAxis categories
    const xAxisOptions = this.barChart.xAxis as Highcharts.XAxisOptions;
    xAxisOptions.categories = this.intervals;
    this.barChart.series = [
      {
        name: 'Retail',
        type: 'column',
        data: this.retailSale, // Replace with the actual data for 'Retail'
        color: '#128c54',
      },
      {
        name: 'Catering',
        type: 'column',
        data: this.cateringSale, // Replace with the actual data for 'Catering'
        color: '#20c997',
      },
    ];
    this.Highcharts.charts[1]?.update(this.barChart, true);
  }
  

  ngOnDestroy(): void {
    this.empLoadedSub.unsubscribe();
  }

}
