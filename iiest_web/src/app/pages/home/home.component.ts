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
  productSalesChartData: chartData;
  areaSalesChartData: chartData;
  monthSalesChartData: chartData;
  clientTypeChartData: chartData;
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
      this.fetchAllSalesData();

    }

    if (this.empDepartment === 'HR Department' || this.empDepartment === 'IT Department' || this.empDesigantion === 'Director') {

      this.getEmpHiringChartData();

    }

    if (salesManagerRoles.includes(this.empDesigantion)) {

      this.getEmployeeUnderManager()

    }

    //this function is for collecting data related to product table
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

  //--------function for getting chart data by the help of apis starts------
  getSalesPersonSalesData(sales: any) {
    sales.forEach((sale: any) => {
      if (sale.employeeInfo) {
        const employee = sale.employeeInfo.employee_name;

        const grandTotal = Number(sale.grand_total);

        if (this.topSalesman.hasOwnProperty(employee)) {
          this.topSalesman[employee] += grandTotal;
        } else {
          this.topSalesman[employee] = grandTotal;
        }
      }

    });
    this.salesPersonChartData = new chartData('column', 'Director', 'Employee Sales Chart', 'Employee Sales', '', this.topSalesman, [], false, ['column', 'pie', 'line', 'area']);
  }

  catchDeptCount($event: any): void {
    const data: any = {};

    $event.forEach((element: any) => {
      data[element.department] = element.count;
    });

    this.deptData = new chartData('column', 'HR department', 'Employee Count By Department', 'Department', 'Employee Count', data, [], false, ['column', 'pie', 'line', 'area']);
  }

  getSalesCountData(): void {
    this._getDataService.getEmpSalesProdWise().subscribe({
      next: res => {
        this.salesChartData = new chartData('column', 'Sales department', 'Sales Count Chart', '', 'Sales Count', res, [], true, ['column', 'pie', 'line', 'area']);
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
    this.areaSalesChartData = new chartData('pie', 'Sales Department', 'Area Wise Sales Chart', 'States', 'Sales Count', stateCounts, [], false, ['column', 'pie', 'line', 'area']);
  }

  getProductSalesChartData(res: any): void {
    let data: { [key: string]: number } = {};
    const fostac: any = [];
    const foscos: any = [];
    console.log(res);
    data = res.salesInfo.reduce((productCounts: { [key: string]: number }, order: any) => {
      order.product_name.forEach((product: any) => {
        if (productCounts.hasOwnProperty(product)) {
          productCounts[product]++;
        } else {
          productCounts[product] = 1;
        }
      });
      return productCounts;
    }, {});
    console.log(data);

    res.salesInfo.forEach((item: any) => {
      if (item.fostacInfo && item.fostacInfo.fostac_service_name) {
        const serviceName = item.fostacInfo.fostac_service_name.toString();
        const existingIndex = fostac.findIndex((entry: any) => entry[0] === serviceName);
        if (existingIndex !== -1) {
          fostac[existingIndex][1]++;
        } else {
          fostac.push([serviceName, 1]);
        }
      }
    
      // Increment count for foscos_service_name
      if (item.foscosInfo && item.foscosInfo.foscos_service_name) {
        const serviceName = item.foscosInfo.foscos_service_name.toString();
        const existingIndex = foscos.findIndex((entry: any) => entry[0] === serviceName);
        if (existingIndex !== -1) {
          foscos[existingIndex][1]++;
        } else {
          foscos.push([serviceName, 1]);
        }
      }
    });
    
    let fostacArr = {
      type: 'column',
      id: 'Fostac',
      name: 'Fostac',
      data: fostac
    };
    let foscosArr = {
      type: 'column',
      id: 'Foscos',
      name: 'Foscos',
      data: foscos
    };

    let drilldata = [fostacArr, foscosArr];

    this.productSalesChartData = new chartData('drilldown', 'Sales Department', 'Product Sales Chart', 'Products', 'Sales Count', data, drilldata, false, []);
  }


  // ------this function is responsible for monthy sales data shown in highcharts--------
  getMonthSalesChartData(res: any): void {
    let monthCounts: { [key: string]: number } = {};
    // let date = new Date().getFullYear();
    let date = "2023";
    let month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    let monthNum = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

    monthNum.forEach((element, index) => {
      let str = (date + "-" + element).toString();
      let count = 0;
      res.salesInfo.forEach((item: any) => {
        if (item.createdAt.includes(str)) {
          count++;
        }
      });
      monthCounts[month[index]] = count;
    });
    this.monthSalesChartData = new chartData('column', 'Sales Department', 'Sales Chart Month Wise', 'Current Year', 'Sales Count', monthCounts, [], false, ['column', 'pie', 'line', 'area']);

    let clientType: { [key: string]: number } = {};
    let corporateClient = 0;
    let generalClient = 0;
    res.salesInfo.forEach((elem: any) => {
      if (elem.fostacInfo) {
        if (elem.fostacInfo.fostac_client_type === "Corporate Client") {
          corporateClient++;
        } else if (elem.fostacInfo.fostac_client_type === "General Client") {
          generalClient++;
        }
      }
      if (elem.foscosInfo) {
        if (elem.foscosInfo.foscos_client_type === "Corporate Client") {
          corporateClient++;
        } else if (elem.foscosInfo.foscos_client_type === "General Client") {
          generalClient++;
        }
      }
      clientType['Corporate Client'] = corporateClient;
      clientType['General Client'] = generalClient;
    });
    this.clientTypeChartData = new chartData('pie', 'Sales Department', 'Customer Type Chart', 'Client Type', 'Sales Count', clientType, [], false, ['column', 'pie', 'line', 'area']);
  }

  getEmployeeSalesData(sales: any) {

  }

  getEmployeeUnderManager() {
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
        this.empHiringChartData = new chartData('line', 'HR Department', 'Hiring Performance Chart', 'Department', 'Hiring Count', data, [], false, ['column', 'pie', 'line', 'area']);
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
        this.getAreaSalesChartData(res);
        this.getMonthSalesChartData(res);
        this.getSalesPersonSalesData(res.salesInfo);
        this.getProductSalesChartData(res);
      }
    });
  }

  ngOnDestroy(): void {
    this.empLoadedSub.unsubscribe();
    // this.salesLoadedSub.unsubscribe();
  }
}