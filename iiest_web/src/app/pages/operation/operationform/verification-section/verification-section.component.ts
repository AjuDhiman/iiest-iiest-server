import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { faCircleCheck, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';

@Component({
  selector: 'app-verification-section',
  templateUrl: './verification-section.component.html',
  styleUrls: ['./verification-section.component.scss']
})
export class VerificationSectionComponent implements OnInit {
  verified: boolean = false;
  verifiedStatus: boolean = false;
  //icons
  faCircleExclamation = faCircleExclamation;
  faCircleCheck = faCircleCheck;

  @Input() candidateId: string = '';

  @Output() emitVerifiedID: EventEmitter<string> = new EventEmitter<string>;

  @Output() emitSalesDate: EventEmitter<string> = new EventEmitter<string>;

  @Output() emitVerifiedStatus: EventEmitter<boolean> = new EventEmitter<boolean>;

  verificationForm: FormGroup = new FormGroup({
    recipient_name: new FormControl(''),
    fbo_name: new FormControl(''),
    owner_name: new FormControl(''),
    father_name: new FormControl(''),
    dob: new FormControl(''),
    address: new FormControl(''),
    recipient_contact_no: new FormControl(''),
    email: new FormControl(''),
    aadhar_no: new FormControl(''),
    pancard_no: new FormControl(''),
    fostac_total: new FormControl(''),
    sales_person: new FormControl(''),
    officer_name: new FormControl(''),
    username: new FormControl(''),
    password: new FormControl('')
  });

  constructor(private formBuilder: FormBuilder,
    private _registerService: RegisterService,
    private _getDataService: GetdataService,
    private _toastrService: ToastrService) {

  }

  ngOnInit(): void {

    this.getMoreCaseInfo();

    this.getFostacVerifiedData();

    this.verificationForm = this.formBuilder.group({
      recipient_name: ['', Validators.required],
      fbo_name: ['', Validators.required],
      owner_name: ['', Validators.required],
      father_name: ['', Validators.required],
      dob: ['', Validators.required],
      address: ['', Validators.required],
      recipient_contact_no: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      aadhar_no: ['', Validators.required],
      pancard_no: ['', Validators.pattern('/^[A-Z]{5}[0-9]{4}[A-Z]$/')],
      fostac_total: ['', Validators.required],
      sales_date: ['', Validators.required],
      sales_person: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  get verificationform(): { [key: string]: AbstractControl } {
    return this.verificationForm.controls;
  }

  onVerify() {
    this.verified = true;
    if (this.verificationForm.invalid) {
      return
    }
    this._registerService.operationBasicForm(this.candidateId, this.verificationForm.value).subscribe({
      next: res => {
        if (res.success) {
          console.log(res);
          this._toastrService.success('Resipient\'s information is Verified', 'Verified');
          this.verifiedStatus=true;
          this.emitVerifiedStatus.emit(this.verifiedStatus);
          this.emitVerifiedID.emit(res.verifiedId);
        }
      }
    })
  }

  //founction foe fetching recipient data 
  getMoreCaseInfo(){
    this._getDataService.getMoreCaseInfo(this.candidateId).subscribe({
      next: (res) => {
        this.verificationForm.patchValue({ recipient_name: res.populatedInfo.name });
        this.verificationForm.patchValue({ fbo_name: res.populatedInfo.salesInfo.fboInfo.fbo_name });
        this.verificationForm.patchValue({ owner_name: res.populatedInfo.salesInfo.fboInfo.owner_name });
        this.verificationForm.patchValue({ address: res.populatedInfo.salesInfo.fboInfo.address });
        this.verificationForm.patchValue({ recipient_contact_no: res.populatedInfo.phoneNo });
        this.verificationForm.patchValue({ aadhar_no: res.populatedInfo.aadharNo });
        this.verificationForm.patchValue({ fostac_total: res.populatedInfo.salesInfo.fostacInfo.fostac_total });
        this.verificationForm.patchValue({ sales_date: this.getFormatedDate(res.populatedInfo.salesInfo.createdAt) });
        this.verificationForm.patchValue({ sales_person: res.populatedInfo.salesInfo.employeeInfo.employee_name });
        this.emitSalesDate.emit(res.populatedInfo.salesInfo.createdAt);
      }, error : err => {
        
      }
    });
  }
  
  getFostacVerifiedData(){
    this._getDataService.getFostacVerifedData(this.candidateId).subscribe({
      next: res => {
        if (res) {
          this.verifiedStatus = true;
          this.emitVerifiedStatus.emit(this.verifiedStatus);
          this.verificationForm.patchValue({ father_name: res.verifedData.fatherName });
          this.verificationForm.patchValue({ dob: this.getFormatedDate(res.verifedData.dob) });
          this.verificationForm.patchValue({ email: res.verifedData.email });
          this.verificationForm.patchValue({ pancard_no: res.verifedData.pancardNo });
          this.verificationForm.patchValue({ username: res.verifedData.userName });
          this.verificationForm.patchValue({ password: res.verifedData.password });
          this.emitVerifiedID.emit(res.verifedData._id);
        } else {
          this.verifiedStatus = false;
          this.emitVerifiedStatus.emit(this.verifiedStatus);
        }
      },
      error: err => {

      }
    });
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
