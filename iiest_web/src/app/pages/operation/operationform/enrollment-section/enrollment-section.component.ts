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
  
  //input variables
  @Input() verifiedDataId: string;

  @Input() salesDate: string;

  @Input() verifiedStatus: boolean;

  //output event emitters
  @Output() emitEnrolledDataId:EventEmitter<string>= new EventEmitter<string>

  @Output() refreshAuditLog:EventEmitter<void>= new EventEmitter<void>

  @Output() emitEnrolledStatus:EventEmitter<boolean>= new EventEmitter<boolean>

  //icons
  faCircleExclamation = faCircleExclamation
  faCircleCheck = faCircleCheck;

  enrollmentForm: FormGroup = new FormGroup({
    tentative_training_date: new FormControl(''),
    fostac_training_date: new FormControl(''),
    roll_no: new FormControl(''),
  })

  constructor(private formBuilder: FormBuilder,
    private _getDataService: GetdataService,
    private _registerService: RegisterService,
    private _toastrService: ToastrService) {

  }

  ngOnInit(): void {
    this.enrollmentForm = this.formBuilder.group({
      tentative_training_date: ['', Validators.required],
      fostac_training_date: ['', Validators.required],
      roll_no: ['', Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes['verifiedDataId']) {
      if (changes['verifiedDataId'].currentValue) {
        this.getFostacEnrolledData();
      }
    }

    if (changes && changes['salesDate']) {
      if (changes['salesDate'].currentValue) {
        this.setTentativeTrainingDate(this.salesDate);
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
    if(this.verifiedDataId){
      this._registerService.enrollRecipient(this.verifiedDataId, this.enrollmentForm.value).subscribe({
        next: res => {
          this._toastrService.success(res.message, 'Enrolled');
          this.enrolledStatus = true;
          this.emitEnrolledStatus.emit(this.enrolledStatus);
          this.emitEnrolledDataId.emit(res.enrolledId);
          this.refreshAuditLog.emit()
        },
        error: err => {
          if (err.error.unverifiedError)
            this._toastrService.warning(err.error.message, err.error.title)
        }
      })
  
    }
    
  }

  setTentativeTrainingDate(salesDate: string): void {
    const date = new Date(salesDate);
    date.setDate(date.getDate() + 7);
    while (ourHolidays.find((item: any) => item.date === this.getFormatedDate(date.toString())) || date.getDay() === 0) {
      date.setDate(date.getDate() + 1);
    }
    this.enrollmentForm.patchValue({ tentative_training_date: this.getFormatedDate(date.toString()) });
    this.enrollmentForm.patchValue({ fostac_training_date: this.getFormatedDate(date.toString()) });
  }

  getFormatedDate(date: string): string {
    const originalDate = new Date(date);
    const year = originalDate.getFullYear();
    const month = String(originalDate.getMonth() + 1).padStart(2, '0');
    const day = String(originalDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }

  getFostacEnrolledData() {
    this._getDataService.getFostacEnrolledData(this.verifiedDataId).subscribe({
      next: res => {
        if (res) {
          this.enrolledStatus = true;
          this.emitEnrolledStatus.emit(this.enrolledStatus);
          this.enrollmentForm.patchValue({ fostac_training_date: this.getFormatedDate(res.enrolledData.fostac_training_date.toString()) });
          this.enrollmentForm.patchValue({ roll_no: res.enrolledData.roll_no });
          this.emitEnrolledDataId.emit(res.enrolledData._id);
        } else {
          this.enrolledStatus = false;
          this.emitEnrolledStatus.emit(this.enrolledStatus);
        }
      }
    });
  }
}
