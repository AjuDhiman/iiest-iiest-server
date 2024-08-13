import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IconDefinition, faCheck, faCircleCheck, faCircleExclamation, faExclamationCircle, faL, faUsers } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ConformationModalComponent } from 'src/app/pages/modals/conformation-modal/conformation-modal.component';
import { RecipientComponent } from 'src/app/pages/modals/recipient/recipient.component';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';
import { MultiSelectComponent } from 'src/app/shared/multi-select/multi-select.component';
import { basicRequiredDocs, hraKob, ownershipType, stateName } from 'src/app/utils/config';
import { pincodeData } from 'src/app/utils/registerinterface';

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
  minMembers: number = 1; // this var is for deciding min no of owners in case of partnership or board of directors
  // ownersNum: number = 0; // this var is for deciding the no of owners in case of partnership or board of directors
  // indexArr: number[] = []; //this var is used for converting ownersNum to array of increasing num till ownerNum because we are using this with ngFor and ngFor works only with array
  ownerType: string = '';

  //var that decides verification section type


  //status related vars
  resultText: string = 'In-Progress';
  resultTextClass: string = 'bg-warning';
  resultIcon: IconDefinition = faExclamationCircle;

  //icons
  faCircleExclamation = faCircleExclamation;
  faCircleCheck = faCircleCheck;
  faUsers: IconDefinition = faUsers;

  //var related to loader
  loading: boolean = false;

  //var in case of recp verification
  isRecpVerification: boolean = false;

  isPendingByCustomer: boolean = false;


  //doc verifiation related vars
  @Input() requiredDocs: any = [];

  // input variables
  @Input() candidateId: string = '';

  @Input() isForShopVerification: boolean = false;

  @Input() isForProductVerification: boolean = false;

  @Input() isForDocVerification: boolean = false;

  @Input() productType: string = '';

  @Input() isTrainer: boolean = false;

  @Input() isVerifier: boolean = false;

  @Input() caseData: any;

  @Input() verifiedShopData: any = [];

  @Input() prevSecVerifiedStatus: boolean = false;

  //output variables
  @Output() emitCaseData: EventEmitter<any> = new EventEmitter<any>;

  @Output() emitVerifiedID: EventEmitter<string> = new EventEmitter<string>;

  @Output() emitVerifiedData: EventEmitter<any> = new EventEmitter<any>;

  @Output() emitVerifiedStatus: EventEmitter<boolean> = new EventEmitter<boolean>;

  @Output() refreshAuditLog: EventEmitter<void> = new EventEmitter<void>;

  @Output() emitCustomerId: EventEmitter<string> = new EventEmitter<string>;

  @Output() emitDocuments: EventEmitter<any> = new EventEmitter<any>

  @Output() emitCheckedDocs: EventEmitter<any> = new EventEmitter<any>

  @Output() emitPrevSecVerifiedStatus: EventEmitter<any> = new EventEmitter<any>
  @Output() emitPrevSecVerifiedStatus2: EventEmitter<any> = new EventEmitter<any>
  @Output() emitPrevSecVerifiedStatus3: EventEmitter<any> = new EventEmitter<any>

  @ViewChild(MultiSelectComponent) multiSelect: MultiSelectComponent;

  @ViewChildren('fieldVerification') fieldVerifications: QueryList<ElementRef>

  @ViewChild('switch') switch: ElementRef;

  @ViewChild('verification_check') verification_check: ElementRef;

  kobData: any;

  kobList: string[] = [];

  hraKob: string[] = hraKob;

  foodCategoryList: string[] = [];

  ownershipType = ownershipType;

  checkedDocsName: string[] = [];

  //this case will keep track of if arr recps are filled or not in case of products that includes recipients
  isAllRecpsFilled: boolean = false;
  noOfRecpLeft: number = 0;

  //icons
  faCheck: IconDefinition = faCheck;


  //editing related vars
  isEditMode: boolean = false;
  states: string[] = stateName;
  districtAndPincodes: pincodeData[];
  districts: string[] = [];
  pincodes: string[] = [];



  //  ------------------------------------------------------------Form Groups-----------------------------------------------------------------------------------


  //Verification Reactive angular form
  verificationForm: FormGroup = new FormGroup({});

  //shop verification form
  shopVerificationForm: FormGroup = new FormGroup({
    manager_name: new FormControl(''),
    fbo_name: new FormControl(''),
    business_entity: new FormControl(''),
    owner_name: new FormControl(''),
    manager_contact: new FormControl(''),
    manager_email: new FormControl(''),
    address: new FormControl(''),
    state: new FormControl(''),
    district: new FormControl(''),
    pincode: new FormControl('')
  });

  //fostac Verification form
  fostacVerificationForm: FormGroup = new FormGroup({
    recipient_no: new FormControl(''),
    service_name: new FormControl(''),
    fostac_total: new FormControl(''),
    sales_date: new FormControl(''),
    sales_person: new FormControl(''),
  });

  //foscos verification form
  foscosVerificationForm: FormGroup = new FormGroup({
    license_category: new FormControl(''),
    license_duration: new FormControl(''),
    foscos_total: new FormControl(''),
    sales_date: new FormControl(''),
    sales_person: new FormControl(''),
    kob: new FormControl(''),
    food_category: new FormControl(''),
    ownership_type: new FormControl(''),
    owners_num: new FormControl(this.minMembers)
  });

  //hraverification form
  hraVerificationForm: FormGroup = new FormGroup({
    hra_total: new FormControl(''),
    sales_date: new FormControl(''),
    sales_person: new FormControl(''),
    kob: new FormControl(''),
    food_handler_no: new FormControl('')
  });

  //document verification form
  documentVerificationForm: FormGroup = new FormGroup({});






  // -------------------------------------------------------------Constructor ---------------------------------------------------------------------
  constructor(private formBuilder: FormBuilder,
    private _registerService: RegisterService,
    private _getDataService: GetdataService,
    private _toastrService: ToastrService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef) {

  }


  // -----------------------------------------------------------Life cycle hooks -----------------------------------------------------------------------------
  ngOnInit(): void {

    this.setFormValidation();

    this.getMoreCaseInfo();

    if (this.isForProductVerification) {

      switch (this.productType) {
        case 'Fostac':
          this.verificationForm = this.fostacVerificationForm;

          break;

        case 'Foscos':

          this.getKobData();

          this.verificationForm = this.foscosVerificationForm;

          break;

        case 'HRA':
          this.verificationForm = this.hraVerificationForm;
          break;
      }
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
        case 'HRA':
          this.verificationForm = this.hraVerificationForm;
          break;
      }
    }

    if (changes && changes['caseData'] && changes['caseData'].currentValue) {
      this.getMoreCaseInfo();
      if (this.isForProductVerification || this.isForDocVerification) {

        //getting kob data
        if (this.productType === 'Foscos') {
          this.getKobData();
        }

        if(this.isForProductVerification){
          this.getShopVerifiedData();
        }
        //getting shop verified data
        
      }
    }

    if (changes['isForDocVerification']) {
      this.isForDocVerification = changes['isForDocVerification'].currentValue;
    }
  
    // Check if 'verifiedShopData' has changed and 'isForDocVerification' is true
    if (changes['verifiedShopData'] && changes['verifiedShopData'].currentValue && this.isForDocVerification) {
      this.isPendingByCustomer = this.verifiedShopData.isReqDocVerificationLinkSend;
      this.verifiedStatus = this.verifiedShopData.isReqDocsVerified;

      console.log('verified Status', this.isPendingByCustomer, this.verifiedStatus);
  
      this.decideResult();
      this.emitPrevSecVerifiedStatus.emit(this.verifiedStatus);
    }
    
   
  }

  //---------------------------------------------------------------------- GET -----------------------------------------------------------------------------------------
  get verificationform(): { [key: string]: AbstractControl } {
    return this.verificationForm.controls;
  }

  get shopverificationform(): { [key: string]: AbstractControl } {
    return this.shopVerificationForm.controls;
  }

  // -------------------------------------------------------------------------methords------------------------------------------------------------------------------
  onVerify(): void {
    if (this.fieldVerifications.find((div: any) => div.nativeElement.getAttribute('valid') === 'false')) {
      this._toastrService.warning('Please verify all fields first')
      return
    }
    this.verified = true;

    //return in case of loading or form invalid
    if (this.verificationForm.invalid || this.loading) {
      return
    }

    this.loading = true;
    if (this.productType === 'Fostac') {
      this._registerService.verifyFostac(this.candidateId, this.verificationForm.value).subscribe({
        next: res => {
          this.loading = false;
          if (res.success) {
            this.loading = false;
            this.isPendingByCustomer = true;
            this.decideResult();
            // this.verifiedStatus = true;
            this.emitVerifiedStatus.emit(this.verifiedStatus);
            this.emitVerifiedID.emit(res.verifiedId);
            // this.emitVerifiedData.emit({ ...res.verificationInfo, batchData: res.batchData });
            this.refreshAuditLog.emit();
            this.loading = false;
            this._toastrService.success('Email Sent For Fostac Verification');
          }
        },
        error: err => {
          this.loading = false;
          if (err.error.locationErr) {
            this._toastrService.error('Location not avilable');
          } else if (err.error.emailErr) {
            this._toastrService.error('This email already exists');
          } else {
            this._toastrService.error(err.error.messsage, 'Can\'t Verify');
          }
        }
      })
    } else if (this.productType === 'Foscos') {
      this._registerService.verifyFoscos(this.candidateId, this.verificationForm.value).subscribe({
        next: res => {
          if (res.success) {
            this.loading = false;
            this.isPendingByCustomer = true;
            this.decideResult();
            // this.verifiedStatus = true;
            this.emitVerifiedStatus.emit(this.verifiedStatus);
            this.emitVerifiedID.emit(res.verifiiedId);
            // this.emitVerifiedData.emit(res.verificationInfo);
            this.refreshAuditLog.emit();
            this._toastrService.success('Email Sent For Foscos Verification');
          }
        }
      });
    } else if (this.productType === 'HRA') {
      this._registerService.verifyHra(this.candidateId, this.verificationForm.value).subscribe({
        next: res => {
          this.loading = false;
          if (res.success) {
            this.loading = false;
            // this.verifiedStatus = true;
            this.isPendingByCustomer = true;
            this.decideResult();
            console.log(res);
            this.emitVerifiedStatus.emit(this.verifiedStatus);
            this.emitVerifiedID.emit(res.verifiiedId);
            // this.emitVerifiedData.emit(res.verificationInfo);
            this.refreshAuditLog.emit();
            this._toastrService.success('Email Sent For HRA Verification');
          }
        },
        error: err => {
          this.loading = false;
          if (err.error.locationErr) {
            this._toastrService.error('Location not avilable');
          }
        }
      });
    }
  }

  //on shop verify
  onShopVerify(): void {
    if (this.fieldVerifications.find((div: any) => div.nativeElement.getAttribute('valid') === 'false')) {
      this._toastrService.warning('Please verify all fields first')
      return
    }
    this.verified = true;

    if (this.shopVerificationForm.invalid) {
      return
    }

    this.loading = true;

    //sending verifaication link
    this._registerService.sendFboVerificationLink(this.caseData.salesInfo.fboInfo._id, this.shopVerificationForm.value).subscribe({
      next: res => {
        this.loading = false;
        if (res) {
          this._toastrService.success('Please guide the customer for verifing link', 'Verification Link Send by Mail');
          this.resultText = 'Pending on customer end';
          this.resultTextClass = 'bg-orange';
          this.resultIcon = faCircleExclamation;
          this.isPendingByCustomer = true;
          this.decideResult();

        }
      },
      error: err => {
        this.loading = false;
      }
    })
  }

  //methord is for action if verifing docs
  onDocVerify() {

    this.verified = true;
    //return in case of loading  or invalid form field
    if (this.loading) {
      return;
    }

    //opening confirmation modal
    const modalRef = this.modalService.open(ConformationModalComponent, { size: 'md', backdrop: 'static' });
    modalRef.componentInstance.action = 'Verify checked docs and send confirmation link by sms and mail';
    modalRef.componentInstance.confirmationText = 'confirm';
    modalRef.componentInstance.actionFunc.subscribe((confirmation: boolean) => {
      if (confirmation) {
        this.loading = true;
        this.verified = false;
        this.verifiedStatus = true;

        this._registerService.verifyDoc(this.candidateId, this.checkedDocsName).subscribe({
          next: res => {
            this.loading = false;
            this.isPendingByCustomer = true;
            this.decideResult();
            this.emitCheckedDocs.emit(this.checkedDocsName);
          }
        })

      } else {
        console.log(this.verification_check);
      }
    })
  }

  //founction for fetching recipient data 
  getMoreCaseInfo(): void {
    if (this.isForShopVerification) {
      this._getDataService.getMoreCaseInfo(this.productType, this.candidateId).subscribe({
        next: (res) => {
          this.caseData = res.populatedInfo;

          this.emitCaseData.emit(this.caseData);

          this.shopVerificationForm.patchValue({ manager_name: this.caseData.salesInfo.fboInfo.boInfo.manager_name });
          this.shopVerificationForm.patchValue({ business_entity: this.caseData.salesInfo.fboInfo.boInfo.business_entity });
          this.shopVerificationForm.patchValue({ fbo_name: this.caseData.salesInfo.fboInfo.fbo_name });
          this.shopVerificationForm.patchValue({ owner_name: this.caseData.salesInfo.fboInfo.boInfo.owner_name });
          this.shopVerificationForm.patchValue({ manager_contact: this.caseData.salesInfo.fboInfo.boInfo.contact_no });
          this.shopVerificationForm.patchValue({ manager_email: this.caseData.salesInfo.fboInfo.boInfo.email });
          this.shopVerificationForm.patchValue({ address: this.caseData.salesInfo.fboInfo.address });
          this.shopVerificationForm.patchValue({ state: this.caseData.salesInfo.fboInfo.state });
          this.shopVerificationForm.patchValue({ district: this.caseData.salesInfo.fboInfo.district });
          this.shopVerificationForm.patchValue({ pincode: this.caseData.salesInfo.fboInfo.pincode });

          this.isPendingByCustomer = this.caseData.salesInfo.fboInfo.isVerificationLinkSend
          this.verifiedStatus = this.caseData.salesInfo.fboInfo.isFboVerified;

          this.emitPrevSecVerifiedStatus.emit(this.verifiedStatus);

          this.decideResult();
        }
      });
    } else if (this.isForProductVerification && this.caseData) {


      if (this.productType === 'Fostac') {

        //getting recipient data also in case of fostac
        this._getDataService.getSaleRecipients(this.caseData.salesInfo._id).subscribe({
          next: res => {
            this.caseData.salesInfo.recipientInfo = res.recipientsList;

            //setting is all recp filled true if all recps are filed that is if no of recp in recipient list array is equal to recipient no infostac info
            this.isAllRecpsFilled = (this.caseData.salesInfo.fostacInfo.recipient_no == this.caseData.salesInfo.recipientInfo.length)
            this.noOfRecpLeft = this.caseData.salesInfo.fostacInfo.recipient_no - this.caseData.salesInfo.recipientInfo.length;
          }
        })
        this.verificationForm.patchValue({ fostac_total: this.caseData.salesInfo.fostacInfo.fostac_total });
        this.verificationForm.patchValue({ recipient_no: this.caseData.salesInfo.fostacInfo.recipient_no })
        this.verificationForm.patchValue({ service_name: this.caseData.salesInfo.fostacInfo.fostac_service_name })
        this.verificationForm.patchValue({ sales_date: this.getFormatedDate(this.caseData.salesInfo.createdAt.toString()) })
        this.verificationForm.patchValue({ sales_person: this.caseData.salesInfo.employeeInfo.employee_name })
      } else if (this.productType === 'Foscos') {
        this.verificationForm.patchValue({ foscos_total: this.caseData.salesInfo.foscosInfo.foscos_total });
        this.verificationForm.patchValue({ license_category: this.caseData.salesInfo.foscosInfo.license_category })
        this.verificationForm.patchValue({ license_duration: this.caseData.salesInfo.foscosInfo.license_duration })
        this.verificationForm.patchValue({ sales_date: this.getFormatedDate(this.caseData.salesInfo.createdAt.toString()) })
        this.verificationForm.patchValue({ sales_person: this.caseData.salesInfo.employeeInfo.employee_name })
      }
      else if (this.productType === 'HRA') {
        this.verificationForm.patchValue({ hra_total: this.caseData.salesInfo.hraInfo.hra_total });
        this.verificationForm.patchValue({ sales_date: this.getFormatedDate(this.caseData.salesInfo.createdAt.toString()) })
        this.verificationForm.patchValue({ sales_person: this.caseData.salesInfo.employeeInfo.employee_name })
      }

      this.decideResult();

      this.emitPrevSecVerifiedStatus.emit(this.verifiedStatus);

    }
  }


  //methord for getting shop verified data
  getShopVerifiedData(): void {
    this.loading = true;
    this._getDataService.getShopVerifedData(this.candidateId).subscribe({
      next: res => {
        this.loading = false;
        if (res.verifedData.isProdVerificationLinkSend && !res.verifedData.isProdVerified) {
          this.isPendingByCustomer = true;
        } else if (res.verifedData.isProdVerified) {
          this.verifiedStatus = true;
          this.emitPrevSecVerifiedStatus.emit(this.verifiedStatus);
        }
        this.patchVerifiedData(res.verifedData);

        this.verifiedShopData = res.verifedData
        this.isPendingByCustomer = this.verifiedShopData.isProdVerificationLinkSend;
        this.verifiedStatus = this.verifiedShopData.isProdVerified;
        this.emitPrevSecVerifiedStatus.emit(this.verifiedStatus);
        this.decideResult();
        this.emitVerifiedData.emit(this.verifiedShopData);
        

      },
      error: err => {
        this.loading = false;
      }
    })
  }

  //methord for patching verified data
  patchVerifiedData(data: any): void {
    switch (this.productType) {
      case "Foscos":
        this.verificationForm.patchValue({ kob: data.kob });
        this.verificationForm.patchValue({ ownership_type: data.ownershipType });
        this.verificationForm.patchValue({ food_category: data.foodCategory });
        //sttung selected of mutiselect
        if (this.multiSelect) {
          this.multiSelect.selected = data.foodCategory;
          this.multiSelect.isDisplayEmpty = false;
        }
        this.verificationForm.patchValue({ operator_address: data.operatorAddress });
        break;

      case "HRA":
        this.verificationForm.patchValue({ kob: data.kob });
        this.verificationForm.patchValue({ food_handler_no: data.foodHandlersCount });
        break;

    }
  }

  getFostacVerifiedData(): void {
    this._getDataService.getFostacVerifedData(this.candidateId).subscribe({
      next: res => {
        if (res) {
          this.verifiedStatus = true;
          this.emitVerifiedStatus.emit(this.verifiedStatus);
          this.emitVerifiedID.emit(res.verifedData._id);
          this.fieldVerifications.forEach((div: any) => div.nativeElement.setAttribute('valid', 'true'));
          // this.emitVerifiedData.emit({ ...res.verifedData, batchData: res.batchData });
          this.loading = false;
        } else {
          this.verifiedStatus = false;
          this.emitVerifiedStatus.emit(this.verifiedStatus);
          this.loading = false;
        }
      }
    });
  }

  getFoscosVerifiedData() {
    this._getDataService.getFoscosVerifedData(this.candidateId).subscribe({
      next: res => {
        if (res) {
          this.verifiedStatus = true;
          this.multiSelect.isDisplayEmpty = false;
          this.multiSelect.selected = res.verifedData.foodCategory;

          // this.emitVerifiedData.emit(res.verifedData);
          this.emitVerifiedStatus.emit(this.verifiedStatus);
        } else {
          this.verifiedStatus = false;
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
      if (kob.name === $event.target.value) {
        this.foodCategoryList = kob.food_category;
      }
    })
  }

  getSelectedFoodcat($event: any): void {
    this.verificationForm.patchValue({ food_category: $event });
  }

  setFormValidation(): void {

    this.shopVerificationForm = this.formBuilder.group({
      manager_name: ['', Validators.required],
      fbo_name: ['', Validators.required],
      business_entity: ['', Validators.required],
      owner_name: ['', Validators.required],
      manager_contact: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      manager_email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      state: ['', Validators.required],
      district: ['', Validators.required],
      pincode: ['', Validators.required]
    });

    this.fostacVerificationForm = this.formBuilder.group({
      recipient_no: ['', Validators.required],
      service_name: ['', Validators.required],
      fostac_total: ['', Validators.required],
      sales_date: ['', Validators.required],
      sales_person: ['', Validators.required]
    });

    this.foscosVerificationForm = this.formBuilder.group({
      license_category: ['', Validators.required],
      license_duration: ['', Validators.required],
      foscos_total: ['', Validators.required],
      sales_date: ['', Validators.required],
      sales_person: ['', Validators.required],
      kob: ['', Validators.required],
      food_category: ['', Validators.required],
      ownership_type: ['', Validators.required],
      owners_num: [this.minMembers, Validators.required],
    });

    this.hraVerificationForm = this.formBuilder.group({
      hra_total: ['', Validators.required],
      sales_date: ['', Validators.required],
      sales_person: ['', Validators.required],
      kob: ['', Validators.required],
      food_handler_no: ['', Validators.required]
    });

  }

  onOwnershipTypeChanges($event: any) {
    if ($event.target.value === 'Propraitorship') {
      this.minMembers = 1;
    } else {
      this.minMembers = 2;
    }
    this.verificationForm.patchValue({ 'owners_num': this.minMembers });
  }

  onOwnersNumChange($event: any) {
    let value = $event.target.value;
    if (value < this.minMembers) {
      value = this.minMembers;
    } else if (value > 20) {
      value = 20;
    }

    this.verificationForm.patchValue({ 'owners_num': value });
  }


  //Documents check Function
  onDocCheck($event: any, name: any) {
    //changing check check stsus recored of the required docs to keep track of records

    // const checkedDocs = this.requiredDocs.filter((doc: any) => doc.isChecked);
    this.checkedDocsName.push(name);

    //emitting checked doc name
    // this.emitCheckedDocs.emit({name, isChecked: $event.target.checked});
  }

  //methord for decing result asthetics 
  decideResult(): void {

    if (this.verifiedStatus) {
      this.resultText = 'Verified';
      this.resultTextClass = 'bg-success';
      this.resultIcon = faCircleCheck;
    } else if (this.isPendingByCustomer) {
      this.resultText = 'Pending on customer end';
      this.resultTextClass = 'bg-orange';
      this.resultIcon = faCircleExclamation;
    } else {
      this.resultText = 'In-Progress';
      this.resultTextClass = 'bg-warning';
      this.resultIcon = faCircleExclamation;
    }

  }

  //methord opens recipient list modal 
  recipient(res: any, serviceType: string) {
    {
      if (res !== '' && serviceType === 'Fostac') {
        const modalRef = this.modalService.open(RecipientComponent, { size: 'xl', backdrop: 'static' });
        modalRef.componentInstance.fboData = res;
        modalRef.componentInstance.serviceType = serviceType;
        modalRef.componentInstance.isVerifier = true;
      } else {
        const modalRef = this.modalService.open(RecipientComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.fboData = res;
        modalRef.componentInstance.serviceType = serviceType;
        modalRef.componentInstance.isVerifier = true;
      }

    }
  }

  //********************************************************editing rleted methords****************************************************************

  //methord runs on edit mode change
  async changeEditMode() {
    this.isEditMode = !this.isEditMode;

    //in case of edit mode is on
    if (this.isEditMode) {
      //saving old values of district and pincode in consts
      const district: string = this.shopverificationform['district'].value;
      const pincode: string = this.shopverificationform['pincode'].value;

      console.log(pincode);

      await this.onStateSelect()
      //patching district
      this.shopVerificationForm.patchValue({ district: district })

      this.onDistrictChange()
      //patching district
      this.shopVerificationForm.patchValue({ pincode: pincode })
    }
  }

  //methord run on state selection and fetch districts according to it
  async onStateSelect() {
    let state = this.shopverificationform['state'].value;

    //re configuring districs and pincodes
    this.districts = [];
    this.pincodes = [];
    this.shopverificationform['district'].setValue('');
    this.shopverificationform['pincode'].setValue('');
    this.loading = true;
    return new Promise((resolve, reject) => {
      this._getDataService.getPincodesData(state).subscribe({
        next: (res) => {
          resolve(true);
          let pincodesData = res;
          this.districtAndPincodes = res;
          pincodesData.forEach((obj: pincodeData) => {
            if (!this.districts.find((item: string) => item.toLowerCase() === obj.District.toLowerCase())) {
              this.districts.push(obj.District);
            }
          });
        },
        error: (err) => {
          reject(false);
          let errorObj = err.error
          if (errorObj.userError) {
            this._registerService.signout();
          }
        },
        complete: () => {
          this.loading = false;
        }
      }
      )
    })

  }


  //methord fetches pincode on the basis of district select
  onDistrictChange(): void {
    this.pincodes = [];
    this.shopverificationform['pincode'].setValue('');
    this.loading = true;
    let pincodeArr: any = [];
    this.districtAndPincodes.forEach((obj: any) => {
      if (obj.District == this.shopverificationform['district'].value) {
        pincodeArr.push(obj.Pincode);
      }
    });

    pincodeArr = new Set(pincodeArr);
    this.pincodes = [...pincodeArr];
    this.loading = false;
  }

  //onfboupdate
  onFboUpdate(): void {
    this.verified = true;
    if (this.shopVerificationForm.invalid || this.loading) {
      return
    }

    this.loading = true;
    this._registerService.updateFboInfo(this.caseData.salesInfo.fboInfo._id, this.shopVerificationForm.value).subscribe({
      next: res => {
        this.loading = false;
        this.isEditMode = false;
        this._toastrService.success('Updated Successfully')
        this.getMoreCaseInfo();
        this.switch.nativeElement.checked = false;
      },
      error: err => {
        this.loading = false;
        this._toastrService.error('Updation Error')
      }
    });
  }
}