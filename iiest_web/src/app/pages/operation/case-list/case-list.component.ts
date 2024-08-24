import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { faFileCsv, faMagnifyingGlass, faUpload, faDownload, faEye, faFile, IconDefinition, faCheck, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { ExportAsConfig, ExportAsService } from 'ngx-export-as';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';
import { ViewFboComponent } from '../../modals/view-fbo/view-fbo.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RecipientComponent } from '../../modals/recipient/recipient.component';
import { FbonewComponent } from '../../sales/fboproduct/fbonew/fbonew.component';
import { basicRequiredDocs } from 'src/app/utils/config';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { ShopState } from 'src/app/store/state/shop.state';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { GetShops } from 'src/app/store/actions/shop.action';

@Component({
  selector: 'app-case-list',
  templateUrl: './case-list.component.html',
  styleUrls: ['./case-list.component.scss']
})
export class CaseListComponent implements OnInit {

  //store related vars
  @Select(ShopState.GetShopList) shops$: Observable<any>;
  @Select(ShopState.shopsLoaded) shopsLoaded$: Observable<boolean>
  shopLoadedSub: Subscription;

  filteredData: any = [];
  isSearch: boolean = false;
  searchQuery: string;
  selectedFilter: string = 'byShopId';
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
  faCheck: IconDefinition = faCheck;

  //var in case only recipient list to be shown
  isRecipientList: boolean = false;

  constructor(private exportAsService: ExportAsService,
    private _getDataService: GetdataService,
    private _registerService: RegisterService,
    private _utililitesService: UtilitiesService,
    private store: Store,
    private modalService: NgbModal,
    private router: Router) {
  }

  ngOnInit(): void {

    this.initializeCaseList();  //initalizing case list by doing some basic configuration

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

  //search box methord
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

  //methord call wheever page of table changes 
  onTableDataChange(event: number): void {
    this.pageNumber = event;
  }

  //getting csae list from backend
  getCasedata(): void {

    //getting case list and recp list on the basis of var
    if (this.isRecipientList) {
      this._getDataService.getRecipientList().subscribe({
        next: res => {
          this.loading = false;
          this.caseData = res.recpList
          this.setListProductWise();
          this.filter()
        },
        error: err => {
          let errorObj = err.error;
          this.loading = false;
          if (errorObj.userError) {
            this._registerService.signout();
          }
        }
      })
    } else {
      this.caseList = this._utililitesService.getShopListdata();
      this.caseData = this.caseList.filter((data: any) => data.product_name && data.product_name === this.productType);
      this.setListProductWise();
      if(this.caseList.length){
        this.loading = false;
      }
      //if shop list is not saved in stae the get it from backend
      if(this.caseList.length === 0) {

        this.shopLoadedSub = this.shopsLoaded$.subscribe(loadedShops => {
          if (!loadedShops) {
            this.loading = true;
            this.store.dispatch(new GetShops());
          } else {
            // this.loading = false;
          }
        })

        this.loading = true;
        this.shops$.subscribe({
          next: res => {
            if(res.length){
              console.log(res);
              this.loading = false;
              this.caseList = res.map((data: any) => {
                const { resultText, resultTextClass, resultIcon, isForDocumentsNum, pendingDocs, approvedDocs } = this.decideResult(data);
                return {
                  ...data,
                  resultText: resultText,
                  resultIcon: resultIcon,
                  resultTextClass: resultTextClass,
                  pendingDocs: pendingDocs,
                  approvedDocs: approvedDocs,
                  isForDocumentsNum: isForDocumentsNum
                }
              });
              this._utililitesService.setShopListData(this.caseList);
              this.caseData = this.caseList.filter((data: any) => data.product_name && data.product_name === this.productType);
              this.setListProductWise();
            }
          },
          error: err => {
                let errorObj = err.error;
                this.loading = false;
                if (errorObj.userError) {
                  this._registerService.signout();
                }
              }
        });
      }
    }

  }

  //methord sets sets service tye on service type button changes
  setServiceType(type: string): void {
    this.serviceType = type;
    this.pageNumber = 1;

    if (this.productType === 'Fostac' && this.isRecipientList) {
      this.typeData = this.caseData.filter((elem: any) => elem.salesInfo && elem.salesInfo.fostacInfo.fostac_service_name === type);
    } else if (this.productType === 'Fostac' && !this.isRecipientList) {
      this.typeData = this.caseData.filter((elem: any) => elem.salesInfo && elem.salesInfo.fostacInfo && elem.salesInfo.fostacInfo.fostac_service_name === type);
    } else if (this.productType === 'Foscos') {
      this.typeData = this.caseData.filter((elem: any) => elem.salesInfo && elem.salesInfo.foscosInfo && elem.salesInfo.foscosInfo.foscos_service_name === type);
    }

    if (this.searchQuery !== '') {
      this.onSearchChange();
    }
    //for getting Total number of case based on type 
    this.totalCount = this.typeData.length;
    if (this.searchQuery === '') {
      this.filteredData = this.typeData;
    }
    this.filteredData.sort((a: any, b: any) => (a.salesInfo && b.salesInfo) && (new Date(b.salesInfo.createdAt).getTime() - new Date(a.salesInfo.createdAt).getTime()));
  }



  //method for opening operation form
  collectResData(product: string, id: string): void {
    this.router.navigate(['caselist/operationform', product, id]);
  }



  //filter func for filtering data on search
  filter(): void {
    if (!this.searchQuery) { //if not search query display all data
      this.filteredData = this.typeData;
    } else {
      if (this.productType === 'Fostac') { //search in case of fostac

        if (this.isRecipientList) {
          switch (this.selectedFilter) {
            case 'byRecipientName': this.filteredData = this.typeData.filter((elem: any) => elem.name && elem.name.toLowerCase().includes(this.searchQuery.toLowerCase()))
              break;

            case 'byShopId': this.filteredData = this.typeData.filter((elem: any) => elem.salesInfo && elem.salesInfo.fboInfo && elem.salesInfo.fboInfo.customer_id.toLowerCase().includes(this.searchQuery.toLowerCase()))
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
        } else {
          switch (this.selectedFilter) {

            case 'byShopId': this.filteredData = this.typeData.filter((elem: any) => elem.salesInfo && elem.salesInfo.fboInfo && elem.fboInfo.customer_id.toLowerCase().includes(this.searchQuery.toLowerCase()))
              break;

            case 'byFboName': this.filteredData = this.typeData.filter((elem: any) => elem && elem.salesInfo.fboInfo.fbo_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
              break;

            case 'byOwnerName': this.filteredData = this.typeData.filter((elem: any) => elem && elem.salesInfo.fboInfo.owner_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
              break;

            case 'byContact': this.filteredData = this.typeData.filter((elem: any) => elem.salesInfo.fboInfo.owner_contact.toString().includes(this.searchQuery.toString()))
              break;

            case 'byLocation': this.filteredData = this.typeData.filter((elem: any) => elem && elem.salesInfo.fboInfo.state && elem.fboInfo.district && (elem.fboInfo.state.toString().toLowerCase().includes(this.searchQuery.toLowerCase()) || elem.fboInfo.district.toString().toLowerCase().includes(this.searchQuery.toLowerCase())));
              break;
          }
        }

      }
      else if (this.productType === 'Foscos') { //search in case of foscos
        switch (this.selectedFilter) {
          case 'byManagerName': this.filteredData = this.typeData.filter((elem: any) => elem.salesInfo && elem.salesInfo.fboInfo && elem.salesInfo.fboInfo.boInfo.manager_name.toLowerCase().includes(this.searchQuery.toLowerCase()))
            break;
          case 'byShopId': this.filteredData = this.typeData.filter((elem: any) => elem.salesInfo && elem.salesInfo.fboInfo && elem.salesInfo.fboInfo.customer_id.toLowerCase().includes(this.searchQuery.toLowerCase()))
            break;
          case 'byFboName': this.filteredData = this.typeData.filter((elem: any) => elem.salesInfo && elem.salesInfo.fboInfo.fbo_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
            break;
          case 'byOwnerName': this.filteredData = this.typeData.filter((elem: any) => elem.salesInfo && elem.salesInfo.fboInfo.owner_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
            break;
          case 'byContact': this.filteredData = this.typeData.filter((elem: any) => elem.salesInfo && elem.salesInfo.fboInfo && elem.salesInfo.fboInfo.owner_contact.toString().includes(this.searchQuery.toString()))
            break;
          // case 'byContact': this.filteredData = this.typeData.filter((elem: any) => elem.phoneNo && elem.phoneNo.toString().includes(this.searchQuery.toString()))
          // break;

          case 'byLocation': this.filteredData = this.typeData.filter((elem: any) => elem.salesInfo && (elem.salesInfo.fboInfo.state.toLowerCase().includes(this.searchQuery.toLowerCase()) || elem.salesInfo.fboInfo.district.toLowerCase().includes(this.searchQuery.toLowerCase())));
            break;
        }
      }
      else if (this.productType === 'HRA') {  //search in case of HRA
        switch (this.selectedFilter) {
          case 'byShopId': this.filteredData = this.typeData.filter((elem: any) => elem.salesInfo && elem.salesInfo.fboInfo && elem.salesInfo.fboInfo.customer_id && elem.salesInfo.fboInfo.customer_id.toLowerCase().includes(this.searchQuery.toLowerCase()))
            break;
          case 'byManagerName': this.filteredData = this.typeData.filter((elem: any) => elem.salesInfo && elem.salesInfo.fboInfo && elem.salesInfo.fboInfo.customer_id.toLowerCase().includes(this.searchQuery.toLowerCase()))
            break;
          case 'byFboName': this.filteredData = this.typeData.filter((elem: any) => elem.salesInfo && elem.salesInfo.fboInfo &&
            elem.salesInfo.fboInfo.fbo_name && elem.salesInfo.fboInfo.fbo_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
            break;
          case 'byContact': this.filteredData = this.typeData.filter((elem: any) => elem.salesInfo && elem.salesInfo.fboInfo && elem.salesInfo.fboInfo.owner_contact.toString().includes(this.searchQuery.toString()))
            break;
          case 'byOwnerName': this.filteredData = this.typeData.filter((elem: any) => elem.salesInfo && elem.salesInfo.fboInfo.owner_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
            break;
          // case 'byContact': this.filteredData = this.typeData.filter((elem: any) => elem.phoneNo.toString().includes(this.searchQuery.toString()))
          // break;

          case 'byLocation': this.filteredData = this.typeData.filter((elem: any) => elem.salesInfo && (elem.salesInfo.fboInfo.state.toLowerCase().includes(this.searchQuery.toLowerCase()) || elem.salesInfo.fboInfo.district.toLowerCase().includes(this.searchQuery.toLowerCase())));
            break;
        }
      }
    }
    this.filteredData.length ? this.showPagination = true : this.showPagination = false;
    this.filteredData.sort((a: any, b: any) => (a.salesInfo && b.salesInfo) && (new Date(b.salesInfo.createdAt).getTime() - new Date(a.salesInfo.createdAt).getTime()));
  }



  // this methord set the initializtion of case list component baased of diffent conditions
  initializeCaseList(): void {
    let user: any = this._registerService.LoggedInUserData();
    let parsedUser = JSON.parse(user);
    this.panelType = parsedUser.panel_type;
    this.initializeProductType();
    this.initializeServiceType();

    //getting state of the route for getting info about is it for training or cor case list
    const state = window.history.state;
    if (state && state.forTraining) {
      this.forTraining = state.forTraining;
      this.typeData = state.batchData.map((item: any) => {
        return { ...item.recipientInfo }
      });
      this.totalCount = this.typeData.length;
      this.filter();
      this.loading = false;
      // this.isRecipientList = true;
    } else if (state && state.forAudit) {
      this.forAudit = state.forAudit;
      this.typeData = state.batchData.map((item: any) => {
        return { ...item.shopInfo }
      });
      this.totalCount = this.typeData.length
      this.filter();
      this.loading = false;
    } else if (state && state.isRecipientList) {
      this.isRecipientList = true;
    }

    //if comming on this page from notification
    if (state && (state.byNotifications || state.byInnerPage)) {
      this.productType = state.product;
    }
  }


  //filter data according to tab changes
  toogleTabs(tab: string) {
    this.productType = tab;
    this.caseData = this.caseList.filter((data: any) => data.product_name && (data.product_name === this.productType));
    // console.log('kkkkkkkkkkkkkkk',this.caseList.filter((data: any) => data.product_name && data.product_name === 'Foscos'))
    this.initializeServiceType();
    this.setListProductWise();
  }


  //set the list type on the basis of product type
  setListProductWise() {
    this.totalCase = this.caseData.length;
    if (this.productType === 'Fostac') {
      this.setServiceType('Catering');
      // this.typeData = this.caseData;
      // this.totalCount = this.typeData.length;
      this.filter();
    }
    else if (this.productType === 'Foscos') {
      this.setServiceType("Registration");
      this.filter();
    }
    else if (this.productType === 'HRA') {
      this.typeData = this.caseData;
      this.filter();
    }
  }


  //methord intialize product type on the selection of product
  initializeProductType(): void {
    if (this.panelType === 'Fostac Filing Panel' || this.panelType === 'FSSAI Relationship Panel') {
      this.productType = 'Fostac';
    } else if (this.panelType === 'Fostac Filing Panel') {
      this.productType = 'Foscos';
    } else if (this.panelType === 'HRA Filing Panel') {
      this.productType = 'HRA'
    }
  }

  //methord initailly sets service type filter on the basis of product
  initializeServiceType(): void {
    if (this.productType === 'Fostac') {
      this.serviceType = 'Catering'
    } else if (this.productType === 'Foscos') {
      this.serviceType = 'Registration'
    }
  }

  //methord formats the sle date from date iso string to readable date
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
    modalRef.componentInstance.product = this.productType;
  }

  // methord opens recipient list modal 
  recipient(res: any, serviceType: string) {
    {
      if (res !== '' && serviceType === 'Fostac') {
        const modalRef = this.modalService.open(RecipientComponent, { size: 'xl', backdrop: 'static' });
        modalRef.componentInstance.fboData = res;
        modalRef.componentInstance.onlyRecpList = true;
        modalRef.componentInstance.serviceType = serviceType;
        modalRef.componentInstance.isVerifier = true;
      } else {
        const modalRef = this.modalService.open(RecipientComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.fboData = res;
        modalRef.componentInstance.serviceType = serviceType;
        modalRef.componentInstance.isVerifier = true;
      }

    }
  }

  //Methord opens fbo form in case of fostac
  doSale(fbo: any): void {
    const modalRef = this.modalService.open(FbonewComponent, { size: 'xl', backdrop: 'static' });
    modalRef.componentInstance.isForFostacSaleByCaseList = true;
    modalRef.componentInstance.isExistingFbo = true;
    modalRef.componentInstance.fetchExistingUser(fbo.fboInfo);
    modalRef.componentInstance.fboDataCommingAsModal = fbo.fboInfo;
    modalRef.result.then((result) => {
      // modalRef.componentInstance.fbo['fbo_name'].setValue(fbo.fboInfo.fbo_name);

    })
    // modalRef.componentInstance.fboForm.patchValue({'onwer_name': 22})


  }

  //methord for calculating verification status and color of status of each case
  decideResult(entry: any): { resultText: string, resultTextClass: string, resultIcon: IconDefinition , isForDocumentsNum: boolean, pendingDocs: number, approvedDocs: number} {
    const verificationData = entry.verificationInfo[0];

    let pendingDocs = 5; //pending docs number
    let approvedDocs = 0; //approved docs number

    let resultText: string = 'Un-Assigned';
    let resultTextClass: string = 'bg-warning';
    let resultIcon: IconDefinition = faCircleExclamation;
    let isForDocumentsNum: boolean = false;

    if (entry.salesInfo.fboInfo.isFboVerified) {
      resultText = 'Shop-Verified',
        resultTextClass = 'bg-success'
    } else if (entry.salesInfo.fboInfo.isVerificationLinkSend) {
      resultText = 'Shop-Verification-pending-on-customer-end';
      resultTextClass = 'bg-orange'
    }

    if (verificationData) {

      if (verificationData.isReqDocsVerified) {
        resultText = 'Documents-Verified';
        resultTextClass = 'bg-success'
      } else if (verificationData.isReqDocVerificationLinkSend) {
        resultText = 'Document-Verification-pending-on-customer-end';
        resultTextClass = 'bg-orange'

        //in case req doc verification link send we want to check how many docs one have
        //getting distinct list of documents from each entry
        let documents: Set<string> | string[] = [];
        if (entry.salesInfo.docs[0] && entry.salesInfo.docs[0].documents) {
          let reqDocs = basicRequiredDocs.map(doc => doc.display_name);
          documents = entry.salesInfo.docs[0].documents.map((a: any) => a.name);
          console.log(documents);
          documents = new Set(documents);
          documents = [...documents];
          documents.forEach(doc => {
            if (reqDocs.includes(doc)) {
              pendingDocs--;
              approvedDocs++;
            }
          });
          isForDocumentsNum = true;
          console.log('pending docs', pendingDocs)
          console.log('approved docs', approvedDocs)
        }

      } else if (verificationData.isProdVerified) {
        resultText = 'Product-Verified';
        resultTextClass = 'bg-success'
      }

      if (entry.salesInfo.fboInfo.isVerificationLinkSend && !entry.salesInfo.fboInfo.isFboVerified) {
        resultText = 'Shop-Verification-pending-on-customer-end';
        resultTextClass = 'bg-orange'
      }


    }


    return { resultText, resultTextClass,  resultIcon, isForDocumentsNum, pendingDocs, approvedDocs }
  }
}