import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscriber, Subscription, interval, skipLast } from 'rxjs';
import { GetdataService } from 'src/app/services/getdata.service';
import { GetEmployee } from 'src/app/store/actions/employee.action';
import { Employee, sales } from '../../utils/registerinterface';
import { EmployeeState } from 'src/app/store/state/employee.state';
import { RegisterService } from 'src/app/services/register.service';
import { faIndianRupeeSign } from '@fortawesome/free-solid-svg-icons';
import { SalesState } from 'src/app/store/state/sales.state';
import { GetSales } from 'src/app/store/actions/sales.action';

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
  isChartDataAvailable: boolean = true;
  faIndianRupeeSign = faIndianRupeeSign;
  @Select(EmployeeState.GetEmployeeList) employees$: Observable<Employee>;
  @Select(EmployeeState.employeeLoaded) employeeLoaded$: Observable<boolean>
  @Select(SalesState.GetSalesList) sales$:Observable<sales>;
  @Select(SalesState.salesLoaded) salesLoaded$:Observable<boolean>
  empLoadedSub: Subscription;
  salesLoadedSub: Subscription;
  msg: Subscription;
  dnone: boolean = true;
  projectType: any;
  departmentCount: any = [];
  empSalesProdWise: any;
  chartData: any;
  deptData: any;
  salesChartcategories: any;
  departmentList = [];
  salesChartData: any;
  empSalesProdkey: string[];
  empHiringChartData: any;
  salesData: any;

  constructor(
    private _registerService: RegisterService,
    private store: Store,
    private _getDataService: GetdataService,
  ) { }

  ngOnInit(): void {
    this.getEmployees();
    this.getProductData();
    this.employees$.subscribe(res => {
      this.data = res;
    })
    this.sales$.subscribe(res => {
      this.salesData=res;
      console.log(res);
    })
    console.log(this.chartData);

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
        // console.log(this.salesChartcategories);
        this.empSalesProdWise = Object.values(res); // this convert into array
        this.empSalesProdkey = Object.keys(res); // this convert into array
        this.salesChartData = this.getSalesChartData(this.empSalesProdWise, this.empSalesProdkey);
      }
    })

    this._getDataService.getEmpHiringData().subscribe({
      next: res => {
        if (res.employeeHiringData.length > 0) {
          const dept = res.employeeHiringData.map((item: any) => item._id.department);
          const count = res.employeeHiringData.map((item: any) => item.count);
          this.empHiringChartData = this.getEmpHiringData(dept, count);
        } else {
          this.isChartDataAvailable = false;
        }
      }
    })
  }

  getSalesChartData(response: any, reskey: any) {
    let chartData = [{
      chartType: 'column',
      department: 'Sales Department',
      chartTitle: 'Employee Sales Chart',
      category: reskey,
      seriesName: 'Sales Count',
      data: response
    }]
    return chartData;
  }

  getEmployees() {
    this.empLoadedSub = this.employeeLoaded$.subscribe(loadedSales => {
      if (!loadedSales) {
        this.store.dispatch(new GetSales());
      }
    })
  }

  getSales() {
    this.salesLoadedSub = this.salesLoaded$.subscribe(loadedEmployee => {
      if (!loadedEmployee) {
        this.store.dispatch(new GetEmployee());
      }
    })
  }

  getEmpHiringData(dept: any, count: any) {
    this.empHiringChartData = [{
      chartType: 'line',
      chartTitle: 'Hiring Chart',
      category: dept,
      seriesName: 'Employee Count',
      data: count
    }]
    console.log(this.empHiringChartData);
    return this.empHiringChartData;
  }

  catchDeptCount($event: any) {
    const dept = $event.map((item: any) => item.department);
    const count = $event.map((item: any) => item.count);

    this.deptData = [{
      chartType: 'column',
      chartTitle: 'Active Employee',
      category: dept,
      seriesName: 'Employee Count',
      data: count
    }]
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