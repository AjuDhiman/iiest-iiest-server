import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { faCircleCheck, faCircleExclamation, faFileArrowUp } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DocumentationModalComponent } from 'src/app/pages/modals/documentation-modal/documentation-modal.component';
import { GetdataService } from 'src/app/services/getdata.service';
import { boardODirectorDocs, foscosDocments, mandatoryDocs, manufacturingDoc, partnershipDocs, propratitorDocs } from 'src/app/utils/config';

@Component({
  selector: 'app-documentation-section',
  templateUrl: './documentation-section.component.html',
  styleUrls: ['./documentation-section.component.scss']
})
export class DocumentationSectionComponent implements OnInit, OnChanges {

  filedStatus: boolean = false;

  filed: boolean = false;

  selectedDocs: string[] = [];

  docList: any = [];

  @Input() shopId: string;

  @Input() verifiedStatus: boolean = false;

  @Input() verifiedData: any = {};

  @Output() emitDocuments: EventEmitter<Array<{ name: string, format: string, src: string }>> = new EventEmitter<Array<{ name: string, format: string, src: string }>>;

  // icons
  faCircleCheck = faCircleCheck;
  faCircleExclamation = faCircleExclamation;
  faFileArrowUp = faFileArrowUp;

  foscosDocuments: any = foscosDocments;
  foscosDocumentsName: string[];


  //Filing Reactive form 
  filingForm: FormGroup = new FormGroup({
    username: new FormControl(''),
    password: new FormControl(''),
    payment_amount: new FormControl(''),
    payment_recipt: new FormControl(''),
    payment_date: new FormControl('')
  });

  constructor(private formBuilder: FormBuilder,
    private _getDataService: GetdataService,
    private ngbModal: NgbModal) {

  }

  ngOnInit(): void {
    this.filingForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      payment_amount: ['', Validators.required],
      payment_receipt: ['', Validators.required],
      payment_date: ['', Validators.required],
    });

    this.getDocs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes['verifiedData'] && changes['verifiedData'].currentValue) {
      this.getParticularDocs();
    }
  }

  get filingform(): { [key: string]: AbstractControl } {
    return this.filingForm.controls;
  }

  onFile() {

  }

  openDocumentationModal() {
    const modalRef = this.ngbModal.open(DocumentationModalComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.docsNameArr = this.selectedDocs;
    modalRef.componentInstance.shopId = this.shopId;
    modalRef.componentInstance.docsArr = this.foscosDocuments.filter((item: any) => this.selectedDocs.includes(item.name.toString()));
    modalRef.componentInstance.docList = this.docList;
    modalRef.componentInstance.reloadData.subscribe(() => {
      this.getDocs();
      modalRef.componentInstance.docList = this.docList;
    });
  }

  getSelectedDocs($event: string[]): void {
    this.selectedDocs = $event;
  }

  getDocs(): void {
    this._getDataService.getDocs(this.shopId).subscribe({
      next: res => {
        this.docList = res.docs.map((item: any) => {
          return {...item, src: item.src[0]}
        });
        // this.docList = res.docs;
        this.emitDocuments.emit(this.docList);
      }
    });
  }

  getParticularDocs() {
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

    if(this.verifiedData.kob === 'Manufacturer') {
      console.log(this.verifiedData.kob);
        this.foscosDocuments = [...this.foscosDocuments, ...manufacturingDoc];
    }

    this.foscosDocumentsName = this.foscosDocuments.map((item: any) => item.name);
  }

}
