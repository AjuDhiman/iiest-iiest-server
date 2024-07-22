import { Component, OnInit } from '@angular/core';
import { faEye, faMagnifyingGlass, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-shops-modal',
  templateUrl: './shops-modal.component.html',
  styleUrls: ['./shops-modal.component.scss']
})
export class ShopsModalComponent implements OnInit{

  //table vars
  searchQuery: string = '';
  isSearch: boolean;
  selectedFilterSales: string = 'byFboName';
  itemsNumber: number = 25;
  pageNumber: number = 1;

  //loading
  loading: boolean =false;

  //data to show in table
  filteredData: any;

  //input vars
  boName: string;
  memberId: string;
  shopData: any;


  //icons
  faMagnifyingGlass: IconDefinition = faMagnifyingGlass;
  faEye: IconDefinition = faEye;

  constructor(public activeModal: NgbActiveModal){

  }


  ngOnInit(): void {
    this.filteredData = this.shopData;
  }

  //methords 
  onSearchChange(): void {
    this.pageNumber = 1;
    this.isSearch = true;
    this.filter();
  }

  onTableDataChange($event: number): void {
    this.pageNumber = $event;
    this.filter();
  }

   //this methord filter the table data on the basis of search query and selected search filter
   filter(): void {
    if (!this.searchQuery) {
      this.isSearch = false;
      this.filteredData = this.shopData;
    } else {
      switch (this.selectedFilterSales) {
        case 'byShopId': this.filteredData = this.shopData.filter((data: any) => data.customer_id.toLowerCase().includes(this.searchQuery.toLowerCase()))
          break;
        case 'byOwnerName': this.filteredData = this.shopData.filter((data: any) => data.owner_name.toLowerCase().includes(this.searchQuery.toLowerCase()))
          break;
          case 'byLocation': this.filteredData = this.shopData.filter((data: any) => data.state && data.district && data.district.toLowerCase().includes(this.searchQuery.toLowerCase()) ||  data.state.toLowerCase().includes(this.searchQuery.toLowerCase()))
          break;
        case 'byFboName': this.filteredData = this.shopData.filter((data: any) => data.fbo_name && data.fbo_name.toLowerCase().includes(this.searchQuery.toLowerCase()))
          break;
        case 'byContact': this.filteredData = this.shopData.filter((data: any) => data.owner_contact.toString().includes(this.searchQuery.toString()))
          break;
        case 'byMail': this.filteredData = this.shopData.filter((data: any) => data.email.toLowerCase().includes(this.searchQuery.toLowerCase()))
          break;
      }
    }
  }
}
