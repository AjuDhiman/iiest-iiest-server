import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { faMagnifyingGlass, faCheck, faXmark, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { months } from 'src/app/utils/config';
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
  selectedFilterSales: string = 'byFboName';
  selectedFilterHr: string = 'byEmployeeName';
  showPagination: boolean = false;
  filterValue: string;
  chartData: any;
  intervalType: string;
  filterDate: string | void;
  fboSalesData: any;
  isSearch: boolean = false;
  pageNumber: number = 1;
  itemsNumber: number = 10;
  employeeList: any;
  specificDatas: any;

  //icons
  faMagnifyingGlass: IconDefinition = faMagnifyingGlass;
  faXmark: IconDefinition = faXmark;
  faCheck: IconDefinition = faCheck;

  //these variable manges the state of th e sales store
  @Select(SalesState.GetSalesList) sales$: Observable<any>;
  @Select(SalesState.salesLoaded) salesLoaded$: Observable<boolean>
  empLoadedSub: Subscription;

  loading: boolean = true;

  constructor(public activeModal: NgbActiveModal,
    private _getDataService: GetdataService,
    private registerService: RegisterService) { }

  ngOnInit() {
    switch (this.chartData.chartTitile) {
      case 'Product Sales Chart':
        this.fetchAllFboData();
        break;
      case 'Area Wise Sales Chart': this.fetchFboDataByState();
        break;
      case 'Employee Count By Department': this.getDepartmentdata();
        break;
      case 'Customer Type Chart': this.fetchFboDataByClientType();
        break;
      case 'Sales Chart': this.monthWiseFilter();
        break;
      case 'Employee Sales Chart': this.employeeWiseFilter();
        break;
      }
  }

  // -------this function is work for sales chart data of state wise---------
  fetchFboDataByState(): void {
    console.log(this.chartData);
    this.sales$.subscribe(res => {
      console.log(res);
      this.specificDatas = res.filter((item: any) =>((item.fboInfo) && (item.fboInfo.district === this.chartData.filterValue)));
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
              if (item.fostacInfo.fostac_client_type === this.chartData.filterValue) {
                return item;
              }
            }
            if (item.foscosInfo) {
              if (item.foscosInfo.foscos_client_type === this.chartData.filterValue) {
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
            } else {
              this.specificDatas = res.filter((item: any) => (item.product_name.includes(this.chartData.salesCategory)) && (item.foscosInfo.foscos_service_name === this.filterValue));
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
    this.filteredData.length ? this.showPagination = true : this.showPagination = false;
    this.loading = false;
  }

  salesDeptfilter(): void {
    if (!this.searchQuery) {
      this.filteredData = this.specificDatas;
    } else {
      switch (this.selectedFilterSales) {
        case 'byOwner': this.filteredData = this.specificDatas.filter((elem: any) => elem.fboInfo.owner_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
          break;
        case 'byLocation': this.filteredData = this.specificDatas.filter((elem: any) => (elem.fboInfo.district.toLowerCase().includes(this.searchQuery.toLowerCase()) || elem.fboInfo.state.toLowerCase().includes(this.searchQuery.toLowerCase())));
          break;
        case 'byFboName': this.filteredData = this.specificDatas.filter((elem: any) => elem.fboInfo.fbo_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
          break;
        case 'byCustomerID': this.filteredData = this.specificDatas.filter((elem: any) => elem.fboInfo.customer_id.includes(this.searchQuery));
          break;
      }
    }
    this.filteredData.length ? this.showPagination = true : this.showPagination = false;
    this.loading= false;
  }

  monthWiseFilter(){
    this.sales$.subscribe(res => {
      if(res) {
        const filterValue : string[] = this.chartData.filterValue.split('-');
        console.log(filterValue);
        const day = filterValue[0];
        const month = months.findIndex((item:string) => item === filterValue[1]);
        let year = new Date().getFullYear();
        if(month > 2){
          year = year-1
        }

        this.specificDatas = res.filter((item: any) => {
          const saleDate = new Date(item.createdAt);
          if(saleDate.getFullYear() == year && saleDate.getMonth() == month && (saleDate.getDate() == Number(day) + 1)){
            console.log(year, saleDate.getFullYear());
            return 1;
          } else {
            return 0;
          }
        });
        this.salesDeptfilter();
        this.loading=false;
      }
    })
  }

  employeeWiseFilter() {
    this.sales$.subscribe({
      next: (res) => {
        if(res) {
          this.specificDatas = res.filter((item: any) => 
          {
            if(item.employeeInfo) {
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
    this.pageNumber = event;
  }

  onSearchChange() {
    if (this.searchQuery) {
      this.pageNumber = 1;
      this.isSearch = true;
      switch (this.chartData.userDept) {
        case "Sales Department": this.salesDeptfilter();
          break;
        case "HR Department": this.hrDeptfilter();
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
      }
    }
  }
}