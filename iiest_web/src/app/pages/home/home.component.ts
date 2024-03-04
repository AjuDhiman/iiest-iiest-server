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
  productSalesChartData: chartData;
  areaSalesChartData: chartData;
  monthSalesChartData: chartData;
  clientTypeChartData: chartData;
  empHiringChartData: chartData;
  salesPersonChartData: chartData;

  //condtional variables
  isNameVisible: boolean = false;
  isChartDataAvailable: boolean = false;
  dnone: boolean = true;
  loading: boolean = true;

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

    //this function collects basic data reted to user 
    this.getUserBasicData();

    //these two methords belongs to employee redux store by the help of then we want to collec data all the employees and save it to the store
    this.getEmployees();

    this.employees$.subscribe(res => {
      this.data = res;
    });

    this.getProductSaledata();
    this.getAreaWiseSaleData();
    this.getMonthWisesaleData();
    this.getPersonWiseSaleData();
    this.getClientTypeSaleData();
    this.getEmpHiringData();

    if (salesManagerRoles.includes(this.empDesigantion)) {
      this.getEmployeeUnderManager()
    }

    //------this function is for collecting data related to product table-------
    this.getProductData();
  }

  getEmployees(): void {
    this.empLoadedSub = this.employeeLoaded$.subscribe(loadedEmployee => {
      if (!loadedEmployee) {
        this.store.dispatch(new GetEmployee());
      }
    })
  }

  //methord for Getting basic information about user from session by the help of utility services
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

  //functions for fetching data from backend and passing them to highcharts
  getProductSaledata() {
    this._getDataService.getProductSaledata().subscribe({
      next: res => {
        const chartType = 'column';
        const department = 'Sales Department';
        const chartTitle = 'Product Sales Chart';
        const seriesName = 'Products';
        const yAxisTitle = 'SalesCcount';
        const data = res;
        const showIntervalSelection = false;
        const isDrillDown = true;
        this.productSalesChartData = new chartData(chartType, department, chartTitle, seriesName, yAxisTitle, data, isDrillDown, showIntervalSelection);
      }
    });
  }

  getAreaWiseSaleData() {
    this._getDataService.getAreaWiseSaleData().subscribe({
      next: res => {
        const chartType = 'pie';
        const department = 'Sales Department';
        const chartTitle = 'Area Wise Sales Chart';
        const seriesName = 'States';
        const yAxisTitle = 'Sales Count';
        const data = res;
        const showIntervalSelection = false;
        const isDrillDown = true;
        const otherChartTypeOptions = ['column']
        this.areaSalesChartData = new chartData(chartType, department, chartTitle, seriesName, yAxisTitle, data, isDrillDown, showIntervalSelection);
        this.loading = false;
      }
    });
  }
  
  getMonthWisesaleData(){
    this._getDataService.getMonthWisesaleData().subscribe({
      next: res => {
        const chartType = 'column';
        const department = 'Sales Department';
        const chartTitle = 'Sales Chart';
        const seriesName = 'sales';
        const yAxisTitle = 'SalesCcount';
        const data = res;
        const showIntervalSelection = false;
        const isDrillDown = true;
        this.monthSalesChartData = new chartData(chartType, department, chartTitle, seriesName, yAxisTitle, data, isDrillDown, showIntervalSelection);
      }
    });
  }

  getPersonWiseSaleData(){
    this._getDataService.getPersonWiseSaleData().subscribe({
      next: res => {
        const chartType = 'column';
        const department = 'Director';
        const chartTitle = 'Employee Sales Chart';
        const seriesName = 'Employee Sales';
        const yAxisTitle = '';
        const data = res;
        const showIntervalSelection = false;
        const isDrillDown = false;
        const otherChartTypeOptions = ['']
        this.salesPersonChartData = new chartData(chartType, department, chartTitle, seriesName, yAxisTitle, data, isDrillDown, showIntervalSelection);
      }
    });
  }

  getClientTypeSaleData(){
    this._getDataService.getClientTypeSaleData().subscribe({
      next: res => {
        const chartType = 'column';
        const department = 'Sales department';
        const chartTitle = 'Customer Type Chart';
        const seriesName = 'Employee Sales';
        const yAxisTitle = 'Sales Count';
        const data = res;
        const showIntervalSelection = false;
        const isDrillDown = false;
        const otherChartTypeOptions = ['']
        this.clientTypeChartData = new chartData(chartType, department, chartTitle, seriesName, yAxisTitle, data, isDrillDown, showIntervalSelection);
      }
    });
  }

  getEmpHiringData(){
    this._getDataService.getEmpHiringData().subscribe({
      next: res => {
        this.isChartDataAvailable = true;
        const chartType = 'column';
        const department = 'HR Department';
        const chartTitle = 'Customer Type Chart';
        const seriesName = 'Hiring Performance Chart';
        const yAxisTitle = 'Department';
        const data = res;
        const showIntervalSelection = false;
        const isDrillDown = false;
        const otherChartTypeOptions = ['']
        this.empHiringChartData = new chartData(chartType, department, chartTitle, seriesName, yAxisTitle, data, isDrillDown, showIntervalSelection);
      }
    });
  }

  catchDeptCount($event: Array<{ department: string, count: number }>): void {
    const chartType = 'column';
    const department = 'HR department';
    const chartTitle = 'Employee Count By Department';
    const seriesName = 'Department';
    const yAxisTitle = 'Employee Count';
    const data = $event.map((item: { department: string, count: number }) => {
      return {
        name: item.department,
        value: item.count
      }
    })
    const showIntervalSelection = false;
    const isDrillDown = false;
    const otherChartTypeOptions = [''];
    this.deptData = new chartData(chartType, department, chartTitle, seriesName, yAxisTitle, data, showIntervalSelection, isDrillDown);
  }

  getEmployeeUnderManager() {
    this._getDataService.getEmployeeUnderManager().subscribe({
      next: res => {
        console.log(res);
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

  ngOnDestroy(): void {
    this.empLoadedSub.unsubscribe();
  }

}