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
  department: string;
  salesCategory: string;
  userDept: string;
  faMagnifyingGlass = faMagnifyingGlass;
  isSearch: boolean = false;
  pageNumber: number = 1;
  employeeList: any;
  specificDatas: any;
  faXmark = faXmark;
  faCheck = faCheck;

  constructor(public activeModal: NgbActiveModal,
    private _getDataService: GetdataService,
    private registerService: RegisterService) {}

  ngOnInit(){
    this.fetchAllFboData();
    this.getDepartmentdata();
  }

  fetchAllFboData(): void {
    this._getDataService.getSalesList().subscribe({
      next: (res) => {
        if (res.salesInfo) {
          this.department = this.department.charAt(0).toUpperCase() + this.department.slice(1);
          if(this.salesCategory==='Fostac'){
            this.specificDatas = res.salesInfo.filter((item:any) => item.product_name.includes(this.salesCategory) && item.fostacInfo.fostac_service_name===this.department);
          } else {
            this.specificDatas = res.salesInfo.filter((item:any) => item.product_name.includes(this.salesCategory) && item.foscosInfo.foscos_service_name===this.department);
          }
          this.salesDeptfilter();
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

  getDepartmentdata(){
    this._getDataService.getEmpCountDeptWise(this.department).subscribe({
        next: res=> {
          console.log(res);
          this.employeeList=res.employeeList.map((elem:any, index:number) => {
            return {...elem, serialNumber:index+1}
          });
          this.filteredData=this.employeeList;
          this.showPagination=true;
        }
    })
  }

  hrDeptfilter(): void {
    if (this.searchQuery==='') {
      this.filteredData = this.employeeList;
    } else {
      switch (this.selectedFilterHr) {
        case 'byEmployeeName': this.filteredData = this.employeeList.filter((elem: any) => elem.employee_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
          break;
        case 'byState': this.filteredData = this.employeeList.filter((elem: any) => elem.state.toLowerCase().includes(this.searchQuery.toLowerCase()));
          break;
      }
    }
     this.filteredData.length?this.showPagination=true:this.showPagination=false;
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
    this.filteredData.length?this.showPagination=true:this.showPagination=false;
  }

  onTableDataChange(event: any) {
    this.pageNumber = event;
  }

  onSearchChange() {
    if (this.searchQuery) {
      this.pageNumber = 1;
      this.isSearch = true;
      switch(this.userDept){
        case "Sales Department": this.salesDeptfilter();
        break;
        case "HR Department": this.hrDeptfilter();
        break;
      }
    }
    else {
      this.isSearch = false;
      switch(this.userDept){
        case "Sales Department": this.filteredData = this.specificDatas;
        break;
        case "HR Department": this.filteredData = this.employeeList;
        break;
      }
    }
  }
}
