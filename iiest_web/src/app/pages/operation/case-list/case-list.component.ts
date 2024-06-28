import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { faFileCsv, faMagnifyingGlass, faUpload, faDownload, faEye, faFile, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { ExportAsConfig, ExportAsService } from 'ngx-export-as';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';
import { ViewFboComponent } from '../../modals/view-fbo/view-fbo.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-case-list',
  templateUrl: './case-list.component.html',
  styleUrls: ['./case-list.component.scss']
})
export class CaseListComponent implements OnInit {
  filteredData: any = [];
  isSearch: boolean = false;
  searchQuery: string;
  selectedFilter: string;
  itemsNumber: number = 25;
  pageNumber: number = 1;
  productType: string = '';
  caseData: any;
  typeData: any;
  caseList: any;
  showPagination: boolean = false;

  //condional var for deciding case list structure and logic for case list in case of trainers
  forTraining: boolean = false;
  forAudit: boolean = false;

  serviceType: string = '';
  totalCount: number = 0;
  totalCase: number = 0;
  panelType: string = '';

  //loading var
  loading: boolean = true;

  //icons
  faMagnifyingGlass: IconDefinition = faMagnifyingGlass;
  faFileCsv: IconDefinition = faFileCsv;
  faUpload: IconDefinition = faUpload;
  faDownload: IconDefinition = faDownload;
  faEye: IconDefinition = faEye;
  faFile: IconDefinition = faFile;

  constructor(private exportAsService: ExportAsService,
    private _getDataService: GetdataService,
    private _registerService: RegisterService,
    private modalService: NgbModal,
    private router: Router) {
  }

  ngOnInit(): void {

    this.initializeCaseList();

    if (!this.forTraining) { // we will not call case list api in case of training beacuse in this case we are getting data from route
      this.getCasedata()
    }

  }

  //Export To CSV
  exportToCsv(): void {
    const options: ExportAsConfig = {
      type: 'csv',
      elementIdOrContent: 'data-to-export',
    };

    this.exportAsService.save(options, 'table_data').subscribe(() => {
    });
  }

  onSearchChange(): void {
    if (this.searchQuery) {
      this.pageNumber = 1;
      this.isSearch = true;
      this.filter();
    }
    else {
      this.isSearch = false;
      this.filteredData = this.typeData;
    }
  }

  onTableDataChange(event: number): void {
    this.pageNumber = event;
  }

  getCasedata(): void {
    this._getDataService.getCaseList().subscribe({
      next: res => {
        this.loading = false;
        console.log(res.caseList);
        this.caseList = res.caseList;
        this.caseData = this.caseList[this.productType];
        this.setListProductWise();
      },
      error: err => {
        let errorObj = err.error;
        if (errorObj.userError) {
          this._registerService.signout();
        }
      }
    })
  }

  setServiceType(type: string): void {
    this.serviceType = type;
    this.pageNumber = 1;

    if (this.productType === 'Fostac') {
      this.typeData = this.caseData.filter((elem: any) => elem.salesInfo && elem.salesInfo.fostacInfo.fostac_service_name === type);
    } else if (this.productType === 'Foscos') {
      this.typeData = this.caseData.filter((elem: any) => elem.salesInfo && elem.salesInfo.foscosInfo.foscos_service_name === type);
    }

    if (this.searchQuery !== '') {
      this.onSearchChange();
    }
    //for getting Total number of case based on type 
    this.totalCount = this.typeData.length;
    if (this.searchQuery === '') {
      this.filteredData = this.typeData;
    }
    this.filteredData.sort((a: any, b: any) => new Date(b.salesInfo.createdAt).getTime() - new Date(a.salesInfo.createdAt).getTime());
  }

  //method for opening operation form
  collectResData(product: string,id: string): void {
    this.router.navigate(['caselist/operationform', product, id]);
  }

  filter(): void {
    if (!this.searchQuery) {
      console.log('TYPE DATA', this.typeData)
      this.filteredData = this.typeData;
      console.log('not 1uery')
    } else {
      if (this.productType==='Fostac') {
        switch (this.selectedFilter) {
          case 'byRecipientName': this.filteredData = this.typeData.filter((elem: any) => elem.name.toLowerCase().includes(this.searchQuery.toLowerCase()))
            break;

          case 'byFboName': this.filteredData = this.typeData.filter((elem: any) => elem.salesInfo && elem.salesInfo.fboInfo.fbo_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
            break;

          case 'byOwnerName': this.filteredData = this.typeData.filter((elem: any) => elem.salesInfo && elem.salesInfo.fboInfo.owner_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
            break;

          case 'byContact': this.filteredData = this.typeData.filter((elem: any) => elem.phoneNo.toString().includes(this.searchQuery.toString()))
            break;

          case 'byLocation': this.filteredData = this.typeData.filter((elem: any) => elem.salesInfo && (elem.salesInfo.fboInfo.state.toLowerCase().includes(this.searchQuery.toLowerCase()) || elem.salesInfo.fboInfo.district.toLowerCase().includes(this.searchQuery.toLowerCase())));
            break;
        }
      }
      else if (this.panelType==='Foscos') {
        switch (this.selectedFilter) {
          case 'byOperatorName': this.filteredData = this.typeData.filter((elem: any) => elem.operatorName.toLowerCase().includes(this.searchQuery.toLowerCase()))
            break;
          case 'byFboName': this.filteredData = this.typeData.filter((elem: any) => elem.salesInfo && elem.salesInfo.fboInfo.fbo_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
            break;
          case 'byOwnerName': this.filteredData = this.typeData.filter((elem: any) => elem.salesInfo && elem.salesInfo.fboInfo.owner_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
            break;
        }
      }
    }
    this.filteredData.length ? this.showPagination = true : this.showPagination = false;
    this.filteredData.sort((a: any, b: any) => new Date(b.salesInfo.createdAt).getTime() - new Date(a.salesInfo.createdAt).getTime());
  }

  initializeCaseList(): void { // this methord set the initializtion of case list component baased of diffent conditions
    let user: any = this._registerService.LoggedInUserData();
    let parsedUser = JSON.parse(user);
    this.panelType = parsedUser.panel_type;
    this.initializeProductType();
    this.initializeServiceType();

    const state = window.history.state;
    console.log(state);
    if (state && state.forTraining) {
      this.forTraining = state.forTraining;
      this.typeData = state.batchData.map((item: any) => {
        return {...item.recipientInfo }
      });
      this.totalCount = this.typeData.length
      this.filter();
      console.log(this.forTraining);
      this.loading = false;
    } else if(state && state.forAudit) {
      this.forAudit = state.forAudit;
      this.typeData = state.batchData.map((item: any) => {
        return {...item.shopInfo }
      });
      this.totalCount = this.typeData.length
      this.filter();
      console.log('For Audit',this.forAudit);
      this.loading = false;
    }
  }

  toogleTabs(tab: string){
    this.productType = tab;
    this.caseData = this.caseList[this.productType]
    this.initializeServiceType();
    this.setListProductWise();
  }

  setListProductWise(){ //set the list type on the basis of product type
    console.log('2221',this.productType)
    this.totalCase = this.caseData.length;
    if (this.productType === 'Fostac') {
      this.setServiceType('Catering');
      this.selectedFilter = "byRecipientName";
      this.filter();
    }
    else if (this.productType === 'Foscos') {
      this.setServiceType("Registration");
      this.selectedFilter = "byOperatorName";
      this.filter();
    }
    else if (this.productType === 'HRA') {
      this.selectedFilter = "byManagerName";
      this.typeData = this.caseData;
      this.filter();
    }
  }
  
  initializeProductType(): void{
    if(this.panelType === 'Fostac Panel' || this.panelType === 'Verifier Panel'){
      this.productType = 'Fostac';
    } else if(this.panelType === 'Foscos Panel') {
      this.productType = 'Foscos';
    } else if(this.panelType === 'HRA Panel') {
      this.productType = 'HRA'
    }
  }

  initializeServiceType(): void {
    if (this.productType === 'Fostac') {
      this.serviceType = 'Catering'
    } else if (this.productType === 'Foscos') {
      this.serviceType = 'Registration'
    }
  }

  getFormattedSalesDate(dateString: string): string { //,ethord for formatting date
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

  //View FBO Details
  viewFboDetails($event: Event, res: any) {
    $event.stopPropagation();
    const modalRef = this.modalService.open(ViewFboComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.fboData = res;
    modalRef.componentInstance.isVerifier = true;
  }
}