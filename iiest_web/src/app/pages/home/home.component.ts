import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscriber, Subscription, interval } from 'rxjs';
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
  userPendingSales: number;
  userApprovedSales: number;
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
  intervals: any = ['Today'];
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
        data: [65, 59, 80, 81, 56],
        color: '#128c54',
      },
      {
        name: 'Catering',
        type: 'column',
        data: [40, 51, 32, 46, 39],
        color: '#20c997',
      },
    ],
    // colors: ['#15a362', '#33FF57', '#5733FF', '#FF33A3', '#33A3FF'], // Add your desired colors here
  };

  // barxher 1
  barChart1: Highcharts.Options = {
    title: {
      text: 'Sales Chart',
    },
    xAxis: {
      categories: ['Fostac(Retail)', 'Fostac(Catering)', 'Foscos(Registration)', 'Foscos(State)', 'Hygine Audit', 'Membership', 'Events'],
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
        data: [65, 59, 80, 81, 56],
        color: '#128c54',
      }
    ],
    // colors: ['#15a362', '#33FF57', '#5733FF', '#FF33A3', '#33A3FF'], // Add your desired colors here
  };


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
      }
    })
  }

  ChangeInterval(event: any) {
    console.log(event.target.value);
    switch (event.target.value) {
      case '1':
        this.intervals = ['Today'];
        break;
      case '2':
        this.intervals = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        console.log(this.intervals);
        break;
      case '3':
        this.intervals = ['January','February','March','April','May','June',
        'July','August','September','October','November','December'];
        console.log(this.intervals);
        break;
    }
    if (this.barChart.xAxis) {
      // Update the categories property of xAxis
      (this.barChart.xAxis as Highcharts.AxisOptions).categories = this.intervals;

      // Redraw the chart
      Highcharts.chart('chart-container', this.barChart);
    }
  }

  updateCatagort(intervals:any){
    
  }

  ngOnDestroy(): void {
    this.empLoadedSub.unsubscribe();
  }

}
