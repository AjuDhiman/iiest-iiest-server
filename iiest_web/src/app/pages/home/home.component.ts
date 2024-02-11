import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscriber, Subscription, interval, skipLast } from 'rxjs';
import { GetdataService } from 'src/app/services/getdata.service';
import { GetEmployee } from 'src/app/store/actions/employee.action';
import { Employee } from '../../utils/registerinterface';
import { EmployeeState } from 'src/app/store/state/employee.state';
import { RegisterService } from 'src/app/services/register.service';
import { faIndianRupeeSign } from '@fortawesome/free-solid-svg-icons';
import { chartData } from 'src/app/utils/config';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit, OnDestroy {

  //User Related variables
  empName: String;
  empDepartment: String;
  empDesigantion: string;
  projectType: string;

  //store related variables
  employees: Employee;
  @Select(EmployeeState.GetEmployeeList) employees$: Observable<Employee>;
  @Select(EmployeeState.employeeLoaded) employeeLoaded$: Observable<boolean>
  empLoadedSub: Subscription;
  msg: Subscription;
  data: any;

  //product table related variables
  fssaiData: any;
  dpiitData: any;

  //icons
  faIndianRupeeSign = faIndianRupeeSign;

  // chart objects
  deptData: chartData;
  salesChartData: chartData;
  areaSalesChartData: chartData;
  empHiringChartData: chartData;

  //condtional variables
  isNameVisible: boolean = true;
  isChartDataAvailable: boolean = true;
  dnone: boolean = true;

  constructor(
    private _registerService: RegisterService,
    private store: Store,
    private _getDataService: GetdataService,
  ) { }

  ngOnInit(): void {

    //these two methords belongs to employee redux store by the help of then we want to collec data all the employees and save it to the store
    this.getEmployees();

    this.employees$.subscribe(res => {
      this.data = res;
    })

    //this function collects basic data reted to user 
    this.getUserBasicData();

    let timeout = setTimeout(() => {
      this.isNameVisible = false;
    }, 5000);

    //we want to call these methord foer a specific department because they calss apis by which we want to send data to highcahrts and we are showing diffrent highcharts for diffrent departments
    if (this.empDepartment === 'Sales Department' || this.empDepartment === 'IT Department' || this.empDesigantion === 'Director') {

      this.getSalesCountData();

      this.getAreaSalesChartData();

    }

    if (this.empDepartment === 'HR Department' || this.empDepartment === 'IT Department' || this.empDesigantion === 'Director') {

      this.getEmpHiringChartData();

    }

    //this function is for collecting data related to product table
    this.getProductData();
  }

  getEmployees() {
    this.empLoadedSub = this.employeeLoaded$.subscribe(loadedEmployee => {
      if (!loadedEmployee) {
        this.store.dispatch(new GetEmployee());
      }
    })
  }

  // fetchAllFboData(): void {
  //   this._getDataService.getSalesList().subscribe({
  //     next: (res) => {
  //       if (res.salesInfo) {
  //         this.salesData = res.salesInfo.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((elem: any, index: number) => ({ ...elem, serialNumber: index + 1 }));
  //       }
  //     },
  //     error: (err) => {
  //       let errorObj = err;
  //       if (errorObj.userError) {
  //         this._registerService.signout();
  //       }
  //     }
  //   })
  // }

  getUserBasicData() {
    let loggedInUserData: any = this._registerService.LoggedInUserData();
    loggedInUserData = JSON.parse(loggedInUserData)
    this.projectType = loggedInUserData.project_name;
    this.empName = loggedInUserData.employee_name;
    this.empDepartment = loggedInUserData.department;
    this.empDesigantion = loggedInUserData.designation;
    const message = interval(2000);
    this.msg = message.subscribe((res) => {
      if (res >= 2) {
        this.dnone = false;
        this.msg.unsubscribe()
      }
    })
  }

  //function for getting chart data by the help of apis starts

  catchDeptCount($event: any) {
    const data: any = {};

    $event.forEach((element: any) => {
      data[element.department] = element.count;
    });

    this.deptData = new chartData('column', 'HR department', 'Employee Count By Department', 'Employee Count', data);
  }

  getSalesCountData() {
    this._getDataService.getEmpSalesProdWise().subscribe({
      next: res => {
        this.salesChartData = new chartData('column', 'Sales department', 'Sales Count Chart', 'Sales Count', res, true);
      }
    })
  }

  getAreaSalesChartData() {
    let stateCounts = {}
    this._getDataService.getSalesList().subscribe({
      next: res => {
        console.log(res);
        stateCounts = res.salesInfo.reduce((counts: any, item: any) => {
          if (item.fboInfo) {
            const district = item.fboInfo.district;
            counts[district] = counts[district] ? counts[district] + 1 : 1;
          }
          return counts;
        }, {});

        this.areaSalesChartData = new chartData('pie', 'Sales Department', 'Sales Chart Area Wise', 'Sales Count', stateCounts)
      }
    });
  }

  getEmpHiringChartData() {
    this._getDataService.getEmpHiringData().subscribe({
      next: res => {
        let data: any = {};
        if (res.employeeHiringData.length > 0) {
          res.employeeHiringData.forEach((item: any) => {
            data[item._id.department] = item.count;
          })
        } else {
          this.isChartDataAvailable = false;
        }
        this.empHiringChartData = new chartData('line', 'Sales department', 'Hiring Chart', 'Employee Count', data);
      }
    })
  }

  //function for getting chart data by the help of apis ends
  getProductData() {
    this._getDataService.getProductData().subscribe({
      next: (res) => {
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