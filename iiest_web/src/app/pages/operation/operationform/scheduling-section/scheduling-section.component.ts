import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { faCircleCheck, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';
import { ourHolidays } from 'src/app/utils/config';


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

  //input variables
  @Input() verifiedDataId: string;

  @Input() verifiedData: any;

  @Input() verifiedStatus: boolean;

  //output event emitters
  @Output() emitScheduledDataId: EventEmitter<string> = new EventEmitter<string>;

  @Output() refreshAuditLog: EventEmitter<void> = new EventEmitter<void>;

  @Output() emitScheduledStatus: EventEmitter<boolean> = new EventEmitter<boolean>;

  //icons
  faCircleExclamation = faCircleExclamation
  faCircleCheck = faCircleCheck;

  //Fostac Enrollment Reactive form 
  schedulingForm: FormGroup = new FormGroup({
    tentative_audit_date: new FormControl(''),
    hra_book_date: new FormControl(''),
    auditor_name: new FormControl(''),
  });

  constructor(private formBuilder: FormBuilder,
    private _getDataService: GetdataService,
    private _registerService: RegisterService,
    private _toastrService: ToastrService) {
  }

  ngOnInit(): void {
    this.schedulingForm = this.formBuilder.group({
      tentative_audit_date: ['', Validators.required],
      hra_book_date: ['', Validators.required],
      auditor_name: ['', Validators.required],
      });
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
      const scheduledData = {...this.schedulingForm.value};
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
}