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
import { chartData } from 'src/app/utils/config';

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
  empSalesProdWise: any;
  chartData: any;
  deptData: unknown;
  salesData: any;
  topSalesmanData:{salesperson: string, salesAmount:number};
  salesChartData:any;

  constructor(
    private _registerService: RegisterService,
    private store: Store,
    private _getDataService: GetdataService,
  ) { }

  ngOnInit(): void {
    this.getEmployees();
    this.fetchAllFboData()
    this.getProductData();

    this.employees$.subscribe(res => {
      this.data = res;
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
        this.salesChartData = new chartData('column', 'Sales department', 'Sales Count Chart', 'Sales Count', res, true);
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

  fetchAllFboData(): void {
    this._getDataService.getSalesList().subscribe({
      next: (res) => {
        if (res.salesInfo) {
          this.salesData = res.salesInfo.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((elem: any, index: number) => ({ ...elem, serialNumber: index + 1 }));
          console.log(this.salesData);
        }
      },
      error: (err) => {
        let errorObj = err;
        if (errorObj.userError) {
          this._registerService.signout();
        }
      }
    })
  }

  catchDeptCount($event: any) {

    const data:any = {};
    
    $event.forEach((element:any) => {
      data[element.department] = element.count;
    });

    this.deptData = new chartData('column', 'HR department', 'Employee Count By Department', 'Employee Count', data);

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
    // this.salesLoadedSub.unsubscribe();
  }
}