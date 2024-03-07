import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { faMagnifyingGlass, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-highchart-data-modal',
  templateUrl: './highchart-data-modal.component.html',
  styleUrls: ['./highchart-data-modal.component.scss']
})
export class HighchartDataModalComponent {

  allFBOEntries: any;
  searchQuery: string = '';
  filteredData: any;
  selectedFilterSales: string = 'byName';
  selectedFilterHr: string = 'byEmployeeName';
  showPagination: boolean = false;
  filterValue: string;
  chartData: any;
  intervalType: string;
  filterDate: string | void;
  fboSalesData: any;
  faMagnifyingGlass = faMagnifyingGlass;
  isSearch: boolean = false;
  pageNumber: number = 1;
  itemsNumber: number = 10;
  employeeList: any;
  specificDatas: any;
  faXmark = faXmark;
  faCheck = faCheck;

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
    this._getDataService.getSalesList().subscribe({
      next: (res) => {
        if (res.salesInfo) {
          this.specificDatas = res.salesInfo.filter((item: any) =>((item.fboInfo) && (item.fboInfo.district === this.chartData.filterValue)));
          this.salesDeptfilter();
          this.loading = false;
        }
      },
    })
  }

  // -------this function is work for sales chart data of client type---------
  fetchFboDataByClientType(): void {
    this._getDataService.getSalesList().subscribe({
      next: (res) => {
        if (res.salesInfo) {
          this.specificDatas = res.salesInfo.filter((item: any, index: number) => {
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
    this._getDataService.getSalesList().subscribe({
      next: (res) => {
        if (res.salesInfo) {
          this.filterValue = this.chartData.filterValue.charAt(0).toUpperCase() + this.chartData.filterValue.slice(1);
            if (this.chartData.salesCategory === 'Fostac') {
              this.specificDatas = res.salesInfo.filter((item: any) => (item.product_name.includes(this.chartData.salesCategory)) && (item.fostacInfo.fostac_service_name === this.filterValue));
            } else {
              this.specificDatas = res.salesInfo.filter((item: any) => (item.product_name.includes(this.chartData.salesCategory)) && (item.foscosInfo.foscos_service_name === this.filterValue));
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
        case 'byOwner': this.filteredData = this.specificDatas.filter((elem: any) => elem.fboInfo.owner_name.toLowerCase().includes(this.searchQuery.toLowerCase()))
          break;
        case 'byDistrict': this.filteredData = this.specificDatas.filter((elem: any) => elem.fboInfo.district.toLowerCase().includes(this.searchQuery.toLowerCase()))
          break;
        case 'byName': this.filteredData = this.specificDatas.filter((elem: any) => elem.fboInfo.fbo_name.toLowerCase().includes(this.searchQuery.toLowerCase()))
          break;
        case 'byCustomerID': this.filteredData = this.specificDatas.filter((elem: any) => elem.fboInfo.customer_id.includes(this.searchQuery))
          break;
      }
    }
    this.filteredData.length ? this.showPagination = true : this.showPagination = false;
    this.loading= false;
  }

  monthWiseFilter(){
    this._getDataService.getSalesList().subscribe({
      next: (res) => {
        if(res.salesInfo) {
          this.specificDatas = res.salesInfo.filter((item: any) => new Date(item.createdAt).getDate() == (Number(this.chartData.filterValue) + 1) && new Date(item.createdAt).getMonth() == 10);
          this.salesDeptfilter();
          this.loading=false;
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

  employeeWiseFilter() {
    this._getDataService.getSalesList().subscribe({
      next: (res) => {
        console.log(res);
        if(res.salesInfo) {
          this.specificDatas = res.salesInfo.filter((item: any) => 
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