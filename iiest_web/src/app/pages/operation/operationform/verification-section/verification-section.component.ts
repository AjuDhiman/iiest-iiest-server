import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IconDefinition, faCheck, faCircleCheck, faCircleExclamation, faL } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';
import { MultiSelectComponent } from 'src/app/shared/multi-select/multi-select.component';
import { ownershipType } from 'src/app/utils/config';

@Component({
  selector: 'app-verification-section',
  templateUrl: './verification-section.component.html',
  styleUrls: ['./verification-section.component.scss']
})
export class VerificationSectionComponent implements OnInit, OnChanges {
  //general variables
  verified: boolean = false;
  verifiedStatus: boolean = false;
  // isPropraitor: boolean = false;
  // minMembers: number = 1; // this var is for deciding min no of owners in case of partnership or board of directors
  // ownersNum: number = 0; // this var is for deciding the no of owners in case of partnership or board of directors
  // indexArr: number[] = []; //this var is used for converting ownersNum to array of increasing num till ownerNum because we are using this with ngFor and ngFor works only with array
  ownerType: string = '';

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

  @Output() refreshAuditLog: EventEmitter<void> = new EventEmitter<void>;

  @Output() emitCustomerId: EventEmitter<string> = new EventEmitter<string>;

  @Output() emitDocuments: EventEmitter<any> = new EventEmitter<any>

  @ViewChild(MultiSelectComponent) multiSelect: MultiSelectComponent;

  @ViewChildren('fieldVerification') fieldVerifications: QueryList<ElementRef>

  kobData: any;

  kobList: string[] = [];

  foodCategoryList: string[] = [];

  ownershipType = ownershipType;

  //icons
  faCheck: IconDefinition = faCheck;

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
    license_category: new FormControl(''),
    license_duration: new FormControl(''),
    foscos_total: new FormControl(''),
    sales_date: new FormControl(''),
    sales_person: new FormControl(''),
    kob: new FormControl(''),
    food_items: new FormControl(''),
    food_category: new FormControl(''),
    ownership_type: new FormControl(''),
    owner_num: new FormControl(''),
    operator_address: new FormControl(''),
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

        this.getFoscosVerifiedData()
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
    if (this.fieldVerifications.find((div: any) => div.nativeElement.getAttribute('valid') === 'false')) {
      this._toastrService.warning('Please verify all fields first')
      return
    }
    this.verified = true;
    if (this.verificationForm.invalid) {
      return
    }
    if (this.productType === 'Fostac') {
      this._registerService.verifyFostac(this.candidateId, this.verificationForm.value).subscribe({
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
    } else if (this.productType === 'Foscos') {
      console.log('works');
      this._registerService.verifyFoscos(this.candidateId, this.verificationForm.value).subscribe({
        next: res => {
          console.log(this.verificationForm);
          if (res.success) {
            // this.verifiedStatus = true;
            this.emitVerifiedStatus.emit(this.verifiedStatus);
            this.emitVerifiedID.emit(res.verifiedId);
            this.refreshAuditLog.emit();
            this._toastrService.success('Shop\'s information is Verified', 'Verified');
          }
        }
      });
    }
  }

  //founction for fetching recipient data 
  getMoreCaseInfo(): void {
    this._getDataService.getMoreCaseInfo(this.candidateId).subscribe({
      next: (res) => {
        if (this.productType === 'Fostac') {
          this.emitCustomerId.emit(res.populatedInfo.recipientId);
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
        } else if (this.productType === 'Foscos') {
          this.verificationForm.patchValue({ operator_name: res.populatedInfo.operatorName });
          this.verificationForm.patchValue({ fbo_name: res.populatedInfo.salesInfo.fboInfo.fbo_name });
          this.verificationForm.patchValue({ owner_name: res.populatedInfo.salesInfo.fboInfo.owner_name });
          this.verificationForm.patchValue({ operator_contact_no: res.populatedInfo.salesInfo.fboInfo.owner_contact });
          this.verificationForm.patchValue({ email: res.populatedInfo.salesInfo.fboInfo.email });
          this.verificationForm.patchValue({ address: res.populatedInfo.address });
          this.verificationForm.patchValue({ license_category: res.populatedInfo.salesInfo.foscosInfo.license_category });
          this.verificationForm.patchValue({ license_duration: res.populatedInfo.salesInfo.foscosInfo.license_duration });
          this.verificationForm.patchValue({ foscos_total: res.populatedInfo.salesInfo.foscosInfo.foscos_total });
          this.verificationForm.patchValue({ sales_date: this.getFormatedDate(res.populatedInfo.salesInfo.createdAt) });
          this.verificationForm.patchValue({ sales_person: res.populatedInfo.salesInfo.employeeInfo.employee_name });
          this.emitDocuments.emit([
            {
              name: 'Electricity Bill',
              src: res.populatedInfo.eBillImage,
              format: 'image'
            },
            {
              name: 'Owner Photo',
              src: res.populatedInfo.ownerPhoto,
              format: 'image'
            },
            {
              name: 'Shop Photo',
              src: res.populatedInfo.shopPhoto,
              format: 'image'
            }
          ]);
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
          this.fieldVerifications.forEach((div: any) => div.nativeElement.setAttribute('valid', 'true'))
        } else {
          this.verifiedStatus = false;
          this.emitVerifiedStatus.emit(this.verifiedStatus);
        }
      }
    });
  }

  getFoscosVerifiedData() {
    this._getDataService.getFoscosVerifedData(this.candidateId).subscribe({
      next: res => {
        console.log(res);
        if (res) {
          this.verifiedStatus = true;
          this.multiSelect.isDisplayEmpty = false;
          this.multiSelect.selected = res.verifedData.foodCategory;
          this.verificationForm.patchValue({ kob: res.verifedData.kob });
          this.verificationForm.patchValue({ ownership_type: res.verifedData.ownershipType });
          this.verificationForm.patchValue({ food_category: res.verifedData.foodCategory });
          this.verificationForm.patchValue({ operator_address: res.verifedData.operatorAddress });
          this.verificationForm.patchValue({ food_items: res.verifedData.foodItems });
          console.log(res.verifedData)
          this.emitDocuments.emit([{
            name: 'FSMS Cerificate',
            src: res.verifedData.fsmsCertificate,
            format: 'pdf'
          },
          {
            name: 'Self Declearation of Propraitorship',
            src: res.verifedData.selfDecOProp,
            format: 'pdf'
          }
          ]);
        } else {
          this.verifiedStatus = false;
        }
      }
    })
  }

  getFormatedDate(date: string): string {
    const originalDate = new Date(date);
    const year = originalDate.getFullYear();
    const month = String(originalDate.getMonth() + 1).padStart(2, '0');
    const day = String(originalDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }

  getKobData(): void {
    this._getDataService.getKobData().subscribe({
      next: res => {
        this.kobData = res;
        this.kobList = this.kobData.map((elem: any) => elem.name);
      }
    })
  }

  //this methord sets food catgories on the basis of kob selection
  onKobChange($event: any): void {
    this.verificationForm.patchValue({ food_category: [] });
    this.foodCategoryList = [];
    this.multiSelect.onReset();
    this.kobData.forEach((kob: any) => {
      console.log($event.target.value, kob.name);
      if (kob.name === $event.target.value) {
        this.foodCategoryList = kob.food_category;
      }
    })
  }

  getSelectedFoodcat($event: any): void {
    this.verificationForm.patchValue({ food_category: $event });
  }

  setFormValidation(): void {

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
      license_category: ['', Validators.required],
      license_duration: ['', Validators.required],
      foscos_total: ['', Validators.required],
      sales_date: ['', Validators.required],
      sales_person: ['', Validators.required],
      kob: ['', Validators.required],
      food_category: ['', Validators.required],
      food_items: ['', Validators.required],
      ownership_type: ['', Validators.required],
      owner_num: ['', Validators.required],
      // owner_details: this.formBuilder.array([]),
      operator_address: ['', Validators.required],
    });

  }

  // onOwnershipTypeChange($event: any) {
  //   if ($event.target.value === 'Propraitorship') {
  //     this.verificationForm.patchValue({ owner_num: 1 });
  //     this.isPropraitor = true;
  //     this.minMembers = 1;
  //     this.ownersNum = 1;
  //     this.indexArr = []
  //     for (let i = 0; i < this.ownersNum; i++) {
  //       this.indexArr.push(i);
  //     }
  //   } else {
  //     this.verificationForm.patchValue({ owner_num: 2 });
  //     this.isPropraitor = false;
  //     this.minMembers = 2;
  //     this.ownersNum = 2;
  //     this.indexArr = []
  //     for (let i = 0; i < this.ownersNum; i++) {
  //       this.indexArr.push(i);
  //     }
  //   }

  //   switch ($event.target.value) {
  //     case 'Propraitorship':
  //       this.ownerType = 'Propraitor'
  //       break;
  //     case 'Partnership':
  //       this.ownerType = 'Partner'
  //       break;
  //     case 'Board of Directors':
  //       this.ownerType = 'Director'
  //       break;
  //   }
  // }

  // onOwnerNumChange($event: any) {
  //   let value;
  //   if ($event.target.value > 20) {
  //     this.verificationForm.patchValue({ owner_num: 20 });
  //     value = 20;
  //   } else {
  //     value = $event.target.value;
  //   }
  //   this.ownersNum = value;
  //   this.indexArr = [];
  //   for (let i = 0; i < value; i++) {
  //     this.indexArr.push(i);
  //   }
  // }

}