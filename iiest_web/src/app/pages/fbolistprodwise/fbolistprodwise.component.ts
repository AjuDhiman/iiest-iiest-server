import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-fbolistprodwise',
  templateUrl: './fbolistprodwise.component.html',
  styleUrls: ['./fbolistprodwise.component.scss']
})
export class FbolistprodwiseComponent {

  allFBOEntries: any;
  searchQuery: string = '';
  filteredData: any;
  selectedFilter: string = 'byOwner';
  showPagination: boolean = false;
  department: string;
  salesCategory: any = [];
  faMagnifyingGlass = faMagnifyingGlass;
  isSearch: boolean = false;
  pageNumber: number = 1;
  employeeList: any;
  specificDatas: any;

  constructor(public activeModal: NgbActiveModal,
    private getDataService: GetdataService,
    private registerService: RegisterService,) {}

  ngOnInit(){
    this.fetchAllFboData();
    console.log(this.salesCategory);
  }

  fetchAllFboData(): void {
    this.getDataService.getSalesList().subscribe({
      next: (res) => {
        if (res.salesInfo) {
          console.log(res.salesInfo);
          if(this.salesCategory[0]==='Fostac'){
            this.specificDatas = res.salesInfo.filter((item:any) => item.product_name.includes(this.salesCategory[0]) && item.fostacInfo.fostac_service_name===this.salesCategory[1]);
          } else {
            this.specificDatas = res.salesInfo.filter((item:any) => item.product_name.includes(this.salesCategory[0]) && item.foscosInfo.foscos_service_name===this.salesCategory[1]);
          }
          // this.allFBOEntries = res.salesInfo.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((elem: any, index: number) => ({ ...elem, serialNumber: index + 1 }));
          console.log(this.specificDatas);
          this.filter();
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

  filter(): void {
    if (!this.searchQuery) {
      this.filteredData = this.specificDatas;
    } else {
      switch (this.selectedFilter) {
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
  }

  onTableDataChange(event: any) {
    this.pageNumber = event;
  }

  onSearchChange() {
    if (this.searchQuery) {
      this.pageNumber = 1;
      this.isSearch = true;
      this.filter();
    }
    else {
      this.isSearch = false;
      this.filteredData = this.specificDatas;
    }
  }
}