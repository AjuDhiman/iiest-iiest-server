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
  empDepartment: String;
  product: any;
  fssaiData: any;
  dpiitData: any;
  isNameVisible: boolean = true;
  // departmentAndCount:object;
  faIndianRupeeSign = faIndianRupeeSign;
  @Select(EmployeeState.GetEmployeeList) employees$: Observable<Employee>;
  @Select(EmployeeState.employeeLoaded) employeeLoaded$: Observable<boolean>
  empLoadedSub: Subscription;
  msg: Subscription;
  dnone: boolean = true;
  projectType: any;
  departmentCount: any = [];
  empSalesProdWise: any = [];
  categories = ['fostac(Retail)', 'fostac(Catering)', 'foscos(Registration)', 'foscos(State)'];
  departmentList = ['Asmt. & Audit', 'Business Dev.', 'Finance', 'HR', 'IT', 'Research', 'Resource', 'Sales', 'Training'];

  // chartData: Highcharts.Options = {
  //   credits: {
  //     enabled: false
  //   },
  //   series: [
  //     {
  //       type: 'line',
  //       data: [20, 23, 67, 87, 90],
  //     },
  //   ],
  //   colors: ['#15a362', '#33FF57', '#5733FF', '#FF33A3', '#33A3FF'], // Add your desired colors here
  // };

  salesChart: Highcharts.Options;

  empChart: Highcharts.Options = {
    title: {
      text: 'Employee Chart',
    },
    xAxis: {
      categories: this.departmentList,
    },
    yAxis: {
      title: {
        text: 'No. Of Employees',
      },
    },
    plotOptions: {
      column: {
        colorByPoint: true,
        colors: ['#1a9850', '#1a9862', '#1a9874', '#1a9886', '#1a9898', '#1a9910', '#1a9922', '#1a9934', '#1a9946'], // Shades of green
      },
    },
    series: [
      {
        type: 'column',
        data: [2, 3, 4, 5, 6, 7, 8, 9, 10],
        color: '#128c54',
      },
    ],
  };

  constructor(
    private _registerService: RegisterService,
    private store: Store,
    private _getDataService: GetdataService,
  ) {}

  ngOnInit(): void {
    this.getEmployees();
    this.getProductData();
    this.employees$.subscribe(res => {
      this.data = res;
    })

    let loggedInUserData: any = this._registerService.LoggedInUserData();
    loggedInUserData = JSON.parse(loggedInUserData)
    this.projectType = loggedInUserData.project_name;
    this.empName = loggedInUserData.employee_name;
    this.empDepartment = loggedInUserData.department;
    const message = interval(2000);
    this.msg = message.subscribe((res) => {
      if (res >= 2) {
        this.dnone = false;
        this.msg.unsubscribe()
      }
    })

    let timeout = setTimeout(() => {
      this.isNameVisible = false;
    }, 5000);

    this._getDataService.getEmpSalesProdWise().subscribe({
      next: res => {
        this.empSalesProdWise = Object.values(res); // this convert into array
        this.salesChart = {
          credits: {
            enabled: false
          },
          title: {
            text: 'Sales Chart',
          },
          xAxis: {
            categories: this.categories,
          },
          yAxis: {
            title: {
              text: 'Sales Count',
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
              data: this.empSalesProdWise,
              color: '#128c54',
            },
          ],
        };
      }
    })
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