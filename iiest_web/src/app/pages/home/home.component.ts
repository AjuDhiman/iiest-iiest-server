import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscriber, Subscription, interval, skipLast } from 'rxjs';
import { GetdataService } from 'src/app/services/getdata.service';
import { GetEmployee } from 'src/app/store/actions/employee.action';
import { Employee } from '../../utils/registerinterface';
import { EmployeeState } from 'src/app/store/state/employee.state';
import { RegisterService } from 'src/app/services/register.service';
import { faIndianRupeeSign } from '@fortawesome/free-solid-svg-icons';

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
  isNameVisible:boolean=true;
  // departmentAndCount:object;
  faIndianRupeeSign = faIndianRupeeSign;
  @Select(EmployeeState.GetEmployeeList) employees$: Observable<Employee>;
  @Select(EmployeeState.employeeLoaded) employeeLoaded$: Observable<boolean>
  empLoadedSub: Subscription;
  msg: Subscription;
  dnone: boolean = true;
  projectType: any;
  categories = ['fostac(Retail)', 'fostac(Catering)', 'foscos(Registration)', 'foscos(State)'];
  chartData:Highcharts.Options ={
    credits: {
      enabled: false
    },
    series: [
      {
        type: 'line',
        data: [20,23,67,87,90],
      },
    ],
    colors: ['#15a362', '#33FF57', '#5733FF', '#FF33A3', '#33A3FF'], // Add your desired colors here
  };
  barChart1: Highcharts.Options = {
    title: {
      text: 'Sales Chart',
    },
    xAxis: {
      categories: this.categories,
    },
    yAxis: {
      title: {
        text: 'Sales',
      },
    },
    plotOptions: {
      column: {
        colorByPoint: true,
        colors: ['#1a9850', '#66bd63', '#a6d96a', '#d9ef8b'], // Shades of green
      },
    },
    series: [
      {
        type: 'column',
        data: [20, 50, 79, 22],
        color: '#128c54',
      },
    ],
  };
  constructor(
    private _registerService: RegisterService,
    private store: Store,
    private _getDataService: GetdataService,
  ) { }
  ngOnInit(): void {
    this.getEmployees();
    this.getProductData();
    // this.getEmployeeCountByDept();
    this.employees$.subscribe(res => {
      this.data = res;
    })
    let loggedInUserData: any = this._registerService.LoggedInUserData();
    loggedInUserData = JSON.parse(loggedInUserData)
    this.projectType = loggedInUserData.project_name;
    this.empName = loggedInUserData.employee_name;
    const message = interval(2000);
    this.msg = message.subscribe((res) => {
      if (res >= 2) {
        this.dnone = false;
        this.msg.unsubscribe()
      }
    })

    let timeout = setTimeout(()=>{
      this.isNameVisible=false;
    }, 5000);
  }

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
        this.product = res;
        this.fssaiData = res.FSSAI;
        this.dpiitData = res.DPIIT;
      },
      error: (err) => {
      }
    }
    )
  }

  ngOnDestroy(): void {
    this.empLoadedSub.unsubscribe();
  }

}
