import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { faCircleCheck, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';

@Component({
  selector: 'app-attendance-section',
  templateUrl: './attendance-section.component.html',
  styleUrls: ['./attendance-section.component.scss']
})
export class AttendanceSectionComponent implements OnInit, OnChanges {
   //global variables
  submitted:boolean=false;
  submittedStatus: boolean = false;
  attendeeStatus:string = '';

  //icons
  faCircleCheck=faCircleCheck;
  faCircleExclamation=faCircleExclamation;

  //input variables
  @Input() enrolledStatus:boolean;

  @Input() enrolledDataId: string = '';

  //output event emitters
  @Output() refreshAuditLog: EventEmitter<void>=new EventEmitter<void>

  //reactive attendance form
  attendanceForm: FormGroup = new FormGroup({
    attendee_status: new FormControl(''),
    marks: new FormControl('')
  })

  constructor(private formBuilder:FormBuilder,
    private _registerService: RegisterService,
    private _getDataService: GetdataService,
    private _toastrService: ToastrService){

  }

  ngOnInit(): void {
    this.attendanceForm = this.formBuilder.group({
      attendee_status: ['', Validators.required],
      marks: ['', Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes['enrolledDataId']) {
      if (changes['enrolledDataId'].currentValue) {
        this.getFostacAttendanceData();
      }
    }
  }

  onSubmit(){
    if(this.attendanceForm.invalid){
      return;
    }
    this._registerService.submitAttenSec(this.enrolledDataId,this.attendanceForm.value).subscribe({
      next: res => {
        this._toastrService.success(res.message);
        this.submittedStatus=true;
        this.refreshAuditLog.emit();
      }
    })
  }

  getFostacAttendanceData(){
    this._getDataService.getAttenSecData(this.enrolledDataId).subscribe({
      next: res => {
        if(res){
          console.log(res);
          this.attendanceForm.patchValue({ attandee_status:res.attenData.attendeeStatus });
          this.attendanceForm.patchValue({ marks: res.attenData.marks});
          this.attendeeStatus=res.attenData.attendeeStatus;
          this.submittedStatus=true;
        }
      }
    })
  }
}
