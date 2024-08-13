import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GeneralSectionComponent } from 'src/app/pages/operation/operationform/general-section/general-section.component';
import { RegisterService } from 'src/app/services/register.service';
import { IconDefinition, faFilePdf, faFileImage, faDownload, faFileZipper, faCircleCheck, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { ViewDocumentComponent } from 'src/app/pages/modals/view-document/view-document.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { basicRequiredDocs, config } from 'src/app/utils/config';
import { GetdataService } from 'src/app/services/getdata.service';
import { VerificationSectionComponent } from './verification-section/verification-section.component';

@Component({
  selector: 'app-operationform',
  templateUrl: './operationform.component.html',
  styleUrls: ['./operationform.component.scss']
})

export class OperationformComponent implements OnInit {
  //global variables 
  customerId: string;
  candidateId: string = '';
  verifiedData: any;
  verifiedDataId: string;
  enrolledDataId: string;
  verifiedStatus: boolean;
  enrolledStatus: boolean;
  attendanceStatus: boolean;
  prevSecResult: string;
  salesDate: string;
  productType: string;
  conformationText: string;
  activeTab: string = 'form';
  faFilePdf: IconDefinition = faFilePdf;
  faFileImage: IconDefinition = faFileImage;
  faDownload: IconDefinition = faDownload;
  faFileZipper: IconDefinition = faFileZipper;
  documents: { name: string, src: string, format: string }[] = [];
  allDocs: any;
  isTrainer: boolean = false;
  isVerifier: boolean = false;
  isSaleFormVisible: boolean = false;
  checkedDocs: any = [];
  caseData: any;
  requiredDocs = basicRequiredDocs;
  ShopSecVerifedStatus: boolean = false;
  productSecVerifedStatus: boolean = false;
  docSecVerifedStatus: boolean = false;

  //doc list
  docList: any = [];

  DOC_URL: string = config.DOC_URL;

  @ViewChild(GeneralSectionComponent) generalsec: GeneralSectionComponent;

  @ViewChild(VerificationSectionComponent) docVerificationSec: VerificationSectionComponent;

  constructor(
    private activatedRoute: ActivatedRoute,
    private _registerService: RegisterService,
    private _getDataService: GetdataService,
    private modalService: NgbModal,
    private _utilService: UtilitiesService,
    private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.candidateId = this.activatedRoute.snapshot.params['id'];
    this.productType = this.activatedRoute.snapshot.params['product'];
    this.getUserProductType();
  }

  //this methord for geting recipient customer id 
  getCustomerId($event: any): void {
    this.customerId = $event;
  }

  //this methord for geting case data 
  getCaseData($event: any): void {
    this.caseData = $event;
    this.customerId = this.caseData.salesInfo.fboInfo.customer_id;
    //gstting all doc list
    this.getDocList();
    
  }

  //this methord catch sales date from verification section which we will pass in enrollment section
  getShopSecVerifiedStatus($event: boolean): void {
    this.ShopSecVerifedStatus = $event;
  }

  //this methord catch sales date from verification section which we will pass in enrollment section
  getProductSecVerifiedStatus($event: boolean): void {
    this.productSecVerifedStatus = $event;
  }

  //this methord catch sales date from verification section which we will pass in enrollment section
  getDocSecVerifiedStatus($event: boolean): void {
    this.docSecVerifedStatus = $event;
  }


  //this methord catch sales date from verification section which we will pass in enrollment section
  getSalesData($event: string): void {
    this.salesDate = $event;
  }

  // this methord catch verification Id from verification section which we will pass in enrollment section
  getVerifiedDataId($event: string): void {
    this.verifiedDataId = $event;
  }

  // this methord catch verification data from verification section 
  getVerifiedData($event: string): void {
    this.verifiedData = $event;
    
    if(this.verifiedData){
      const doclist = this.verifiedData.checkedDocs
      this.requiredDocs.forEach(doc => {
        doclist.forEach((a:any) => {
          if(a.name === doc.display_name){
            doc.isPendingByCustomer = true
          }
        })
      })

      this.requiredDocs = this.requiredDocs.map(a => a)

      // this.docVerificationSec.isPendingByCustomer = this.verifiedData.isReqDocVerificationLinkSend;
      // this.docVerificationSec.verifiedStatus = this.verifiedData.isReqDocsVerified;

      // this.docVerificationSec.decideResult();
     
    }

  }

  // this methord catch verification sataus from verification section which we will pass in enrollment section
  getVerifiedStatus($event: boolean): void {
    this.verifiedStatus = $event
  }

  // this methord catch enrollment Id from Enrollment section which we will pass in Attendance section
  getEnrolledDataId($event: string): void {
    this.enrolledDataId = $event;
  }

  // this methord catch enrollment status from Enrollment section which we will pass in Attendance section
  getEnrolledStatus($event: boolean): void {
    this.enrolledStatus = $event;
  }

  // this methord catch attendance status from Attendance section which we will pass in Certification section
  getAttendanceStatus($event: boolean): void {
    this.attendanceStatus = $event;
  }

  // this methord catch attendance status from Attendance section which we will pass in Certification section
  gePrevSecResult($event: string): void {
    this.prevSecResult = $event;
  }

  //methord for getting checked docs from document verification section
  getCheckedDocs($event: any) {
    this.requiredDocs.forEach((doc) => {
      //decidin check of all req docs based checks in document verification section
      if($event.includes(doc.display_name)) {
        doc.isChecked = true
      }
    })

    //reasiginig the require docs to requied docs so we can change refrence for getting change in child components
    this.requiredDocs = this.requiredDocs.map(doc => doc);
  }

  //methord for getting doc for sale names
  getDocForSaleNames($event: string[]): void {

    this.requiredDocs.forEach((doc) => {
      if($event.includes(doc.product_name)) {
        doc.isSelectedForSale = true
      } else {
        doc.isSelectedForSale = false;
      }
    });

    //temporarly cahngeing refs because we want to etect cahges in required doc in child coppenents

    const temp = this.requiredDocs.map((doc) => doc);
    this.requiredDocs = this.requiredDocs.map((doc) => doc);
    // this.requiredDocs = temp;
    this.cdr.detectChanges();
  }

  getDocuments($event: any): void {
    $event.forEach((item: any) => {
      if (!this.documents.find((elem: any) => (elem.name === item.name)) && item.src) {
        this.documents.push(item);
      }
    });
    this.allDocs = this.documents.flatMap(doc => doc.src);
  }

  getFileIcon(type: string): IconDefinition {
    let fileIcon: IconDefinition = faFilePdf;
    switch (type) {
      case 'pdf':
        fileIcon = faFilePdf
        break;
      case 'image':
        fileIcon = faFileImage
        break;
    }
    return fileIcon
  }

  getUserProductType(): void {
    let user: any = this._registerService.LoggedInUserData();
    let parsedUser = JSON.parse(user);
    let panelType = parsedUser.panel_type;

    switch (panelType) {
      // case 'Fostac Panel':
      //   this.productType = 'Fostac';
      //   break;
      // case 'Foscos Panel':
      //   this.productType = 'Foscos';
      //   break;
      // case 'HRA Panel':
      //   this.productType = 'HRA';
      //   break;
      // case 'FSSAI Training Panel':
      //   this.productType = 'Fostac';
      //   this.isTrainer = true;
      //   break;

      // default:
      //   this.productType = 'Fostac';
      case 'Verifier Panel':
        this.isVerifier = true;
        break;
    }
  }

  toogleTabs(tab: string): void {
    this.activeTab = tab;
  }

  viewDocument(res: any): void {
    const modalRef = this.modalService.open(ViewDocumentComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.doc = res;
  }

  downloadDoc(documentId: string, contentType: string) {
    this._utilService.downloadDoc(documentId, contentType);
  }

  //methord for getting all doc list of a shop or recps of whom ths form belongs to
  getDocList(): void {
    if(this.customerId){
      this._getDataService.getDocs(this.customerId).subscribe({
        next: res => {
          if(res){
            this.docList = res.docs
  
            const docNames = this.docList.map((doc: any) => doc.name);
    
            //configuringa all docs that we have that doc or not
            this.requiredDocs.forEach((doc) => {
              if(docNames.includes(doc.display_name)) {
                doc.isAlreadyAvilable = true
              }
            });
          }
          
        }
      })
    }
   
  }
}
