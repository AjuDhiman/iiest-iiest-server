import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { faCircleCheck, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';
import { ourHolidays } from 'src/app/utils/config';

@Component({
  selector: 'app-audit-section',
  templateUrl: './audit-section.component.html',
  styleUrls: ['./audit-section.component.scss']
})
export class AuditSectionComponent implements OnInit {

  //global variables
  audited: boolean = false;
  auditStatus: boolean = false;
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
  auditForm: FormGroup = new FormGroup({
    audit_report: new FormControl(''),
    summary_advisory_report: new FormControl(''),
    advisory_report: new FormControl(''),
  });

  constructor(private formBuilder: FormBuilder,
    private _getDataService: GetdataService,
    private _registerService: RegisterService,
    private _toastrService: ToastrService) {
  }

  ngOnInit(): void {
    this.auditForm = this.formBuilder.group({
      audit_report: ['', Validators.required],
      summary_advisory_report: ['', Validators.required],
      advisory_report: ['', Validators.required],
      });
  }

  get auditform(): { [key: string]: AbstractControl } {
    return this.auditForm.controls;
  }

  onAudit() {
    this.audited = true;
    if (this.auditForm.invalid) {
      return
    }
    this.loading = true;//starts the loading
    if (this.verifiedDataId) {
      const auditeData = {...this.auditForm.value};
      this._registerService.enrollRecipient(this.verifiedDataId, auditeData).subscribe({
        next: res => {
          this.auditStatus = true;
          this.loading = false;
        },
        error: err => {
          console.log(err.error);
          this.loading = false;
        }
      })
    }
  }
}