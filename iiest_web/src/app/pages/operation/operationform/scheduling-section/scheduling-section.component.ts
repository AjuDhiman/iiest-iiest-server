import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { faCircleCheck, faCircleExclamation, faFileArrowUp } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { DocumentationModalComponent } from 'src/app/pages/modals/documentation-modal/documentation-modal.component';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';
import { hraRequiredDocs, ourHolidays } from 'src/app/utils/config';


@Component({
  selector: 'app-scheduling-section',
  templateUrl: './scheduling-section.component.html',
  styleUrls: ['./scheduling-section.component.scss']
})
export class SchedulingSectionComponent implements OnInit {

  //global variables
  scheduled: boolean = false;
  scheduledStatus: boolean = false;
  ourHolidays = ourHolidays;
  loading: boolean = false;
  hraReqDocumentsName: string[] = [];
  selectedDocs: string[] = [];
  docList: any = [];

  //input variables
  @Input() verifiedDataId: string;

  @Input() verifiedData: any;

  @Input() shopId: string;

  @Input() verifiedStatus: boolean;

  //output event emitters
  @Output() emitScheduledDataId: EventEmitter<string> = new EventEmitter<string>;

  @Output() refreshAuditLog: EventEmitter<void> = new EventEmitter<void>;

  @Output() emitScheduledStatus: EventEmitter<boolean> = new EventEmitter<boolean>;

  //icons
  faCircleExclamation = faCircleExclamation
  faCircleCheck = faCircleCheck;
  faFileArrowUp = faFileArrowUp;

  //Fostac Enrollment Reactive form 
  schedulingForm: FormGroup = new FormGroup({
    tentative_audit_date: new FormControl(''),
    hra_book_date: new FormControl(''),
    auditor_name: new FormControl(''),
  });

  constructor(private formBuilder: FormBuilder,
    private _getDataService: GetdataService,
    private _registerService: RegisterService,
    private _toastrService: ToastrService,
    private ngbModal: NgbModal) {
  }

  ngOnInit(): void {
    this.schedulingForm = this.formBuilder.group({
      tentative_audit_date: ['', Validators.required],
      hra_book_date: ['', Validators.required],
      auditor_name: ['', Validators.required],
    });

    this.getDocs();

    this.hraReqDocumentsName = hraRequiredDocs.map((item: any) => item.name);
  }

  get scheduleform(): { [key: string]: AbstractControl } {
    return this.schedulingForm.controls;
  }

  onSchedule() {
    this.scheduled = true;
    if (this.schedulingForm.invalid) {
      return
    }
    this.loading = true;//starts the loading
    if (this.verifiedDataId) {
      const scheduledData = { ...this.schedulingForm.value };
      this._registerService.enrollRecipient(this.verifiedDataId, scheduledData).subscribe({
        next: res => {
          this.scheduledStatus = true;
          this.emitScheduledStatus.emit(this.scheduledStatus);
          this.emitScheduledDataId.emit(res.scheduledId);
          this.refreshAuditLog.emit();
          this._toastrService.success(res.message, 'Enrolled');
          this.loading = false;
        },
        error: err => {
          console.log(err.error);
          if (err.error.rollNoErr) this._toastrService.warning('Enrollment number already exsists');
          if (err.error.openBatchErr) this._toastrService.warning(`A ${err.error.openBatchCategory} batch at ${err.error.openBatchLocation} already exsists on ${this.getFormatedDate(err.error.openBatchDate)}`);
          this.loading = false;
        }
      })
    }
  }

  setTentativeAuditDate(salesDate: string): void {
    const date = new Date(salesDate);
    date.setDate(date.getDate() + 7);
    //we will increase training date by 1 while we find any holiday or sunday on that day
    while (ourHolidays.find((item: any) => item.date === this.getFormatedDate(date.toString())) || date.getDay() === 0) {
      date.setDate(date.getDate() + 1);
    }
    this.schedulingForm.patchValue({ tentative_audit_date: this.getFormatedDate(date.toString()) });
  }

  getFormatedDate(date: string): string {
    const originalDate = new Date(date);
    const year = originalDate.getFullYear();
    const month = String(originalDate.getMonth() + 1).padStart(2, '0');
    const day = String(originalDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }

  openDocumentationModal() { //this methord opens the doc modal 
    const modalRef = this.ngbModal.open(DocumentationModalComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.docsArr = hraRequiredDocs.filter((item: any) => this.selectedDocs.includes(item.name.toString()));
    modalRef.componentInstance.shopId = this.shopId;
    console.log(this.shopId);
    modalRef.componentInstance.docList = this.docList;
    modalRef.componentInstance.reloadData.subscribe(() => {
      this.getDocs();
      modalRef.componentInstance.docList = this.docList;
    });
  }

  getSelectedDocs($event: string[]): void { // this methord set the selected doc by th help of multidoc
    this.selectedDocs = $event;
  }

  getDocs(): void { //methord for getting uploaed doc list from backend for passing it to doc modal and doc-tab
    this._getDataService.getDocs(this.shopId).subscribe({
      next: res => {
        this.docList = res.docs; 
        this.refreshAuditLog.emit();
      }
    });
  }
}