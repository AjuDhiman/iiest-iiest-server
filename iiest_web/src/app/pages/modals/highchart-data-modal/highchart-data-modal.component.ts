import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { faMagnifyingGlass, faCheck, faXmark, IconDefinition, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { Months, days, months } from 'src/app/utils/config';
import { Select } from '@ngxs/store';
import { SalesState } from 'src/app/store/state/sales.state';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-highchart-data-modal',
  templateUrl: './highchart-data-modal.component.html',
  styleUrls: ['./highchart-data-modal.component.scss']
})
export class HighchartDataModalComponent {

  allFBOEntries: any;
  searchQuery: string = '';
  filteredData: any;
  selectedFilterSales: string = 'generalsearch';
  selectedFilterHr: string = 'byEmployeeName';
  showPagination: boolean = false;
  filterValue: string;
  chartData: any;
  intervalType: string;
  filterDate: string | void;
  fboSalesData: any;
  isSearch: boolean = false;
  pageNumber1: number = 1;
  itemsNumber: number = 10;
  employeeList: any;
  specificDatas: any;
  isRepetCustData: boolean = false;
  sortedField: string = '';
  sortingOrder: 'asc' | 'desc' = 'asc';
  designation: string;

  //icons
  faMagnifyingGlass: IconDefinition = faMagnifyingGlass;
  faXmark: IconDefinition = faXmark;
  faCheck: IconDefinition = faCheck;
  faArrowUp: IconDefinition = faArrowUp;
  faArrowDown: IconDefinition = faArrowDown;

  //these variable manges the state of th e sales store
  @Select(SalesState.GetSalesList) sales$: Observable<any>;
  @Select(SalesState.salesLoaded) salesLoaded$: Observable<boolean>
  empLoadedSub: Subscription;

  loading: boolean = true;

  constructor(public activeModal: NgbActiveModal,
    private _getDataService: GetdataService,
    private registerService: RegisterService,
    private _modalService: NgbModal) { }

  ngOnInit() {
    const loggedInUserData: any = this.registerService.LoggedInUserData();
    const parsedData = JSON.parse(loggedInUserData);
    this.designation = parsedData.designation;

    switch (this.chartData.chartTitile) {
      case 'Product Wise Sales':
        this.fetchAllFboData();
        break;
      case 'Area Wise Sales': this.fetchFboDataByState();
        break;
      case 'Employee Count By Department': this.getDepartmentdata();
        break;
      case 'Customer Type': this.fetchFboDataByClientType();
        break;
      case 'Sales Graph': this.monthWiseFilter();
        break;
      case 'Sales Employee Performence': this.employeeWiseFilter();
        break;
      case 'Repeated Customers': this.repeatedCustomerFilter();
        break;
      case 'Customer Data': this.viewCustomerData();
        break;
    }

    if (this.isRepetCustData) {
      this.sortBy('last_sale_date', 'desc');
    } else {
      this.sortBy('sales_date', 'desc');
    }
  }

  // -------this function is work for sales chart data of state wise---------
  fetchFboDataByState(): void {
    this.sales$.subscribe(res => {
      this.specificDatas = res.filter((item: any) => ((item.fboInfo) && (item.fboInfo.district === this.chartData.filterValue)));
      this.salesDeptfilter();
      this.loading = false;
    })
  }

  // -------this function is work for sales chart data of client type---------
  fetchFboDataByClientType(): void {
    this.sales$.subscribe({
      next: (res) => {
        if (res) {
          this.specificDatas = res.filter((item: any, index: number) => {
            if (item.fostacInfo) {
              if (item.fostacInfo.fostac_client_type === this.chartData.filterValue && item.product_name.includes(this.chartData.interval)) {
                return item;
              }
            }
            if (item.foscosInfo) {
              if (item.foscosInfo.foscos_client_type === this.chartData.filterValue && item.product_name.includes(this.chartData.interval)) {
                return item;
              }
            }
            if (item.hraInfo) {
              if (item.hraInfo.hra_client_type === this.chartData.filterValue && item.product_name.includes(this.chartData.interval)) {
                return item;
              }
            }
          })
          this.salesDeptfilter();
          this.loading = false;
        }
      },
    })
  }

  // -------this function is work for sales department data acc to logged user--------
  fetchAllFboData(): void {

    this.sales$.subscribe({
      next: (res) => {
        if (res) {
          this.filterValue = this.chartData.filterValue.charAt(0).toUpperCase() + this.chartData.filterValue.slice(1);
          if (this.chartData.salesCategory === 'Fostac') {
            this.specificDatas = res.filter((item: any) => (item.product_name.includes(this.chartData.salesCategory)) && (item.fostacInfo.fostac_service_name === this.filterValue));
          } else if (this.chartData.salesCategory === 'Foscos') {
            this.specificDatas = res.filter((item: any) => (item.product_name.includes(this.chartData.salesCategory)) && (item.foscosInfo.foscos_service_name === this.filterValue));
          } else if (this.chartData.salesCategory === 'HRA') {
            this.specificDatas = res.filter((item: any) => (item.product_name.includes(this.chartData.salesCategory)) && (item.hraInfo.hra_service_name === this.filterValue));
          }
          this.salesDeptfilter();
          this.loading = false;
        }
      },
      error: (err) => {
        let errorObj = err;
        if (errorObj.userError) {
          this.registerService.signout();
        }
      }
    })
  }

  getDepartmentdata() {
    this._getDataService.getEmpCountDeptWise(this.chartData.filterValue).subscribe({
      next: res => {
        this.employeeList = res.employeeList.map((elem: any, index: number) => {
          if (elem.status === true) {
            return { ...elem, serialNumber: index + 1 };
          } else {
            return null;
          }
        }).filter((value: any) => value !== null);
        this.filteredData = this.employeeList;
        this.showPagination = true;
        this.loading = false;
      }
    })
  }

  hrDeptfilter(): void {
    if (this.searchQuery === '') {
      this.filteredData = this.employeeList;
    } else {
      switch (this.selectedFilterHr) {
        case 'byEmployeeName': this.filteredData = this.employeeList.filter((elem: any) => elem.employee_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
          break;
        case 'byState': this.filteredData = this.employeeList.filter((elem: any) => elem.state.toLowerCase().includes(this.searchQuery.toLowerCase()));
          break;
      }
    }
    this.filteredData ? this.showPagination = true : this.showPagination = false;
    this.loading = false;
  }

  salesDeptfilter(): void {
    this.filterByInterval();
    if (!this.searchQuery) {
      this.filteredData = this.specificDatas;
    } else {
      switch (this.selectedFilterSales) {
        case 'generalsearch':
          this.filteredData = this.specificDatas.
            filter(
              (elem: any) => (elem.fboInfo.owner_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                elem.fboInfo.district.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                elem.fboInfo.state.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
                elem.fboInfo.fbo_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                elem.fboInfo.customer_id.includes(this.searchQuery)
            );
          break;
        case 'byOwner': this.filteredData = this.specificDatas.filter((elem: any) => elem.fboInfo.owner_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
          break;
        case 'byLocation': this.filteredData = this.specificDatas.filter((elem: any) => (elem.fboInfo.district.toLowerCase().includes(this.searchQuery.toLowerCase()) || elem.fboInfo.state.toLowerCase().includes(this.searchQuery.toLowerCase())));
          break;
        case 'byFboName': this.filteredData = this.specificDatas.filter((elem: any) => elem.fboInfo.fbo_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
          break;
        case 'byCustomerID': this.filteredData = this.specificDatas.filter((elem: any) => elem.fboInfo.customer_id.includes(this.searchQuery));
          break;
        case 'bySalesOfficer': this.filteredData = this.specificDatas.filter((elem: any) => elem.employeeInfo.employee_name.toLowerCase().includes(this.searchQuery));
          break;
      }
    }
    this.filteredData ? this.showPagination = true : this.showPagination = false;
    this.loading = false;
  }

  monthWiseFilter() {
    this.sales$.subscribe(res => {
      if (res) {
        const filterValue: string[] = this.chartData.filterValue.split('-');
        const day = filterValue[0];
        const month = months.findIndex((item: string) => item === filterValue[1]);
        let year = new Date().getFullYear();

        switch (this.chartData.interval) {
          case 'This_Week':
            this.specificDatas = res.filter((item: any) => new Date(item.createdAt).getUTCDay() === days.indexOf(filterValue[0]));
            break;
          case 'This_Month':
            this.specificDatas = res.filter((item: any) => new Date(item.createdAt).getUTCDate() === Number(filterValue[0]));
            break;
          case 'This_Year':
            this.specificDatas = res.filter((item: any) => new Date(item.createdAt).getUTCMonth() === Months.indexOf(filterValue[0]));
            break;
        }

        let saleDate = new Date(res[res.length - 1].createdAt);
        this.salesDeptfilter();
        this.loading = false;
      }
    })
  }

  employeeWiseFilter() {
    this.sales$.subscribe({
      next: (res) => {
        if (res) {
          this.specificDatas = res.filter((item: any) => {
            if (item.employeeInfo) {
              return item.employeeInfo.employee_name.toLowerCase() == this.chartData.filterValue.toLowerCase()
            }
            return 0;
          });
          this.salesDeptfilter();
          this.loading = false;
        }
      },
      error: (err) => {
        let errorObj = err;
        if (errorObj.userError) {
          this.registerService.signout();
        }
      }
    });
  }

  onTableDataChange(event: any) {
    this.pageNumber1 = event;
  }

  onSearchChange() {
    if (this.searchQuery) {
      this.pageNumber1 = 1;
      this.isSearch = true;
      switch (this.chartData.userDept) {
        case "Sales Department": this.salesDeptfilter();
          break;
        case "HR Department": this.hrDeptfilter();
          break;
        case "IT Department": this.salesDeptfilter();
          break;
      }
    }
    else {
      this.isSearch = false;
      switch (this.chartData.userDept) {
        case "Sales Department": this.filteredData = this.specificDatas;
          break;
        case "HR Department": this.filteredData = this.employeeList;
          break;
        case "IT Department": this.filteredData = this.specificDatas;
          break;
      }
    }
  }

  // Method to calculate the processing amount for each row
  calculateProcessingAmount(employee: any): number {
    let processingAmount = 0;


    if (employee.product_name) {
      // Calculate processing amount based on the product name
      employee.product_name.forEach((product: any) => {

        if (product == "Fostac") {
          processingAmount += employee.fostacInfo.fostac_processing_amount * employee.fostacInfo.recipient_no;
        }
        if (product == "Foscos") {
          let watertest = 0;
          if (employee.foscosInfo.water_test_fee != 0) {
            watertest = employee.foscosInfo.water_test_fee - 1200;
          }

          processingAmount += (employee.foscosInfo.foscos_processing_amount * employee.foscosInfo.shops_no) + watertest;
        }
        if (product == "HRA") {
          processingAmount += employee.hraInfo.hra_processing_amount * employee.hraInfo.shops_no;
        }
      });
    }

    return processingAmount;
  }

  filterByInterval() {
    const today = new Date()
    let yearStart, yearEnd;
    const todayDate = new Date();
    const startOfToday = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
    // const startOfToday = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth(), todayDate.getUTCDate(), 0, 0, 0));
    const startOfThisWeek = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth(), todayDate.getUTCDate() - todayDate.getUTCDay(), 0, 0, 0));
    const startOfPrevMonth = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth() - 1, 1, 0, 0, 0));
    const startOfThisMonth = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth(), 1, 0, 0, 0));
    const startOfThisYear = new Date(Date.UTC(todayDate.getUTCFullYear(), 0, 1, 0, 0, 0));
    if (this.chartData.chartTitile === 'Repeated Customers') {
      switch (this.chartData.interval) {
        case 'today':
          this.specificDatas = this.specificDatas.filter((item: any) => new Date(item.lastSaleDate).getTime() > startOfToday.getTime());
          break
        case 'This_Week':
          this.specificDatas = this.specificDatas.filter((item: any) => new Date(item.lastSaleDate).getTime() > startOfThisWeek.getTime());
          break
        case 'This_Month':
          this.specificDatas = this.specificDatas.filter((item: any) => new Date(item.lastSaleDate).getTime() > startOfThisMonth.getTime());
          break
        case 'Prev_Month':
          this.specificDatas = this.specificDatas.filter((item: any) => (new Date(item.lastSaleDate).getTime() > startOfPrevMonth.getTime())
            && (new Date(item.createdAt).getTime() < startOfThisMonth.getTime()));
          break
        case 'This_Year':
          this.specificDatas = this.specificDatas.filter((item: any) => new Date(item.lastSaleDate).getTime() > startOfThisYear.getTime());
          break
      }
    } else {
      switch (this.chartData.interval) {
        case 'today':
          this.specificDatas = this.specificDatas.filter((item: any) => new Date(item.createdAt).getTime() > startOfToday.getTime());
          break
        case 'This_Week':
          this.specificDatas = this.specificDatas.filter((item: any) => new Date(item.createdAt).getTime() > startOfThisWeek.getTime());
          break
        case 'This_Month':
          this.specificDatas = this.specificDatas.filter((item: any) => new Date(item.createdAt).getTime() > startOfThisMonth.getTime());
          break
        case 'Prev_Month':
          this.specificDatas = this.specificDatas.filter((item: any) => (new Date(item.createdAt).getTime() > startOfPrevMonth.getTime())
            && (new Date(item.createdAt).getTime() < startOfThisMonth.getTime()));
          break
        case 'This_Year':
          this.specificDatas = this.specificDatas.filter((item: any) => new Date(item.createdAt).getTime() > startOfThisYear.getTime());
          break
      }
    }

  }

  repeatedCustomerFilter() {
    this.isRepetCustData = true;
    this.sales$.subscribe(res => {
      let distinctCustomers: string[] = [];
      let consolidatedData: any = [];
      res.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.forEach((item: any) => {
        if (!distinctCustomers.includes(item.fboInfo.customer_id)) {
          consolidatedData.push({ ...item, repetition_count: 1, lastSaleDate: item.createdAt });
          distinctCustomers.push(item.fboInfo.customer_id);
        } else {
          let index = consolidatedData.findIndex((elem: any) => elem.fboInfo.customer_id === item.fboInfo.customer_id);
          if (new Date(item.createdAt).getTime() > new Date(item.lastSaleDate).getTime()) {
            item.lastSaleDate = item.createdAt;
          }
          consolidatedData[index].repetition_count++;
        }
      });
      if (this.chartData.interval === 'This_Year') {
        this.specificDatas = consolidatedData.filter((item: any) => new Date(item.lastSaleDate).getUTCMonth() == Months.indexOf(this.chartData.filterValue));
      } else if (this.chartData.interval === 'Till_Now') {
        this.specificDatas = consolidatedData.filter((item: any) => new Date(item.lastSaleDate).getUTCFullYear() == this.chartData.filterValue);
      }

      this.specificDatas = this.specificDatas.filter((item: any) => {
        let count = 0;
        if (item.repetition_count > 1) {
          // console.log(new Date(item.createdAt).getUTCFullYear(), item.createdAt, new Date(item.createdAt).getFullYear(), count++);
          return 1
        } else {
          return 0
        }

      });

      this.salesDeptfilter();
      this.loading = false;
    })
  }

  getFormattedSalesDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    let suffix = "";
    if (day === 1 || day === 21 || day === 31) {
      suffix = "st";
    } else if (day === 2 || day === 22) {
      suffix = "nd";
    } else if (day === 3 || day === 23) {
      suffix = "rd";
    } else {
      suffix = "th";
    }
    return `${day}${suffix} ${month} ${year}`;
  }

  viewCustomerSales(customerId: string): void {
    if (this.chartData.chartTitile != 'Repeated Customers') {
      return;
    }
    const chartData = {
      filterValue: customerId,
      salesCategory: "",
      userDept: "Sales Department",
      interval: "till_now",
      chartTitile: "Customer Data"
    };
    const modalRef = this._modalService.open(HighchartDataModalComponent, { size: 'xl', backdrop: 'static' });
    modalRef.componentInstance.chartData = chartData;
  }

  viewCustomerData(): void {
    this.sales$.subscribe(res => {
      this.isRepetCustData = false;
      this.specificDatas = res.filter((item: any) => item.fboInfo.customer_id === this.chartData.filterValue);
      this.salesDeptfilter();
    });
  }

  //this methord sorts the filterd data onthe basis of selected arrow on the table
  sortBy(field: string, order: 'asc' | 'desc') {
    this.sortedField = field;
    this.sortingOrder = order;

    switch (this.sortedField) {
      case 'fbo_name':
        this.filteredData.sort((a: any, b: any) => {
          if (order === 'asc') {
            if (b.fboInfo.fbo_name > a.fboInfo.fbo_name) {
              return -1
            } else if (b.fboInfo.fbo_name < a.fboInfo.fbo_name) {
              return 1
            } else {
              return 0;
            }
          } else {
            if (b.fboInfo.fbo_name > a.fboInfo.fbo_name) {
              return 1
            } else if (a.fboInfo.fbo_name < b.fboInfo.fbo_name) {
              return -1
            } else {
              return 0;
            }
          }
        })
        break;
      case 'owner_name':
        this.filteredData.sort((a: any, b: any) => {
          if (order === 'asc') {
            if (a.fboInfo.owner_name > b.fboInfo.owner_name) {
              return -1
            } else if (a.fboInfo.owner_name < b.fboInfo.owner_name) {
              return 1
            } else {
              return 0;
            }
          } else {
            if (a.fboInfo.owner_name > b.fboInfo.owner_name) {
              return 1
            } else if (a.fboInfo.owner_name < b.fboInfo.owner_name) {
              return -1
            } else {
              return 0;
            }
          }
        })
        break;
      case 'repetition_count':
        this.filteredData.sort((a: any, b: any) => {
          if (order === 'asc') {
            return a.repetition_count - b.repetition_count;
          } else {
            return b.repetition_count - a.repetition_count;
          }
        })
        break;
      case 'last_sale_date':
        this.filteredData.sort((a: any, b: any) => {
          if (order === 'asc') {
            return new Date(a.lastSaleDate).getTime() - new Date(b.lastSaleDate).getTime();
          } else {
            return new Date(b.lastSaleDate).getTime() - new Date(a.lastSaleDate).getTime();
          }
        })
        break;
      case 'sales_date':
        this.filteredData.sort((a: any, b: any) => {
          if (order === 'asc') {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          } else {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
        })
        break;
    }
  }
}