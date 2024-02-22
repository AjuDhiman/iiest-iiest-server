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

  constructor(public activeModal: NgbActiveModal,
    private _getDataService: GetdataService,
    private registerService: RegisterService) { }

  ngOnInit() {
    switch (this.chartData.chartTitile) {
      case 'Sales Count Chart': this.fetchAllFboData();
        break;
      case 'Sales Chart Area Wise': this.fetchFboDataByState();
        break;
      case 'Employee Count By Department': this.getDepartmentdata();
        break;
      case 'Client Type': this.fetchFboDataByClientType();
        break;
    }
    this.filterDate = this.filterByDuration(this.intervalType);
    console.log(this.chartData);
  }

  // -------this function is work for sales chart data of state wise---------
  fetchFboDataByState(): void {
    this._getDataService.getSalesList().subscribe({
      next: (res) => {
        if (res.salesInfo) {
          this.specificDatas = res.salesInfo.filter((item: any) => (item.fboInfo.state === this.chartData.filterValue));
          this.salesDeptfilter();
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
        }
      },
    })
  }

  // -------this function is work for sales department data acc to logged user--------
  fetchAllFboData(): void {
    this._getDataService.getSalesList().subscribe({
      next: (res) => {
        if (res.salesInfo) {
          console.log(res.salesInfo);
          // this.filterDate = this.filterDate.toString();
          this.filterValue = this.chartData.filterValue.charAt(0).toUpperCase() + this.chartData.filterValue.slice(1);
          if (this.chartData.interval === "tillNow") {
            if (this.chartData.salesCategory === 'Fostac') {
              this.specificDatas = res.salesInfo.filter((item: any) => (item.product_name.includes(this.chartData.salesCategory)) && (item.fostacInfo.fostac_service_name === this.filterValue));
            } else {
              this.specificDatas = res.salesInfo.filter((item: any) => (item.product_name.includes(this.chartData.salesCategory)) && (item.foscosInfo.foscos_service_name === this.filterValue));
            }
            console.log(this.specificDatas);
            this.salesDeptfilter();
          }
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

  // filterByDuration(object: any, data: any, category: any, createdAt: any) {
  //   let now = new Date();
  //   let date = new Date(createdAt);

  //   // Update tillNow
  //   object.tillNow[category] += data;

  //   // Update Financial year
  //   if (date.getTime() >= new Date(now.getFullYear() - 1, 3, 1).getTime() &&
  //     date.getTime() < new Date(now.getFullYear(), 3, 1).getTime()) {
  //     object.year[category] += data;
  //   }

  //   //update this Quater
  //   if (date.getTime() >= new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1).getTime() &&
  //     date.getTime() < new Date(now.getFullYear(), (Math.floor(now.getMonth()) / 3 + 1) * 3, 1).getTime()) {
  //     object.quater[category] += data;
  //   }

  //   //update this Half year
  //   if (date.getTime() >= new Date(now.getFullYear(), Math.floor(now.getMonth() / 6) * 6, 1).getTime() &&
  //     date.getTime() < new Date(now.getFullYear(), (Math.floor(now.getMonth() / 6) + 1) * 6, 1).getTime()) {
  //     object.halfYearly[category] += data;
  //   }

  //   // Update month
  //   if (date.getTime() >= new Date(now.getFullYear(), now.getMonth(), 1).getTime() &&
  //     date.getTime() < new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime()) {
  //     object.month[category] += data;
  //   }

  //   // Update week
  //   if (now.getTime() - date.getTime() < now.getDay() * 24 * 60 * 60 * 1000) {
  //     object.week[category] += data;
  //   }
  // }

  filterByDuration(intervalType: string): string | void {
    let now = new Date();

    if (intervalType === "tillNow") {
      return "tillNow";
    } else if (intervalType === "year") {
      let yearStr = now.getFullYear();
      // Concatenate components to form desired date string
      let formattedDate = yearStr.toString();
      console.log(formattedDate);
      return formattedDate;

    } else if (intervalType === "month") {
      let yearStr = now.getFullYear();
      let monthStr = ('0' + (now.getMonth() + 1)).slice(-2); // Add leading zero if month is < 10
      // Concatenate components to form desired date string
      let formattedDate = yearStr + '-' + monthStr;
      console.log(formattedDate);
      return formattedDate;

    } else if (intervalType === "quater") {
      let yearStr = now.getFullYear();
      let monthStr = ('0' + (now.getMonth() - 2)).slice(-2); // Add leading zero if month is < 10
      // Concatenate components to form desired date string
      let formattedDate = yearStr + '-' + monthStr + '-01';
      console.log(formattedDate);
      return formattedDate;
    }
  }
}