import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscriber, Subscription, concat, interval, skipLast } from 'rxjs';
import { GetdataService } from 'src/app/services/getdata.service';
import { GetEmployee } from 'src/app/store/actions/employee.action';
import { Employee } from '../../utils/registerinterface';
import { EmployeeState } from 'src/app/store/state/employee.state';
import { RegisterService } from 'src/app/services/register.service';
import { faIndianRupeeSign } from '@fortawesome/free-solid-svg-icons';
import { chartData, months, salesManagerRoles, salesOfficersRoles } from 'src/app/utils/config';
import { SalesState } from 'src/app/store/state/sales.state';
import { GetSales } from 'src/app/store/actions/sales.action';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit, OnDestroy {

  //User Related variables
  empName: String;
  empDepartment: string;
  empDesigantion: string;
  projectType: string;

  //store related variables
  employees: Employee;
  @Select(EmployeeState.GetEmployeeList) employees$: Observable<Employee>;
  @Select(EmployeeState.employeeLoaded) employeeLoaded$: Observable<boolean>
  @Select(SalesState.GetSalesList) sales$: Observable<any>;
  @Select(SalesState.salesLoaded) salesLoaded$: Observable<boolean>
  empLoadedSub: Subscription;
  salesLoadedSub: Subscription;
  msg: Subscription;
  data: any;
  salesData: any;

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

    const observables: Observable<any>[] = [];

    this.employees$.subscribe(res => {
      this.data = res;
    });

    this.sales$.subscribe({
      next: res => {
        this.salesData = res;
        this.loading = false;
      }
    });

    // functions for forming input for highcharts from data comming from backend
    if (this.empDepartment === 'Sales Department' || this.empDepartment === 'IT Department') {
      this.getProductSaledata();
      this.getAreaWiseSaleData();
      this.getClientTypeSaleData();
      this.getMonthWisesaleData();
    }

    if (this.empDesigantion === 'Director') {
      this.getPersonWiseSaleData();
    }

    if (this.empDepartment === 'HR Department') {
      this.getEmpHiringData();
    }

    if (salesManagerRoles.includes(this.empDesigantion)) {
      this.getEmployeeUnderManager()
    }

    //------this function is for collecting data related to product table-------
    this.getProductData();

    this.getSales();
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
        const chartType = 'Column';
        const department = 'Sales Department';
        const chartTitle = 'Product Sales Chart';
        const seriesName = 'Products';
        const yAxisTitle = 'Sales Count';
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
        const chartType = 'Pie';
        const department = 'Sales Department';
        const chartTitle = 'Area Wise Sales Chart';
        const seriesName = 'State';
        const yAxisTitle = 'India';
        const data = res;
        const showIntervalSelection = false;
        const isDrillDown = true;
        const otherChartTypeOptions = ['column']
        this.areaSalesChartData = new chartData(chartType, department, chartTitle, seriesName, yAxisTitle, data, isDrillDown, showIntervalSelection);
        // this.loading = false;
      }
    });
  }

  getMonthWisesaleData() {
    this._getDataService.getMonthWisesaleData().subscribe({
      next: res => {
        const chartType = 'Area';
        const department = 'Sales Department';
        const chartTitle = 'Sales Chart';
        const seriesName = `${new Date().getFullYear() - 1}-${new Date().getFullYear()} `;
        const yAxisTitle = 'Sales Count';
        const data = res;
        const showIntervalSelection = false;
        const isDrillDown = true;
        const otherChartTypeOptions = ['Line'];
        for (let i = 0; i < data.length; i++) {
          const month = months[data[i].name - 1];
          const year = data[i].date.year;
          data[i].name = month + "-" + year;
          for (let j = 0; j < data[i].categories.length; j++) {
            data[i].categories[j].name = `${data[i].categories[j].name}-${month}`;
          }
        }
        this.monthSalesChartData = new chartData(chartType, department, chartTitle, seriesName, yAxisTitle, data, isDrillDown, showIntervalSelection, otherChartTypeOptions);
      }
    });
  }

  getPersonWiseSaleData() {
    this._getDataService.getPersonWiseSaleData().subscribe({
      next: res => {
        const chartType = 'Column';
        const department = 'IT Department';
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

  getClientTypeSaleData() {
    this._getDataService.getClientTypeSaleData().subscribe({
      next: res => {
        const chartType = 'Column';
        const department = 'Sales Department';
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

  getEmpHiringData() {
    this._getDataService.getEmpHiringData().subscribe({
      next: res => {
        this.isChartDataAvailable = true;
        const chartType = 'Column';
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
    const chartType = 'Column';
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

  getSales() {
    this.salesLoadedSub = this.salesLoaded$.subscribe(loadedSales => {
      if (!loadedSales) {
        this.store.dispatch(new GetSales());
      }
      // this.loading = false;
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
    this.salesLoadedSub.unsubscribe();
  }


}