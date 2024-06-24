import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { faCircleCheck, faCircleExclamation, faFileArrowUp } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DocumentationModalComponent } from 'src/app/pages/modals/documentation-modal/documentation-modal.component';
import { GetdataService } from 'src/app/services/getdata.service';
import { boardODirectorDocs, extraDoc, foscosDocments, fostacDocs, mandatoryDocs, manufacturingDoc, otherDocs, partnershipDocs, propratitorDocs } from 'src/app/utils/config';

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
  foscosDocuments: any;
  foscosDocumentsName: string[];

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
    if (changes && changes['customerId'] && changes['customerId'].currentValue) {
      this.getDocs();
    }
  }

  onFile() {

  }

  getSelectedDocs($event: string[]): void { // this methord set the selected doc by th help of multidoc
    this.selectedDocs = $event;
  }

  getParticularDocs() { //This methord initailize foscos documents list the basis of verified data
    if(this.productType === 'Foscos') {
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
    } else if(this.productType === 'Fostac') {
      this.foscosDocuments = fostacDocs;
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

}
