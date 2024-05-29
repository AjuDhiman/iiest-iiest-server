import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { faCircleCheck, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';
import { ourHolidays } from 'src/app/utils/config';

@Component({
  selector: 'app-enrollment-section',
  templateUrl: './enrollment-section.component.html',
  styleUrls: ['./enrollment-section.component.scss']
})
export class EnrollmentSectionComponent implements OnInit, OnChanges {

  //global variables
  enrolled: boolean = false;
  enrolledStatus: boolean = false;
  ourHolidays = ourHolidays;
  loading: boolean = false;

  //input variables
  @Input() verifiedDataId: string;

  @Input() verifiedData: any;

  @Input() verifiedStatus: boolean;

  //output event emitters
  @Output() emitEnrolledDataId: EventEmitter<string> = new EventEmitter<string>;

  @Output() refreshAuditLog: EventEmitter<void> = new EventEmitter<void>;

  @Output() emitEnrolledStatus: EventEmitter<boolean> = new EventEmitter<boolean>;

  //icons
  faCircleExclamation = faCircleExclamation
  faCircleCheck = faCircleCheck;

  //Fostac Enrollment Reactive form 
  enrollmentForm: FormGroup = new FormGroup({
    tentative_training_date: new FormControl(''),
    fostac_training_date: new FormControl(''),
    username: new FormControl(''),
    password: new FormControl(''),
    roll_no: new FormControl(''),
    trainer: new FormControl(''),
    venue: new FormControl('')
  });

  constructor(private formBuilder: FormBuilder,
    private _getDataService: GetdataService,
    private _registerService: RegisterService,
    private _toastrService: ToastrService) {

  }

  ngOnInit(): void {
    this.enrollmentForm = this.formBuilder.group({
      tentative_training_date: ['', Validators.required],
      fostac_training_date: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      roll_no: ['', Validators.required],
      trainer: ['', Validators.required],
      venue: ['', Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes['verifiedDataId']) {
      if (changes['verifiedDataId'].currentValue) {
        this.getFostacEnrolledData();
      }
    }

    if (changes && changes['verifiedData']) {
      if (changes['verifiedData'].currentValue) {
        this.setTentativeTrainingDate(this.verifiedData.createdAt);
        this.enrollmentForm.patchValue({ 'venue': this.verifiedData.batchData.venue });
        this.enrollmentForm.patchValue({ 'trainer': this.verifiedData.batchData.trainer });
        this.enrollmentForm.patchValue({ 'fostac_training_date': this.getFormatedDateWithTime(this.verifiedData.batchData.trainingDate.toString()) });
      }
    }
  }

  get enrollmentform(): { [key: string]: AbstractControl } {
    return this.enrollmentForm.controls;
  }

  onEnroll() {
    this.enrolled = true;
    if (this.enrollmentForm.invalid) {
      return
    }
    this.loading = true;//starts the loading
    if (this.verifiedDataId) {
      const enrollmentData = { ...this.enrollmentForm.value, batchInfo: this.verifiedData.batchInfo, email: this.verifiedData.email };
      this._registerService.enrollRecipient(this.verifiedDataId, enrollmentData).subscribe({
        next: res => {
          this.enrolledStatus = true;
          this.emitEnrolledStatus.emit(this.enrolledStatus);
          this.emitEnrolledDataId.emit(res.enrolledId);
          this.refreshAuditLog.emit();
          this._toastrService.success(res.message, 'Enrolled');
          this.loading = false;
        },
        error: err => {
          if (err.error.rollNoErr) this._toastrService.warning('Enrollment number already exsists');
          if (err.error.openBatchErr) this._toastrService.warning(`A ${err.error.openBatchCategory} batch at ${err.error.openBatchLocation} already exsists on ${this.getFormatedDate(err.error.openBatchDate)}`);
          this.loading = false;
        }
      });
    }
  }

  getFostacEnrolledData() {
    this.loading = true;
    this._getDataService.getFostacEnrolledData(this.verifiedDataId).subscribe({
      next: res => {
        if (res) {
          // we want to update enrollment form's value if it's data exsists in database and disable it 
          this.enrollmentForm.patchValue({ fostac_training_date: this.getFormatedDateWithTime(res.enrolledData.fostac_training_date[0].toString()) });
          this.enrollmentForm.patchValue({ roll_no: res.enrolledData.roll_no });
          this.enrollmentForm.patchValue({ username: res.enrolledData.username });
          this.enrollmentForm.patchValue({ password: res.enrolledData.password });
          this.enrollmentForm.patchValue({ trainer: res.enrolledData.trainer });
          this.enrollmentForm.patchValue({ venue: res.enrolledData.venue });
          this.enrolledStatus = true;
          this.emitEnrolledStatus.emit(this.enrolledStatus);
          this.emitEnrolledDataId.emit(res.enrolledData._id);
          this.loading = false;
        } else {
          this.enrolledStatus = false;
          this.emitEnrolledStatus.emit(this.enrolledStatus);
          this.loading = false;
        }
      }
    });
  }

  setTentativeTrainingDate(salesDate: string): void {
    const date = new Date(salesDate);
    date.setMonth(date.getMonth() + 1);
    //we will increase training date by 1 while we find any holiday or sunday on that day
    while (ourHolidays.find((item: any) => item.date === this.getFormatedDate(date.toString())) || date.getDay() === 0) {
      date.setDate(date.getDate() + 1);
    }
    this.enrollmentForm.patchValue({ tentative_training_date: this.getFormatedDate(date.toString()) });
  }

  getFormatedDate(date: string): string {
    const originalDate = new Date(date);
    const year = originalDate.getFullYear();
    const month = String(originalDate.getMonth() + 1).padStart(2, '0');
    const day = String(originalDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }

  getFormatedDateWithTime(date: string): string {
    const originalDate = new Date(date);
    const year = originalDate.getFullYear();
    const month = String(originalDate.getMonth() + 1).padStart(2, '0');
    const day = String(originalDate.getDate()).padStart(2, '0');
    const hours = String(originalDate.getHours()).padStart(2, '0');
    const minutes = String(originalDate.getMinutes()).padStart(2, '0');
    const seconds = String(originalDate.getSeconds()).padStart(2, '0');
    const formattedDateNTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return formattedDateNTime;
  }
  
}
