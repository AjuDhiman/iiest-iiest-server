import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
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
export class VerificationSectionComponent implements OnInit, OnChanges {
  //general variables
  verified: boolean = false;
  verifiedStatus: boolean = false;

  //icons
  faCircleExclamation = faCircleExclamation;
  faCircleCheck = faCircleCheck;

  // input variables
  @Input() candidateId: string = '';

  @Input() productType: string = '';

  //output variables
  @Output() emitVerifiedID: EventEmitter<string> = new EventEmitter<string>;

  @Output() emitSalesDate: EventEmitter<string> = new EventEmitter<string>;

  @Output() emitVerifiedStatus: EventEmitter<boolean> = new EventEmitter<boolean>;

  @Output() refreshAuditLog: EventEmitter<void> = new EventEmitter<void>

  kobData: any;

  kobList: string[] = [];

  foodCategoryList: string[] = [];

  //Verification Reactive angular form
  verificationForm: FormGroup = new FormGroup({});

  fostacVerificationForm: FormGroup = new FormGroup({
    recipient_name: new FormControl(''),
    fbo_name: new FormControl(''),
    owner_name: new FormControl(''),
    father_name: new FormControl(''),
    dob: new FormControl(''),
    address: new FormControl(''),
    operator_contact_no: new FormControl(''),
    email: new FormControl(''),
    aadhar_no: new FormControl(''),
    pancard_no: new FormControl(''),
    fostac_total: new FormControl(''),
    sales_person: new FormControl(''),
    username: new FormControl(''),
    password: new FormControl('')
  });

  foscosVerificationForm: FormGroup = new FormGroup({
    operator_name: new FormControl(''),
    fbo_name: new FormControl(''),
    owner_name: new FormControl(''),
    operator_contact_no: new FormControl(''),
    email: new FormControl(''),
    address: new FormControl(''),
    pincode: new FormControl(''),
    village: new FormControl(''),
    tehsil: new FormControl(''),
    kob: new FormControl(''),
    food_category: new FormControl(''),
    license_category: new FormControl(''),
    license_duration: new FormControl(''),
    foscos_total: new FormControl(''),
    sales_date: new FormControl(''),
    sales_person: new FormControl(''),
  });

  constructor(private formBuilder: FormBuilder,
    private _registerService: RegisterService,
    private _getDataService: GetdataService,
    private _toastrService: ToastrService) {

  }

  ngOnInit(): void {

    this.setFormValidation();

    this.getMoreCaseInfo();

    switch (this.productType) {
      case 'Fostac':
        this.verificationForm = this.fostacVerificationForm;

        this.getFostacVerifiedData();

        break;

      case 'Foscos':

        this.getKobData(); 

        this.verificationForm = this.foscosVerificationForm;
        break;
    }

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes['productType'] && changes['productType'].currentValue) {
      switch (this.productType) {
        case 'Fostac':
          this.verificationForm = this.fostacVerificationForm;
          break;
        case 'Foscos':
          this.verificationForm = this.foscosVerificationForm;
          break;
      }
    }

  }

  get verificationform(): { [key: string]: AbstractControl } {
    return this.verificationForm.controls;
  }

  onVerify(): void {
    this.verified = true;
    console.log(this.verificationForm)
    console.log(this.foscosVerificationForm)
    if (this.verificationForm.invalid) {
      return
    }
    this._registerService.operationBasicForm(this.candidateId, this.verificationForm.value).subscribe({
      next: res => {
        if (res.success) {
          this.verifiedStatus = true;
          this.emitVerifiedStatus.emit(this.verifiedStatus);
          this.emitVerifiedID.emit(res.verifiedId);
          this.refreshAuditLog.emit();
          this._toastrService.success('Resipient\'s information is Verified', 'Verified');
        }
      },
      error: err => {
        this._toastrService.error(err.messsage, 'Can\'t Verify');
      }
    })
  }

  //founction for fetching recipient data 
  getMoreCaseInfo(): void {
    this._getDataService.getMoreCaseInfo(this.candidateId).subscribe({
      next: (res) => {
        console.log(res);
        if(this.productType === 'Fostac'){
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
        } else if(this.productType === 'Foscos') {
          this.verificationForm.patchValue({ operator_name: res.populatedInfo.operatorName});
          this.verificationForm.patchValue({ fbo_name: res.populatedInfo.salesInfo.fboInfo.fbo_name});
          this.verificationForm.patchValue({ owner_name: res.populatedInfo.salesInfo.fboInfo.owner_name });
          this.verificationForm.patchValue({ operator_contact_no: res.populatedInfo.salesInfo.fboInfo.owner_contact });
          this.verificationForm.patchValue({ email: res.populatedInfo.salesInfo.fboInfo.email });
          this.verificationForm.patchValue({ address: res.populatedInfo.address });
          this.verificationForm.patchValue({ license_category: res.populatedInfo.salesInfo.foscosInfo.license_category });
          this.verificationForm.patchValue({ license_duration: res.populatedInfo.salesInfo.foscosInfo.license_duration });
          this.verificationForm.patchValue({ foscos_total: res.populatedInfo.salesInfo.foscosInfo.foscos_total });
          this.verificationForm.patchValue({ sales_date: this.getFormatedDate(res.populatedInfo.salesInfo.createdAt) });
          this.verificationForm.patchValue({ sales_person: res.populatedInfo.salesInfo.employeeInfo.employee_name });
        }
      }
    });
  }

  getFostacVerifiedData(): void {
    this._getDataService.getFostacVerifedData(this.candidateId).subscribe({
      next: res => {
        if (res) {
          this.verifiedStatus = true;
          this.emitVerifiedStatus.emit(this.verifiedStatus);
          this.emitVerifiedID.emit(res.verifedData._id);
          this.verificationForm.patchValue({ father_name: res.verifedData.fatherName });
          this.verificationForm.patchValue({ dob: this.getFormatedDate(res.verifedData.dob) });
          this.verificationForm.patchValue({ email: res.verifedData.email });
          this.verificationForm.patchValue({ pancard_no: res.verifedData.pancardNo });
          this.verificationForm.patchValue({ username: res.verifedData.userName });
          this.verificationForm.patchValue({ password: res.verifedData.password });
        } else {
          this.verifiedStatus = false;
          this.emitVerifiedStatus.emit(this.verifiedStatus);
        }
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

  getKobData(): void{
    this._getDataService.getKobData().subscribe({
      next: res => {
        this.kobData = res;
        this.kobList = this.kobData.map((elem:any) => elem.name);
      }
    })
  }

  onKobChange($event:any){
    this.verificationForm.patchValue({ food_category: ""});
    this.kobData.forEach((kob:any) => {
      console.log($event.target.value);
      console.log(kob.name);
      if(kob.name === $event.target.value) {
        this.foodCategoryList = kob.food_category;
      }
    })
  }

  setFormValidation(): void{
    this.fostacVerificationForm = this.formBuilder.group({
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

    this.foscosVerificationForm = this.formBuilder.group({
      operator_name: ['', Validators.required],
      fbo_name: ['', Validators.required],
      owner_name: ['', Validators.required],
      operator_contact_no: ['', Validators.required],
      email: ['', Validators.required],
      address: ['', Validators.required],
      pincode: ['', Validators.required],
      village: ['', Validators.required],
      tehsil: ['', Validators.required],
      kob: ['', Validators.required],
      food_category: ['', Validators.required],
      license_category: ['', Validators.required],
      license_duration: ['', Validators.required],
      foscos_total: ['', Validators.required],
      sales_date: ['', Validators.required],
      sales_person: ['', Validators.required],
    });

  }

}
