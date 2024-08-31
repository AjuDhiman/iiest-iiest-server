import { Component, OnDestroy, OnInit } from '@angular/core';
import { faEye, faMagnifyingGlass, IconDefinition, faArrowRotateForward } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GetdataService } from 'src/app/services/getdata.service';
import { ShopsModalComponent } from '../../modals/shops-modal/shops-modal.component';
import { Select, Store } from '@ngxs/store';
import { BosState } from 'src/app/store/state/bo.state';
import { Observable, Subscription } from 'rxjs';
import { GetBos, SetBosLoadedFalse } from 'src/app/store/actions/bo.action';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss']
})
export class ClientListComponent implements OnInit, OnDestroy {


  clientList: any;

  loading: boolean;

  //data to show in table
  filteredData: any;

  //table related vars
  itemsNumber: number = 25;
  pageNumber: number = 1;
  isSearch: boolean;
  searchQuery: string;
  selectedFilter: string = 'byMemberId';

  //var for calculating total no of shops
  totalShops: number = 0;

  //icons
  faEye: IconDefinition = faEye;
  faMagnifyingGlass: IconDefinition = faMagnifyingGlass;
  faArrowRotateForward: IconDefinition = faArrowRotateForward;

  //store related vars
  @Select(BosState.GetBosList) bos$: Observable<any>;
  @Select(BosState.bosLoaded) bosLoaded$: Observable<boolean>
  bosLoadedSub: Subscription;

  constructor(private _getDataService: GetdataService,
    private _modalService: NgbModal,
    private store: Store
  ) {

  }

  ngOnInit(): void {
    this.bosLoadedSub = this.bosLoaded$.subscribe(loadedBos => {
      if (!loadedBos) {
        this.store.dispatch(new GetBos());
      }
    })
    this.loading = true;
    this.bos$.subscribe({
      next: res => {
        if(res.length){
          this.loading = false;
          // this.clientList = res.clientList.sort((a: any,b: any) => b.fbo.length - a.fbo.length);
          this.clientList = res;
          this.filteredData = this.clientList;
  
          //getting total no of shops by the help of reduce func
          this.totalShops = this.clientList.reduce((acc: number, crr: { fbo: unknown[] }) => acc + crr.fbo.length, 0);
  
          console.log(this.totalShops);
        }
      }
    });

    // this._getDataService.getClientList().subscribe({
    //   next: res => {
    //     this.loading = false;
    //     // this.clientList = res.clientList.sort((a: any,b: any) => b.fbo.length - a.fbo.length);
    //     this.clientList = res.clientList;
    //     console.log(res.clientList)
    //     this.filteredData = this.clientList;

    //     //getting total no of shops by the help of reduce func
    //     this.totalShops = this.clientList.reduce((acc: number, crr: { fbo: unknown[] }) => acc + crr.fbo.length, 0);

    //     console.log(this.totalShops);
    //   }
    // })
  }

  //methords 

  //this method sets the table configuration on the basis of search change
  onSearchChange(): void {
    this.pageNumber = 1;
    this.isSearch = true;
    this.filter();
  }

  onItemNumChange(): void {

  }

  //this methord filter the table data on the basis of search query and selected search filter
  filter(): void {
    if (!this.searchQuery) {
      this.isSearch = false;
      this.filteredData = this.clientList;
    } else {
      switch (this.selectedFilter) {
        case 'byMemberId': this.filteredData = this.clientList.filter((data: any) => data.customer_id.toLowerCase().includes(this.searchQuery.toLowerCase()))
          break;
        case 'byBoName': this.filteredData = this.clientList.filter((data: any) => data.owner_name.toLowerCase().includes(this.searchQuery.toLowerCase()))
          break;
        case 'byBusinessEntity': this.filteredData = this.clientList.filter((data: any) => data.business_entity && data.business_entity.toLowerCase().includes(this.searchQuery.toLowerCase()))
          break;
        case 'byContact': this.filteredData = this.clientList.filter((data: any) => data.contact_no.toString().includes(this.searchQuery.toString()))
          break;
        case 'byMail': this.filteredData = this.clientList.filter((data: any) => data.email.toLowerCase().includes(this.searchQuery.toLowerCase()))
          break;
      }
    }
  }

  onTableDataChange($event: number): void {
    this.pageNumber = $event;
    this.filter();
  }

  showShops(boData: any): void {
    const modalRef = this._modalService.open(ShopsModalComponent, { size: 'xl', backdrop: 'static' })
    modalRef.componentInstance.shopData = boData.fbo;
    modalRef.componentInstance.boName = boData.owner_name;
    modalRef.componentInstance.memberId = boData.customer_id;
  }

  //methord for refreshing client list
  refresh(): void {
    this.filteredData = [];
    this.clientList = [];
    this.totalShops = 0;
    this.store.dispatch(new SetBosLoadedFalse());
    this.loading = true;
  }

  ngOnDestroy(): void {
    this.bosLoadedSub.unsubscribe();
  }
}
