import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscriber, Subscription, interval, skipLast } from 'rxjs';
import { GetdataService } from 'src/app/services/getdata.service';
import { GetEmployee } from 'src/app/store/actions/employee.action';
import { Employee } from '../../utils/registerinterface';
import { EmployeeState } from 'src/app/store/state/employee.state';
import { RegisterService } from 'src/app/services/register.service';
import { faIndianRupeeSign } from '@fortawesome/free-solid-svg-icons';
import { chartData, salesManagerRoles, salesOfficersRoles } from 'src/app/utils/config';

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
  salesPersonChartData: chartData;

  //condtional variables
  isNameVisible: boolean = true;
  isChartDataAvailable: boolean = true;
  dnone: boolean = true;

  //others
  salesData: any;
  topSalesman: any = {};

  //roles arrays
  salesOfficersRoles = salesOfficersRoles;

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

      // this.getAreaSalesChartData();
      this.fetchAllSalesData();

    }

    if (this.empDepartment === 'HR Department' || this.empDepartment === 'IT Department' || this.empDesigantion === 'Director') {

      this.getEmpHiringChartData();

    }

    if(salesManagerRoles.includes(this.empDesigantion)){

      this.getEmployeeUnderManager()

    }

    //this function is for collecting data related to product table
    this.getProductData();
  }

  getEmployees(): void {
    this.empLoadedSub = this.employeeLoaded$.subscribe(loadedEmployee => {
      if (!loadedEmployee) {
        this.store.dispatch(new GetEmployee());
      }
    })
  }

  getUserBasicData(): void {
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

  //function for statcards



  //function for getting chart data by the help of apis starts
  getSalesPersonSalesData(sales:any) {
    console.log(sales)
    sales.forEach((sale: any) => {
      if(sale.employeeInfo){
        const employee = sale.employeeInfo.employee_name;

        const grandTotal = Number(sale.grand_total);
  
        if (this.topSalesman.hasOwnProperty(employee)) {
          this.topSalesman[employee] += grandTotal;
        } else {
          this.topSalesman[employee] = grandTotal ;
        }
      }
      
    });
    this.salesPersonChartData = new chartData('column', 'Director', 'Employee Sales Chart','sales', this.topSalesman, false);
  }

  catchDeptCount($event: any): void {
    const data: any = {};

    $event.forEach((element: any) => {
      data[element.department] = element.count;
    });

    this.deptData = new chartData('column', 'HR department', 'Employee Count By Department', 'Employee Count', data);
  }

  getSalesCountData(): void {
    this._getDataService.getEmpSalesProdWise().subscribe({
      next: res => {
        this.salesChartData = new chartData('column', 'Sales department', 'Sales Count Chart', 'Sales Count', res, true, ['pie']);
      }
    })
  }

  getAreaSalesChartData(res: any): void {
    let stateCounts = {}
    stateCounts = res.salesInfo.reduce((counts: any, item: any) => {
      if (item.fboInfo) {
        const state = item.fboInfo.state;
        counts[state] = counts[state] ? counts[state] + 1 : 1;
      }
      return counts;
    }, {});
    this.areaSalesChartData = new chartData('pie', 'Sales Department', 'Sales Chart Area Wise', 'Sales Count', stateCounts, false, ['column']);
  }

  getEmployeeSalesData(sales:any){
      
  }

  getEmployeeUnderManager(){
    this._getDataService.getEmployeeUnderManager().subscribe({
      next: res => {
        console.log(res);
        
      }
    })
  }

  getEmpHiringChartData(): void {
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
  getProductData(): void {
    this._getDataService.getProductData().subscribe({
      next: (res) => {
        this.fssaiData = res.FSSAI;
        this.dpiitData = res.DPIIT;
      },
      error: (err) => {
        console.log(err);
      }
    }
    )
  }

  fetchAllSalesData(): void {
    this._getDataService.getSalesList().subscribe({
      next: res => {
        console.log(res);
        this.getAreaSalesChartData(res);
        this.getSalesPersonSalesData(res.salesInfo);
      }
    });
  }

  ngOnDestroy(): void {
    this.empLoadedSub.unsubscribe();
    // this.salesLoadedSub.unsubscribe();
  }
}