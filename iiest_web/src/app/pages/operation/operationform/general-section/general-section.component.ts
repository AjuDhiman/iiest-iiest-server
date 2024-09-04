import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';
import { days, months } from 'src/app/utils/config';

@Component({
  selector: 'app-general-section',
  templateUrl: './general-section.component.html',
  styleUrls: ['./general-section.component.scss']
})
export class GeneralSectionComponent implements OnInit, OnChanges {

  @Input() candidateId: string = '';

  @Input() caseData: any;

  @Input() productType: string = '';

  caseNote: string[] = [];

  unformatedLogsArr: any = [];

  officerComments: string[] = [];

  generalForm: FormGroup = new FormGroup({
    recipient_status: new FormControl('ongoing'),
    officer_note: new FormControl(''),
  });

  constructor(private formBuilder: FormBuilder,
    private _registerService: RegisterService,
    private _getDataService: GetdataService,
    private _toastrService: ToastrService) {

  }

  ngOnInit(): void {
    this.generalForm = this.formBuilder.group({
      recipient_status: ['ongoing'],
      officer_note: ['']
    });

    this.getGenSecData();
  
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes['caseData'] && changes['caseData'].currentValue){
      this.getCaseNotes();
    }
  }

  get generalform(): { [key: string]: AbstractControl } {
    return this.generalForm.controls;
  }

  // this function will run every timr you update the form
  onUpdate() {
    if (this.generalForm.invalid) {
      return;
    }

    this._registerService.postOperGenData(this.candidateId, this.generalForm.value).subscribe({
      next: res => {
        if (res) {
          this._toastrService.success('Record Updated', 'Updated')
          this.getCaseNotes();
          this.getGenSecData();
          this.generalForm.patchValue({officer_note:''});
        }
      },
      error: err => {

      }
    })

  }

  //this methord is used in getting genearal section area like officr note from db
  getGenSecData() {
    this._getDataService.getOperGenSecData(this.candidateId).subscribe({
      next: res => {
        if (res) {
          this.formatofficerComments(res.genSecData);
        }
      }
    })
  }

  //this methord is used in getting array of all audit logs by calling get api for audit logs
  getCaseNotes() {
    this._getDataService.getAuditLogs(this.candidateId).subscribe({
      next: res => {
        // this.formatLogs(res.logs);
        this.unformatedLogsArr = [...this.unformatedLogsArr,...res.logs];

        this._getDataService.getAuditLogs(this.caseData.salesInfo.fboInfo._id).subscribe({
          next: response => {
            this.unformatedLogsArr = [...this.unformatedLogsArr,...response.logs];
            this.unformatedLogsArr.sort((a:any, b:any) => {
              return( new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            })
            this.formatLogs(this.unformatedLogsArr);
          }
        })
      }
    })
  }

  //this methord formats the logs in a better presentational form from a object form
  formatLogs(logs: any) {

    logs.forEach((log: any) => {
      let caseNote: string = `${log.action} by ${log.operatorInfo.employee_name} (${log.operatorInfo.employee_id}) on ${this.getFormatedDate(log.createdAt.toString())} at ${this.getFormattedTime(log.createdAt)}`;

      this.caseNote.push(caseNote);
    });
  }

  getFormatedDate(date: string): string {
    const originalDate = new Date(date);
    const year = originalDate.getFullYear();
    const month = months[originalDate.getMonth()];
    const day = String(originalDate.getDate()).padStart(2, '0');
    let formattedDate;
    if(Math.floor((new Date().getTime() - originalDate.getTime())/(24*60*60*1000)) < 7){
      formattedDate = `${day}-${month}-${year} ${days[originalDate.getDay()]}`;
    } else {
      formattedDate = `${day}-${month}-${year}`;
    }  
    return formattedDate;
  }

  getFormattedTime(dateString: string) {
    const originalDate = new Date(dateString);
    let hours = String(originalDate.getHours()%12).padStart(2, '0');
    const minutes = String(originalDate.getMinutes()).padStart(2, '0');
    const meridiem = originalDate.getHours()>=12?'PM':'AM';
    const formattedTime = `${hours}:${minutes} ${meridiem}`;
    return formattedTime;
  }

  formatofficerComments(notes: any) {
    this.officerComments = [];
    notes.forEach((note: any) => {
      let comment = `${note.officerNote} (${note.operatorInfo.employee_name}) on ${this.getFormatedDate(note.createdAt.toString())} at ${this.getFormattedTime(note.createdAt)}\n`;
      this.officerComments.push(comment)
    })
  }

}