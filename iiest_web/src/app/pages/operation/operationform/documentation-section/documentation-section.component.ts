import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { faCircleCheck, faCircleExclamation, faFileArrowUp } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DocumentationModalComponent } from 'src/app/pages/modals/documentation-modal/documentation-modal.component';
import { FbonewComponent } from 'src/app/pages/sales/fboproduct/fbonew/fbonew.component';
import { GetdataService } from 'src/app/services/getdata.service';
import { boardODirectorDocs, days, extraDoc, foscosDocments, fostacDocs, hraRequiredDocs, mandatoryDocs, manufacturingDoc, months, otherDocs, partnershipDocs, propratitorDocs } from 'src/app/utils/config';

@Component({
  selector: 'app-documentation-section',
  templateUrl: './documentation-section.component.html',
  styleUrls: ['./documentation-section.component.scss']
})
export class DocumentationSectionComponent implements OnInit, OnChanges {

  filedStatus: boolean = false;
  filed: boolean = false;
  selectedDocs: string[] = []; //var for sending a selected list of doc to doc modal by selecting them in multi select
  docList: any = []; //list of already uploaded doc

  //vars for deciding doc list in multiselect 
  allDocuments: any;
  foscosDocuments: any;
  foscosDocumentsName: string[];

  //product list will contain list if docs for sale
  productList: string[] = ['Fostac', 'Foscos', 'HRA', "Water Test", "Medical"]

  @ViewChild(FbonewComponent) fboNew: FbonewComponent;

  //Input vars
  @Input() shopId: string;
  @Input() productType: string;
  @Input() customerId: string;
  @Input() verifiedStatus: boolean = false;
  @Input() verifiedData: any = {};

  //output event emitters
  @Output() emitDocuments: EventEmitter<Array<{ name: string, format: string, src: string }>> = new EventEmitter<Array<{ name: string, format: string, src: string }>>;
  @Output() refreshAuditLog: EventEmitter<void> = new EventEmitter<void>

  // icons
  faCircleCheck = faCircleCheck;
  faCircleExclamation = faCircleExclamation;
  faFileArrowUp = faFileArrowUp;

  //var for scheduling form in case of hra
  schedulingForm: FormGroup = new FormGroup({
    auditDate: new FormControl(''),
    changeDate: new FormControl(''),
    isRequiredDocUploaded: new FormControl(''),
    auditor: new FormControl(''),
  });
  scheduledStatus: boolean = false;
  scheduled: boolean = false;
  hraBookDateStr: string;
  changedDateStr: string;
  loading: boolean;
  isAllHraDocAvilable = false;

  get scheduleform(): { [key: string]: AbstractControl } {
    return this.schedulingForm.controls;
  }

  constructor(private formBuilder: FormBuilder,
    private _getDataService: GetdataService,
    private ngbModal: NgbModal) {

  }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes['verifiedData'] && changes['verifiedData'].currentValue) {
      this.getParticularDocs();
    }
    if (changes && changes['verifiedStatus'] && changes['verifiedStatus'].currentValue) {
      this.getParticularDocs();
      this._getDataService.getCandidateAuditBatch(this.verifiedData._id).subscribe({
        next: res => {
          console.log(res);
          this.schedulingForm.patchValue({ 'auditor': res.batchData.auditor });
          this.hraBookDateStr = this.getFormatedDate(res.batchData.auditDates);
        },
        error: err => {
          console.log(err);
        }
      })
    }
    if (changes && changes['customerId'] && changes['customerId'].currentValue) {
      this.patchFbo();
      this.getDocs();
    }
  }

  onSchedule() {
    this.scheduled = true;
    if (this.schedulingForm.invalid) {
      return
    }
    // this.loading = true;//starts the loading
    // if (this.verifiedDataId) {
    //   const scheduledData = { ...this.schedulingForm.value };
    //   this._registerService.enrollRecipient(this.verifiedDataId, scheduledData).subscribe({
    //     next: res => {
    //       this.scheduledStatus = true;
    //       this.emitScheduledStatus.emit(this.scheduledStatus);
    //       this.emitScheduledDataId.emit(res.scheduledId);
    //       this.refreshAuditLog.emit();
    //       this._toastrService.success(res.message, 'Enrolled');
    //       this.loading = false;
    //     },
    //     error: err => {
    //       console.log(err.error);
    //       if (err.error.rollNoErr) this._toastrService.warning('Enrollment number already exsists');
    //       if (err.error.openBatchErr) this._toastrService.warning(`A ${err.error.openBatchCategory} batch at ${err.error.openBatchLocation} already exsists on ${this.getFormatedDate(err.error.openBatchDate)}`);
    //       this.loading = false;
    //     }
    //   })
    // }
  }

  getSelectedDocs($event: string[]): void { // this methord set the selected doc by th help of multidoc
    this.selectedDocs = $event;
  }

  getParticularDocs() { //This methord initailize foscos documents list the basis of verified data
    if (this.productType === 'Foscos') {
      const mandatoryDocsList = mandatoryDocs;
      this.foscosDocuments = [...mandatoryDocsList];
      switch (this.verifiedData.ownershipType) {
        case 'Propraitorship':
          this.foscosDocuments = [...this.foscosDocuments, ...propratitorDocs];
          break;
        case 'Partnership':
          this.foscosDocuments = [...this.foscosDocuments, ...partnershipDocs];
          break;
        case 'Board of Directors':
          this.foscosDocuments = [...this.foscosDocuments, ...boardODirectorDocs];
          break;
      }

      if (this.verifiedData.kob === 'Manufacturer') {
        console.log(this.verifiedData.kob);
        this.foscosDocuments = [...this.foscosDocuments, ...manufacturingDoc];
      }

      this.foscosDocuments = [...this.foscosDocuments, ...extraDoc];
      this.foscosDocuments = [...this.foscosDocuments, ...otherDocs]
    } else if (this.productType === 'Fostac') {
      this.foscosDocuments = fostacDocs;
    } else if (this.productType === 'HRA') {
      this.foscosDocuments = hraRequiredDocs;
    }

    this.foscosDocumentsName = this.foscosDocuments.map((item: any) => item.name);
  }

  getDocs(): void { //methord for getting uploaed doc list from backend for passing it to doc modal and doc-tab
    this._getDataService.getDocs(this.customerId).subscribe({
      next: res => {
        // this.docList = res.docs.map((item: any) => {
        //   return { ...item, src: item.src[0] }
        // });
        this.docList = res.docs;
        this.emitDocuments.emit(this.docList); //emit 
        this.refreshAuditLog.emit();
      }
    });
  }

  openDocumentationModal() { //this methord opens the doc modal 
    const modalRef = this.ngbModal.open(DocumentationModalComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.docsNameArr = this.selectedDocs;
    modalRef.componentInstance.shopId = this.shopId;
    modalRef.componentInstance.handlerId = this.customerId;
    modalRef.componentInstance.docsArr = this.foscosDocuments.filter((item: any) => this.selectedDocs.includes(item.name.toString()));
    modalRef.componentInstance.docList = this.docList;
    modalRef.componentInstance.reloadData.subscribe(() => {
      this.getDocs();
      modalRef.componentInstance.docList = this.docList;
    });
  }

  patchFbo(): void {
    this._getDataService.getMoreCaseInfo(this.productType, this.shopId).subscribe({ // we will patch fbo comming from sale to fbo of fbo form 
      next: res => {
        const fboInfo = res.populatedInfo.salesInfo.fboInfo //getting fbo info from api
        this.fboNew.fboForm.patchValue({
          boInfo: fboInfo.boInfo._id,
          fbo_name: fboInfo.fbo_name,
          owner_name: fboInfo.owner_name,
          business_entity: fboInfo.boInfo.business_entity,
          business_category: fboInfo.boInfo.business_category,// form control added by chandan for business_Owner
          business_ownership_type: fboInfo.boInfo.business_ownership_type, // form control added for business_Owner
          manager_name: fboInfo.boInfo.manager_name,
          owner_contact: fboInfo.owner_contact,
          email: fboInfo.boInfo.email,
          state: fboInfo.state,
          district: fboInfo.district,
          village: fboInfo.village,
          tehsil: fboInfo.tehsil,
          address: fboInfo.address,
          pincode: fboInfo.pincode,
          business_type: fboInfo.business_type,
        });

        if (fboInfo.business_type === 'b2b') {//patch gst number in case of gst businesstype = b2b
          this.fboNew.fboForm.patchValue({ gst_number: fboInfo.gst_number });
        }

        this.fboNew.existingFboId = fboInfo.customer_id;
      }
    });

  }

  getFormatedDate(date: string | string[]): string { // methord for getting formatted dates

    let formattedDate = '';
    if (typeof (date) == 'string') {
      const originalDate = new Date((date));
      const year = originalDate.getFullYear();
      const hours = String(originalDate.getHours()).padStart(2, '0');
      const minutes = String(originalDate.getMinutes()).padStart(2, '0');
      const ampm = originalDate.getHours() >= 12 ? 'PM' : 'AM';
      if (Math.floor((new Date().getTime() - originalDate.getTime()) / (24 * 60 * 60 * 1000)) < 7) {
        formattedDate = `${hours}:${minutes} ${ampm}, ${days[originalDate.getDay()]}`;
      } else {
        const month = months[originalDate.getMonth()];
        const day = String(originalDate.getDate()).padStart(2, '0');
        formattedDate = `${hours}:${minutes} ${ampm}, ${day}-${month}-${year}`;
      }
    } else {
      if (date.length === 1) {
        let orignalDate = new Date(date[0].toString())
        return `${orignalDate.getDate()}-${months[orignalDate.getMonth()]}-${orignalDate.getFullYear()}`
      } else {
        let startDate = new Date(date[0].toString());
        let endDate = new Date(date[date.length - 1].toString());
        return `${startDate.getDate()}-${months[startDate.getMonth()]}-${startDate.getFullYear()} to ${endDate.getDate()}-${months[endDate.getMonth()]}-${endDate.getFullYear()}`
      }
    }

    return formattedDate;
  }

  checkHRADocs(): void {
    const uploadedDocName = this.docList.map((doc: any) => doc.name);
    const requiedDocName = hraRequiredDocs.map((doc: any) => doc.name);
  }

}
