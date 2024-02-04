import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';

@Component({
  selector: 'app-general-section',
  templateUrl: './general-section.component.html',
  styleUrls: ['./general-section.component.scss']
})
export class GeneralSectionComponent implements OnInit {

  @Input() candidateId: string = ''

  firstUpdate:boolean=true;

  caseNote:string='';

  generalForm: FormGroup = new FormGroup({
    recipient_status: new FormControl('ongoing'),
    officer_note: new FormControl(''),
  });

  constructor(private formBuilder: FormBuilder,
    private _registerService: RegisterService,
    private _getDataService: GetdataService,
    private _toastrService:ToastrService) {

  }

  ngOnInit(): void {
    this.generalForm = this.formBuilder.group({
      recipient_status: ['ongoing'],
      officer_note: ['']
    });

    this.getGenSecData();
    this.getCaseNotes();
  }

  get generalform(): { [key: string]: AbstractControl } {
    return this.generalForm.controls;
  }

  // this function will run every timr you update the form
  onUpdate() {
    if (this.generalForm.invalid) {
      return;
    }

    if(this.firstUpdate){
      this._registerService.postOperGenData(this.candidateId, this.generalForm.value).subscribe({
        next: res => {
          this._toastrService.success('Record Updated', 'Updated')
          this.firstUpdate=false;
        },
        error: err => {
          
        }
      })
    } else {
     this._registerService.updateOperGenData(this.candidateId, this.generalForm.value).subscribe({
      next: res => {
        this._toastrService.success('Record Updated', 'Updated')
      }
     })
    }
    
  }

  //this methord is used in getting genearal section area like officr note from db
  getGenSecData() {
    this._getDataService.getOperGenSecData(this.candidateId).subscribe({
      next: res => {
        if (res) {
          this.generalForm.patchValue({ recipient_status: res.genSecData.recipientStatus });
          this.generalForm.patchValue({ officer_note: res.genSecData.officerNote });
          this.firstUpdate=false;
        } else {
          this.firstUpdate=true;
        }
      }
    })
  }

  //this methord is used in getting array of all audit logs by calling get api for audit logs
  getCaseNotes(){
    this._getDataService.getAuditLogs(this.candidateId).subscribe({
      next: res => {
        this.formatLogs(res.logs);
      }
    })
  }

  //this methord formats the logs in a better presentational form from a object form
  formatLogs(logs:any){
    let fullCaseNote:string = '';

    logs.forEach((log:any) => {
      let caseNote:string = `${log.action} by ${log.operatorInfo.employee_name} (${log.operatorInfo.employee_id}) on ${this.getFormatedDate(log.createdAt.toString())} at ${this.getFormattedTime(log.createdAt)}\n`; 

      fullCaseNote+=caseNote;
    });

    this.caseNote=fullCaseNote;
  }

  getFormatedDate(date: string): string {
    const originalDate = new Date(date);
    const year = originalDate.getFullYear();
    const month = String(originalDate.getMonth() + 1).padStart(2, '0');
    const day = String(originalDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }

  getFormattedTime(dateString:string) {
    const originalDate = new Date(dateString);
    const hours = String(originalDate.getHours()).padStart(2, '0');
    const minutes = String(originalDate.getMinutes()).padStart(2, '0');
    const seconds = String(originalDate.getSeconds()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}:${seconds}`;
    return formattedTime;
  }
  

}
