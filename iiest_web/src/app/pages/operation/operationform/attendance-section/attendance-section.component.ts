import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IconDefinition, faCircleCheck, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
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
  isAttendeeAbsent:boolean = false;
  marks: number = 0;
  resultText: string = 'Not Trained';
  resultTextClass: string = 'text-warning';
  resultIcon: IconDefinition = faCircleExclamation;

  //icons
  faCircleCheck: IconDefinition = faCircleCheck;
  faCircleExclamation: IconDefinition = faCircleExclamation;

  //input variables
  @Input() enrolledStatus:boolean;

  @Input() enrolledDataId: string = '';

  //output event emitters
  @Output() emitAttenanceStatus: EventEmitter<boolean> = new EventEmitter<boolean>

  @Output() refreshAuditLog: EventEmitter<void>=new EventEmitter<void>

  //reactive attendance form
  attendanceForm: FormGroup = new FormGroup({
    attendee_status: new FormControl(''),
    marks: new FormControl('')
  });

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

  get attendanceform(): { [key: string]: AbstractControl } {
    return this.attendanceForm.controls;
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
        this.attendeeStatus = this.attendanceForm.value.attendee_status;
        this.setAttendenceResult();
        this.emitAttenanceStatus.emit(this.submittedStatus);
      }
    })
  }

  onAtendeeStatusChange($event:any){
    if($event.target.value === 'absent'){
      this.isAttendeeAbsent = true;
      this.attendanceForm.patchValue({marks:0});
    } else {
      this.isAttendeeAbsent = false;
      this.attendanceForm.patchValue({marks:''});
    }
  }

  getFostacAttendanceData(){
    this._getDataService.getAttenSecData(this.enrolledDataId).subscribe({
      next: res => {
        if(res){
          console.log(res);
          this.attendanceForm.patchValue({ attandee_status:res.attenData.attendeeStatus });
          this.attendanceForm.patchValue({ marks: res.attenData.marks});
          this.attendeeStatus=res.attenData.attendeeStatus;
          this.marks=res.attenData.marks;
          this.submittedStatus=true;
          this.setAttendenceResult();
          this.emitAttenanceStatus.emit(this.submittedStatus);
        }
      }
    })
  }

  setAttendenceResult(): void{
    if(this.submittedStatus === false){
      this.resultText = 'Not-Trained';
      this.resultTextClass = 'text-warning';
      this.resultIcon = faCircleExclamation;
      return;
    }
    else if(this.attendeeStatus === 'absent'){
      this.resultText = 'Absent';
      this.resultTextClass = 'text-danger';
      this.resultIcon = faCircleExclamation;
      return;
    }
    else if(this.marks < 50){
      this.resultText = 'Not Qualified';
      this.resultTextClass = 'text-danger';
      this.resultIcon = faCircleExclamation;
      return;
    }
    this.resultText = 'Trained';
    this.resultTextClass = 'text-success';
    this.resultIcon = faCircleCheck;
  }

}
