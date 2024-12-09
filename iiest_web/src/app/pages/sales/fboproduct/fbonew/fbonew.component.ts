import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { FostacComponent } from '../fostac/fostac.component';
import { FoscosComponent } from '../foscos/foscos.component';
import { MultiSelectComponent } from 'src/app/shared/multi-select/multi-select.component';
import { FbolistComponent } from '../../fbolist/fbolist.component';
import { clientType, hraProcessingAmnt, licenceType, medicalProcessAmnt, panIndiaAllowedEmpIds, paymentMode, serviceNames, stateName, waterTestFee } from 'src/app/utils/config';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';
import { pincodeData } from 'src/app/utils/registerinterface';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-fbonew',
  templateUrl: './fbonew.component.html',
  styleUrls: ['./fbonew.component.scss']
})


export class FbonewComponent implements OnInit, OnChanges {
  @ViewChild(FostacComponent, { static: false }) fostacChildComponent: FostacComponent;
  @ViewChild(FoscosComponent, { static: false }) foscosChildComponent: FoscosComponent;
  isQrCode = false;
  userName: string = '';
  userData: any;
  userDesignation: any;
  userEmployeeId: string = '';
  processAmnts: any = {};
  existingFboId: string;
  servicesNames: any = {};
  minValue: number = 1;
  loggedUser: any;
  objId: string;
  foscosFixedCharges: number
  foscosGST: number;
  fostacGST: number;
  hygieneGST: number;
  editedData: any;
  parsedUserData: any;
  submitted = false;
  waterTestFee = waterTestFee;
  clientType = clientType;
  paymentMode = paymentMode;
  licenceType = licenceType;
  isDisabled: boolean = true;
  fboGeneralData: any;
  productList: any;
  productName: any;
  addFbo: any;
  isFostac: boolean = false;
  isFoscos: boolean = false;
  isHygiene: boolean = false;
  isMedical: boolean = false;  //var for mediacal certificate
  isWaterTest: boolean = false;  //var for water test
  isKhadyaPaaln: boolean = false;  //var for water test
  showDiscountCheckbox: boolean = false;
  isEditMode: boolean = false;
  formType: string = "Registration";
  isReadOnly: boolean = true;
  need_gst_number: boolean = false;
  isBusinessTypeB2B: boolean = false;
  selected: any; // related to multi drop-down, remove it if are removing multi-dropdown component
  fostac_processAmnt: number = 0;
  foscos_processAmnt: number = 0;
  hra_processAmnt: number = 0;
  medical_processAmnt: number = 0;
  water_test_processAmnt: number = 0;
  khadya_paaln_processAmnt: { [key: string]: string } = {};
  khadya_paaln_serviceName: { [key: string]: string } = {};
  @ViewChild(MultiSelectComponent) multiSelect !: MultiSelectComponent;
  isExisting: boolean;
  isExistingFbo: boolean;
  isExistingBo: boolean;
  existingUserForm: FormGroup;
  existingUserFboForm: FormGroup;
  existingUserBoForm: FormGroup;
  fboFieldName: string = "FBO Name";
  fboPlaceholder: string = "FBO Name";
  formName: string = "BO";
  //Discount Check Box 
  isCheckboxChecked:boolean = false;
  //New Variables by vansh on 5-01-23 for exsisting 
  searchSuggestions: any;
  searchSuggestionsOnBo: any;
  isSearchEmpty = true;
  isSearchEmptyFBO = true;
  isSearchEmptyBO = true;
  @ViewChild('searchElem') searchElem: any;
  @ViewChild('searchElemFBO') searchElemFBO: any;
  @ViewChild('searchElemBO') searchElemBO: any;
  //New Variables by vansh on 12-01-2023 for allocted area detection for a employee
  allocated_district: string[] = [];
  allocated_state: any = '';
  allocated_pincodes: any = [];
  isPanIndiaAllowed = false; //var for checking if pan india pincodes are allowed for sale to a particular emp or not
  districtAndPincodes: any;
  isFboSelected: boolean = false; //var for deciding if field comminh empty from backend then open that particular field
  selectedFbo: any;
  byCheque: boolean = false;
  chequeImage: File; // var for cheque image
  disabledOptions = []; // this var will contain all the options rom multiselect that have enabled false in db;

  //New variables by vansh on 16-01-2023
  existingFbos: Object[];

  //var for water test
  waterTestServiceName = serviceNames.water_test_report;
  waterTestGST: number = 0;
  waterTestFixedCharges: number = 0;

  //var for medical
  medicalGST: number = 0;
  medicalFixedCharges: number = 0;

  //var for khadya paaln
  khadyaPaalnGST: number = 0;
  khadyaPaalnFixedCharges: number = 0;


  loading: boolean = false;
  // new varable by chandan
  existingbos: Object[];

  //var for coniguring sale for verifer in case of fostac
  isForFostacSaleByCaseList: boolean = false;
  fboDataCommingAsModal: any;
  customSale: boolean = false;
  //var for controlling component in case of component called as child component not by route
  @Input() isCalledAsChild: boolean = false;

  @ViewChild(FbolistComponent) fboList: FbolistComponent;


  fostac_training: FormGroup = new FormGroup({
    fostac_processing_amount: new FormControl(hraProcessingAmnt),
    fostac_service_name: new FormControl(''),
    fostac_client_type: new FormControl(''),
    recipient_no: new FormControl(''),
    fostac_total: new FormControl('')
  });

  foscos_training: FormGroup = new FormGroup({
    foscos_processing_amount: new FormControl(''),
    foscos_govtFee: this.customSale ? new FormControl('') : new FormControl({ value: '', disabled: true }),
    foscos_service_name: new FormControl(''),
    foscos_client_type: new FormControl('General Client'),
    shops_no: new FormControl(1),
    water_test_fee: new FormControl(''),
    license_category: new FormControl(''),
    license_duration: new FormControl(''),
    foscos_total: new FormControl(''),
  });

  hygiene_audit: FormGroup = new FormGroup({
    hra_service_name: new FormControl(serviceNames['HRA'][0]),
    hra_processing_amount: new FormControl(''),
    hra_client_type: new FormControl('General Client'),
    shops_no: new FormControl(1),
    hra_total: new FormControl('')
  });

  //medical logial Form
  medical: FormGroup = new FormGroup({
    medical_total: new FormControl(''),
    medical_processing_amount: new FormControl(''),
    recipient_no: new FormControl('')
  });

  water_test_report: FormGroup = new FormGroup({
    water_test_total: new FormControl(''),
    water_test_service_name: new FormControl(''),
    water_test_processing_amount: new FormControl(''),
  });

  khadya_paaln: FormGroup = new FormGroup({
    khadya_paaln_service_name: new FormControl(''),
    khadya_paaln_processing_amount: new FormControl(''),
    khadya_paaln_total: new FormControl('')
  });

  fboForm: FormGroup = new FormGroup({
    boInfo: new FormControl(''),
    fbo_name: new FormControl(''),
    owner_name: new FormControl(''),
    business_entity: new FormControl(''),
    business_category: new FormControl(''),// form control added by chandan for business_Owner
    business_ownership_type: new FormControl(''), // form control added for business_Owner
    manager_name: new FormControl(''),
    owner_contact: new FormControl(''),
    email: new FormControl(''),
    state: new FormControl(''),
    district: new FormControl(''),
    village: new FormControl(''),
    tehsil: new FormControl(''),
    address: new FormControl(''),
    pincode: new FormControl(''),
    product_name: new FormControl([]),
    business_type: new FormControl('b2c'),
    payment_mode: new FormControl(''),
    createdBy: new FormControl(''),
    grand_total: new FormControl('')
  });


  cheque_data: FormGroup = new FormGroup({
    payee_name: new FormControl(''),
    bank_name: new FormControl(''),
    account_number: new FormControl(''),
    cheque_number: new FormControl(''),
    cheque_image: new FormControl('')
  });

  @Output() emitSaleDocNames: EventEmitter<string[]> = new EventEmitter<string[]>;
  
  constructor(
    private formBuilder: FormBuilder,
    private _getFboGeneralData: GetdataService,
    private _registerService: RegisterService,
    private _toastrService: ToastrService,
    private existingFrom: FormBuilder,
    private existingFboFrom: FormBuilder,
    private existingBoFrom: FormBuilder,
    public activeModal: NgbActiveModal

  ) {
    this.getFboGeneralData();
    // In your Angular component or service
    const item = localStorage.getItem('LoggedInUser');
  }
  ngOnInit(): void {
    
    this.userData = this._registerService.LoggedInUserData();
    this.parsedUserData = JSON.parse(this.userData)
    this.userName = this.parsedUserData.employee_name;
    this.userDesignation = this.parsedUserData.designation;
    this.checkEmpId();
    this.fostac_training = this.formBuilder.group({
      fostac_processing_amount: ['', Validators.required],
      fostac_service_name: ['', Validators.required],
      fostac_client_type: ['', Validators.required],
      recipient_no: ['', Validators.required],
      fostac_total: ['', Validators.required]
    });

    this.foscos_training = this.formBuilder.group({
      foscos_processing_amount: ['', Validators.required],
      foscos_govtFee: this.customSale  ? ['', Validators.required] : [''], 
      foscos_service_name: ['', Validators.required],
      foscos_client_type: ['General Client', Validators.required],
      shops_no: [1, Validators.required],
      water_test_fee: ['', Validators.required],
      license_category: ['', Validators.required],
      license_duration: ['', Validators.required],
      foscos_total: ['', Validators.required]
    });

    this.hygiene_audit = this.formBuilder.group({
      hra_service_name: [serviceNames['HRA'][0], Validators.required],
      hra_processing_amount: [hraProcessingAmnt, Validators.required],
      hra_client_type: ['General Client', Validators.required],
      shops_no: [1, Validators.required],
      hra_total: ['', Validators.required]
    });

    this.cheque_data = this.formBuilder.group({
      payee_name: ['', Validators.required],
      bank_name: ['', Validators.required],
      account_number: ['', Validators.required],
      cheque_number: ['', Validators.required],
      cheque_image: ['', Validators.required]
    });

    //set water test validators
    this.water_test_report = this.formBuilder.group({
      water_test_total: ['', Validators.required],
      water_test_service_name: ['', Validators.required],
      water_test_processing_amount: ['', Validators.required],
    });

    //set mediacal validation
    this.medical = this.formBuilder.group({
      medical_total: ['', Validators.required],
      recipient_no: ['', Validators.required],
      medical_processing_amount: [medicalProcessAmnt, Validators.required],
    })

    this.khadya_paaln = this.formBuilder.group({
      khadya_paaln_service_name: ['', Validators.required],
      khadya_paaln_processing_amount: ['', Validators.required],
      khadya_paaln_total: ['', Validators.required],
    })

    this.existingUserFboForm = this.existingFboFrom.group({
      existingUserFbo: [''],
      searchUser: ['', Validators.required]
    })

    this.existingUserBoForm = this.existingBoFrom.group({
      existingUserBo: [''],
      searchUser: ['', Validators.required]
    })

    let allocated_state: string = '';

    if (!this.isPanIndiaAllowed) { //we will patch allowed state to state field of fbo form in case of only a particulat area allowd to a employee
      allocated_state = this.allocated_state;
    }

    this.fboForm = this.formBuilder.group(
      {
        boInfo: ['', Validators.required],
        fbo_name: ['', Validators.required],
        owner_name: ['', Validators.required],
        business_entity: ['', Validators.required],
        business_category: ['', Validators.required],
        business_ownership_type: ['', Validators.required],
        manager_name: ['', Validators.required],
        owner_contact: ['',
          [
            Validators.required,
            Validators.pattern(/^[0-9]{10}$/)
          ]],
        email: ['',
          [
            Validators.required,
            Validators.email,
          ]],
        state: [allocated_state, Validators.required],
        district: [this.allocated_district, Validators.required],
        address: ['', Validators.required],
        village: [''],
        tehsil: [''],
        pincode: ['', Validators.required],
        product_name: [[], Validators.required],
        business_type: ['b2c', Validators.required],
        payment_mode: ['', Validators.required],
        createdBy: ['', Validators.required],
        grand_total: ['', Validators.required],
      });
    this.fboForm.patchValue({ createdBy: `${this.userName}(${this.parsedUserData.employee_id})` });

    if (this.isForFostacSaleByCaseList) {
      this.fetchExistingUser(this.fboDataCommingAsModal);
    }

    if (!this.isPanIndiaAllowed) {
      this.getAllocatedArea();
    }
    this.getboGeneralData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes['isCalledAsChild'] && changes['isCalledAsChild'].currentValue && this.isCalledAsChild) {
      this.isExistingFbo = true;

    }
  }

  get fbo(): { [key: string]: AbstractControl } {
    return this.fboForm.controls;
  }

  get chequedata(): { [key: string]: AbstractControl } {
    return this.cheque_data.controls;
  }

  setRequired() {
    return [Validators.required];
  }
  //hide the exsisting bo and open exsisting fbo search
  existingUserFbo($event: any) {
    this.isFboSelected = false;
    this.existingUserBoForm.reset();
    // this.existingUserFboForm.reset();
    this.isExistingFbo = false;
    this.isExistingBo = false;
    if ($event.target.checked) {
      this.isExistingFbo = true;
      this.loading = true;
      if (this.existingFbos) {
        this.loading = false;
      }
      this.resetForm('fbo');
      this.fboFieldName = "FBO Name";
      this.fboPlaceholder = "Enter FBO Name";
    } else {

      this.isExistingFbo = false;
      this.fboFieldName = "FBO Name";
      this.fboPlaceholder = "Enter FBO Name";
    }
  }

  //hide the exsisting fbo and open exsisting bo search
  existingUserBo($event: any) {
    // this.existingUserBoForm.reset();
    this.isFboSelected = false;
    this.existingUserFboForm.reset();
    this.isExistingBo = false;
    this.isExistingFbo = false;
    if ($event.target.checked) {
      this.isExistingBo = true;
      this.fboFieldName = "Business Entity";
      this.fboPlaceholder = "Enter Business Entity";
      this.resetForm('bo');
    } else {
      this.isExistingBo = false;
      this.fboFieldName = "FBO Name";
      this.fboPlaceholder = "Enter FBO Name";
    }
  }

  resetForm(type: string) {
    this.fbo['business_type'].setValue('b2c')
    if (type === 'fbo') {
      this.isExistingBo = false;
      this.fboForm.reset();
      this.fboForm.patchValue({ createdBy: `${this.userName}(${this.parsedUserData.employee_id})` });
    } else if (type === 'bo') {
      this.isExistingFbo = false;
      this.fboForm.reset();
      this.fboForm.patchValue({ createdBy: `${this.userName}(${this.parsedUserData.employee_id})` });
    }
    // hide sum form on reset
    this.isFoscos = false;
    this.isFostac = false;
    this.isHygiene = false;
    this.isWaterTest = false;
    this.isMedical = false;
    this.isKhadyaPaaln = false;
    this.byCheque = false;
    this.cheque_data.reset();
    this.fbo['district'].setValue('');
    this.fbo['pincode'].setValue('');
    this.fbo['payment_mode'].setValue('');
    if (!this.isPanIndiaAllowed) {
      this.fbo['state'].setValue(this.allocated_state);
    } else {
      this.fbo['state'].setValue('');
    }
    this.fostac_training.patchValue({ fostac_client_type: '' });
    this.foscos_training.patchValue({ foscos_client_type: 'General Client' });
    this.hygiene_audit.patchValue({ hra_client_type: 'General Client' });
    this.foscos_training.patchValue({ foscos_service_name: '' });
    this.fostac_training.patchValue({ fostac_service_name: '' });
    this.fostac_training.patchValue({ fostac_processing_amount: '' });
    this.foscos_training.patchValue({ foscos_processing_amount: '' });
    this.foscos_training.patchValue({ license_category: '' });
    this.foscos_training.patchValue({ license_duration: '' });
    this.foscos_training.patchValue({ water_test_fee: '' });
    this.hygiene_audit.patchValue({ hra_processing_amount: 5000 });
    this.hygiene_audit.patchValue({ hra_service_name: 'HRA' });
    //reset subforms in case of reset
    this.resetWaterTestForm()
    this.resetMedicalForm();
    this.resetKhadyaPaaln();
    this.multiSelect.onReset();
  }

  filterSearch(event: any) {
    let value = event.target.value
    if (value !== '') {
      this.isSearchEmptyFBO = false;
    }
    else {
      this.isSearchEmptyFBO = true;
      return
    }
    let regex = new RegExp(value, "i")
    this.searchSuggestions = this.existingFbos.filter((obj: any) => regex.test(obj.fbo_name) || regex.test(obj.owner_name));
  }

  filterSearchOnBo(event: any) {
    let value = event.target.value
    if (value !== '') {
      this.isSearchEmptyBO = false;
    }
    else {
      this.isSearchEmptyBO = true;
      return
    }
    let regex = new RegExp(value, "i") // i means case insesitive
    //using regex for comparing fbo names and customer ids
    this.searchSuggestionsOnBo = this.existingbos.filter((obj: any) => obj.owner_name && obj.customer_id && (regex.test(obj.owner_name) || regex.test(obj.customer_id)));
  }

  test: string
  fetchExistingUser(fboObj: any) {
    this.isFboSelected = true;
    this.existingFboId = fboObj.customer_id


    //we will not have search query in case we are fetching fbo from case list
    if (!this.isForFostacSaleByCaseList) {
      this.searchElemFBO.nativeElement.value = ''

    }

    this.isSearchEmptyFBO = true;

    this.selectedFbo = fboObj;
    this.fbo['fbo_name'].setValue(fboObj.fbo_name);
    this.fbo['owner_name'].setValue(fboObj.owner_name);
    this.fbo['owner_contact'].setValue(fboObj.owner_contact);
    this.fbo['business_entity'].setValue(fboObj.boInfo.business_entity);
    this.fbo['business_category'].setValue(fboObj.boInfo.business_category);
    this.fbo['manager_name'].setValue(fboObj.boInfo.manager_name);
    this.fbo['business_ownership_type'].setValue(fboObj.boInfo.business_ownership_type);
    this.fbo['email'].setValue(fboObj.email);
    this.fbo['state'].setValue(fboObj.state);
    this.loading = true;
    this.allocated_district = [];
    this.allocated_pincodes = [];
    this.fbo['district'].setValue('');
    this.fbo['pincode'].setValue('');
    if (fboObj.pincode) {
      this._getFboGeneralData.getPincodesData(fboObj.state).subscribe({
        next: res => {
          this.allocated_district = res.map((item: any) => item.District);
          this.fbo['district'].setValue(fboObj.district);
          if (fboObj.district) {
            this.allocated_pincodes = res.filter((item: any) => item.District == fboObj.district).map((item: any) => item.Pincode);
            this.fbo['pincode'].setValue(fboObj.pincode);
          }
          this.loading = false;
        },
        error: err => {
          this.loading = false;
        }
      })
    }
    this.loading = false;

    // this.fbo['district'].setValue(fboObj.district);
    this.fbo['pincode'].setValue(fboObj.pincode);
    this.fbo['address'].setValue(fboObj.address);
    this.fbo['village'].setValue(fboObj.village);
    this.fbo['tehsil'].setValue(fboObj.tehsil);
    this.fbo['boInfo'].setValue(fboObj.boInfo._id);
    this.fbo['business_type'].setValue(fboObj.business_type);
    if (fboObj.business_type === 'b2b') {
      this.fboForm.addControl('gst_number', new FormControl(fboObj.gst_number, Validators.required));
      this.need_gst_number = true;
    }
    if (fboObj.business_type === 'b2c') {
      this.fboForm.removeControl('gst_number');
      this.need_gst_number;
    }
  }


  //fetching exsisting bo data bo data 
  fetchExistingBo(fboObj: any) {
    this.existingFboId = fboObj.customer_id
    this.searchElemBO.nativeElement.value = ''
    this.isSearchEmptyBO = true;
    this.fbo['owner_name'].setValue(fboObj.owner_name);
    this.fbo['business_entity'].setValue(fboObj.business_entity);
    this.fbo['business_category'].setValue(fboObj.business_category);
    this.fbo['business_ownership_type'].setValue(fboObj.business_ownership_type);
    this.fbo['owner_contact'].setValue(fboObj.contact_no);
    this.fbo['email'].setValue(fboObj.email);
    this.fbo['manager_name'].setValue(fboObj.manager_name);
    this.fbo['boInfo'].setValue(fboObj._id);
  }


  //Form Submit Method
  onSubmit() {
    console.log(this.fboForm);
    //return;
    this.loggedUser = this._registerService.LoggedInUserData();
    this.objId = JSON.parse(this.loggedUser)._id;
    this.submitted = true;

    if (this.fboForm.invalid || this.loading) {
      return;
    }

    this.loading = true;

    if (this.isEditMode) {
      this.editedData = this.fboForm.value;
      this._registerService.updateFbo(this.objId, this.editedData, `${this.userName}(${this.parsedUserData.employee_id})`).subscribe({
        next: (res) => {
          this.loading = false;
          if (res.success) {
            this._toastrService.success('', 'Record Edited Successfully');
            this.backToRegister();
          }
        },
        error: err => {
          this.loading = false;
        }
      });
    } else {
      this.addFbo = this.fboForm.value;
      if (!this.isExistingFbo) {
        if (this.addFbo.payment_mode === 'Pay Page') {
          this._registerService.fboPayment(this.objId, this.addFbo, this.foscosGST, this.fostacGST, this.hygieneGST, this.medicalGST, this.waterTestGST, this.khadyaPaalnGST, this.foscosFixedCharges).subscribe({
            next: (res) => {
              this.loading = false;
              window.location.href = res.message;
            },
            error: (err) => {
              this.loading = false;
              let errorObj = err.error;
              if (errorObj.userError) {
                this._registerService.signout();
              } else if (errorObj.contactErr) {
                this._toastrService.error('', 'This Contact Already Exists.');
              } else if (errorObj.emailErr) {
                this._toastrService.error('', 'This Email Already Existis');
              } else if (errorObj.signatureErr) {
                this._toastrService.error('', 'Signature Not Found');
              } else if (errorObj.registerErr) {
                this._toastrService.error('', 'Some Error Occured. Please Try Again');
              } else if (errorObj.areaAllocationErr) {
                this._toastrService.error('', 'Area has not been allocated to this employee.')
              } else if (errorObj.wrongPincode) {
                this._toastrService.error('', 'You cannot make sale outside your allocated area');
              } else if (errorObj.noSignErr) {
                this._toastrService.error('', 'Provide your signature first in account in settings');
              }
            }
          })
        } else if (this.addFbo.payment_mode === 'Cash') {
          this._registerService.addFbo(this.objId, this.addFbo, this.foscosGST, this.fostacGST, this.hygieneGST, this.medicalGST, this.waterTestGST, this.khadyaPaalnGST, this.foscosFixedCharges).subscribe({
            next: (res) => {
              this.loading = false;
              if (res.success) {
                this._toastrService.success('', 'Record Added Successfully');
                this.backToRegister();
              }
            },
            error: (err) => {
              this.loading = false;
              let errorObj = err.error;
              if (errorObj.userError) {
                this._registerService.signout();
              } else if (errorObj.contactErr) {
                this._toastrService.error('', 'This Contact Already Exists.');
              } else if (errorObj.emailErr) {
                this._toastrService.error('', 'This Email Already Exists.');
              } else if (errorObj.signatureErr) {
                this._toastrService.error('', 'Signature Not Found');
              } else if (errorObj.registerErr) {
                this._toastrService.error('', 'Some Error Occured. Please Try Again');
              } else if (errorObj.areaAllocationErr) {
                this._toastrService.error('', 'Area has not been allocated to this employee.')
              } else if (errorObj.wrongPincode) {
                this._toastrService.error('', 'You cannot make sale outside your allocated area');
              } else if (errorObj.noSignErr) {
                this._toastrService.error('', 'Provide your signature first in account in settings');
              }
            }
          })
        } else if (this.addFbo.payment_mode === 'Pay Later') {
          this._registerService.fboPaymentPayLater(this.objId, this.addFbo).subscribe({
            next: (res) => {
              this.loading = false;
              if (res.success) {
                this._toastrService.success('', 'Record Added Successfully');
                this.backToRegister();
              }
            },
            error: (err) => {
              this.loading = false;
              let errorObj = err.error;
              if (errorObj.userError) {
                this._registerService.signout();
              } else if (errorObj.contactErr) {
                this._toastrService.error('', 'This Contact Already Exists.');
              } else if (errorObj.emailErr) {
                this._toastrService.error('', 'This Email Already Exists.');
              } else if (errorObj.signatureErr) {
                this._toastrService.error('', 'Signature Not Found');
              } else if (errorObj.registerErr) {
                this._toastrService.error('', 'Some Error Occured. Please Try Again');
              } else if (errorObj.areaAllocationErr) {
                this._toastrService.error('', 'Area has not been allocated to this employee.')
              } else if (errorObj.wrongPincode) {
                this._toastrService.error('', 'You cannot make sale outside your allocated area');
              } else if (errorObj.noSignErr) {
                this._toastrService.error('', 'Provide your signature first in account in settings');
              }
            }
          })
        } else if (this.addFbo.payment_mode === 'By Cheque') {

          let formData = new FormData();

          formData.append('boInfo', this.fboForm.value.boInfo);
          formData.append('fbo_name', this.fboForm.value.fbo_name);
          formData.append('owner_name', this.fboForm.value.owner_name);
          formData.append('business_entity', this.fboForm.value.business_entity);
          formData.append('business_category', this.fboForm.value.business_category);
          formData.append('business_ownership_type', this.fboForm.value.business_ownership_type);
          formData.append('owner_contact', this.fboForm.value.owner_contact);
          formData.append('email', this.fboForm.value.email);
          formData.append('state', this.fboForm.value.state);
          formData.append('district', this.fboForm.value.district);
          formData.append('village', this.fboForm.value.village);
          formData.append('tehsil', this.fboForm.value.tehsil);
          formData.append('address', this.fboForm.value.address);
          formData.append('pincode', this.fboForm.value.pincode);
          formData.append('product_name', this.fboForm.value.product_name.toString());
          formData.append('business_type', this.fboForm.value.business_type);
          formData.append('payment_mode', this.fboForm.value.payment_mode);
          formData.append('createdBy', this.fboForm.value.createdBy);
          formData.append('grand_total', this.fboForm.value.grand_total);
          formData.append('fostac_training', JSON.stringify(this.fostac_training.value));
          formData.append('foscos_training', JSON.stringify(this.foscos_training.value));
          formData.append('hygiene_audit', JSON.stringify(this.hygiene_audit.value));
          formData.append('medical', JSON.stringify(this.medical.value));
          formData.append('khadya_paaln', JSON.stringify(this.khadya_paaln.value));
          formData.append('water_test_report', JSON.stringify(this.water_test_report.value));
          let chequeData = {
            payee_name: this.cheque_data.value.payee_name,
            account_number: this.cheque_data.value.account_number,
            cheque_number: this.cheque_data.value.cheque_number,
            bank_name: this.cheque_data.value.bank_name,
          }
          formData.append('cheque_data', JSON.stringify(chequeData));
          formData.append('cheque_image', this.chequeImage);
          formData.append('isFostac', this.isFostac.toString());
          formData.append('isFoscos', this.isFoscos.toString());
          formData.append('isHygiene', this.isHygiene.toString());
          formData.append('isMedical', this.isMedical.toString());
          formData.append('isKhadyaPaaln', this.isKhadyaPaaln.toString());
          formData.append('isWaterTest', this.isWaterTest.toString());

          if (this.fboForm.value.business_type == 'b2b') { //append gst number in case of b2b business type
            formData.append('gst_number', this.fboForm.value.gst_number)
          }

          this._registerService.boByCheque(this.objId, formData).subscribe({
            next: res => {
              this._toastrService.success('', 'Record Added Successfully');
              this.backToRegister();
            },
            error: err => {
              this.loading = false;
              let errorObj = err.error;
              if (errorObj.userError) {
                this._registerService.signout();
              } else if (errorObj.contactErr) {
                this._toastrService.error('', 'This Contact Already Exists.');
              } else if (errorObj.emailErr) {
                this._toastrService.error('', 'This Email Already Exists.');
              } else if (errorObj.signatureErr) {
                this._toastrService.error('', 'Signature Not Found');
              } else if (errorObj.registerErr) {
                this._toastrService.error('', 'Some Error Occured. Please Try Again');
              } else if (errorObj.areaAllocationErr) {
                this._toastrService.error('', 'Area has not been allocated to this employee.')
              } else if (errorObj.wrongPincode) {
                this._toastrService.error('', 'You cannot make sale outside your allocated area');
              } else if (errorObj.noSignErr) {
                this._toastrService.error('', 'Provide your signature first in account in settings');
              }
            }
          })
        }
      } else {
        if (this.addFbo.payment_mode === 'Cash') {
          this._registerService.existingFboSale(this.objId, this.addFbo, this.foscosGST, this.fostacGST, this.hygieneGST, this.medicalGST, this.waterTestGST, this.khadyaPaalnGST, this.foscosFixedCharges, this.existingFboId).subscribe({
            next: (res) => {
              this.loading = false;
              if (res.success) {
                this._toastrService.success('', 'Record Added Successfully');
                this.backToRegister();
              }
            },
            error: (err) => {
              this.loading = false;
              let errorObj = err.error
              if (errorObj.userError) {
                this._registerService.signout();
              } else if (errorObj.signatureErr) {
                this._toastrService.error('', 'Signature Not Found');
              } else if (errorObj.areaAllocationErr) {
                this._toastrService.error('', 'Area has not been allocated to this employee.')
              } else if (errorObj.wrongPincode) {
                this._toastrService.error('', 'You cannot make sale outside your allocated area');
              } else if (errorObj.noSignErr) {
                this._toastrService.error('', 'Provide your signature first in account in settings');
              } else if (errorObj.fboMissing) {
                this._toastrService.error('', 'FBO not found');
              }
            }
          })
        }
        if (this.addFbo.payment_mode === 'Pay Later') {
          this._registerService.existingFboPayLater(this.objId, this.addFbo, this.existingFboId).subscribe({
            next: (res) => {
              this.loading = false;
              if (res.success) {
                this._toastrService.success('', 'Record Added Successfully');
                this.backToRegister();
              }
            },
            error: (err) => {
              this.loading = false;
              let errorObj = err.error
              if (errorObj.userError) {
                this._registerService.signout();
              } else if (errorObj.signatureErr) {
                this._toastrService.error('', 'Signature Not Found');
              } else if (errorObj.areaAllocationErr) {
                this._toastrService.error('', 'Area has not been allocated to this employee.')
              } else if (errorObj.wrongPincode) {
                this._toastrService.error('', 'You cannot make sale outside your allocated area');
              } else if (errorObj.noSignErr) {
                this._toastrService.error('', 'Provide your signature first in account in settings');
              } else if (errorObj.fboMissing) {
                this._toastrService.error('', 'FBO not found');
              }
            }
          })
        }
        else if (this.addFbo.payment_mode === 'By Cheque') {

          let formData = new FormData();

          formData.append('pincode', this.fboForm.value.pincode);
          formData.append('product_name', this.fboForm.value.product_name.toString());
          formData.append('payment_mode', this.fboForm.value.payment_mode);
          formData.append('grand_total', this.fboForm.value.grand_total);
          formData.append('existingFboId', this.existingFboId);
          formData.append('fostac_training', JSON.stringify(this.fostac_training.value));
          formData.append('foscos_training', JSON.stringify(this.foscos_training.value));
          formData.append('hygiene_audit', JSON.stringify(this.hygiene_audit.value));
          formData.append('medical', JSON.stringify(this.medical.value));
          formData.append('khadya_paaln', JSON.stringify(this.khadya_paaln.value));
          formData.append('water_test_report', JSON.stringify(this.water_test_report.value));
          let chequeData = {
            payee_name: this.cheque_data.value.payee_name,
            account_number: this.cheque_data.value.account_number,
            cheque_number: this.cheque_data.value.cheque_number,
            bank_name: this.cheque_data.value.bank_name,
          }
          formData.append('cheque_data', JSON.stringify(chequeData));
          formData.append('cheque_image', this.chequeImage);
          formData.append('isFostac', this.isFostac.toString());
          formData.append('isFoscos', this.isFoscos.toString());
          formData.append('isHygiene', this.isHygiene.toString());
          formData.append('isMedical', this.isMedical.toString());
          formData.append('isKhadyaPaaln', this.isKhadyaPaaln.toString());
          formData.append('isWaterTest', this.isWaterTest.toString());

          if (this.fboForm.value.business_type == 'b2b') {//append gst number in case of b2b business type
            formData.append('gst_number', this.fboForm.value.gst_number)
          }
          this._registerService.fboByCheque(this.objId, formData).subscribe({
            next: res => {
              this._toastrService.success('', 'Record Added Successfully');
              this.backToRegister();
            },
            error: (err) => {
              this.loading = false;
              let errorObj = err.error
              if (errorObj.userError) {
                this._registerService.signout();
              } else if (errorObj.signatureErr) {
                this._toastrService.error('', 'Signature Not Found');
              } else if (errorObj.areaAllocationErr) {
                this._toastrService.error('', 'Area has not been allocated to this employee.')
              } else if (errorObj.wrongPincode) {
                this._toastrService.error('', 'You cannot make sale outside your allocated area');
              } else if (errorObj.noSignErr) {
                this._toastrService.error('', 'Provide your signature first in account in settings');
              } else if (errorObj.fboMissing) {
                this._toastrService.error('', 'FBO not found');
              }
            }
          })

        }
        else if (this.addFbo.payment_mode === 'Pay Page') {
          
          this._registerService.existingFboPayPage(this.objId, this.addFbo, this.foscosGST, this.fostacGST, this.hygieneGST, this.medicalGST, this.waterTestGST, this.khadyaPaalnGST, this.foscosFixedCharges, this.existingFboId).subscribe({
            next: (res) => {
              window.location.href = res.message
            }
          })
        }
      }
    }
  }

  //Get Fbo General Data
  getFboGeneralData() {
    this._getFboGeneralData.getFboGeneralData().subscribe({
      next: (res) => {
        this.fboGeneralData = res.product_name;
        if(this.parsedUserData.panel_type === 'FSSAI Relationship Panel'){
          this.fboGeneralData['Khadya Paaln'].enabled = true;
        }
        this.fboGeneralData = Object.entries(this.fboGeneralData).map(([key, value]) => ({ key, value }))
          .sort((item: any) => item.value.enabled ? -1 : 1); //convertimg object to arr of type [{key, value}]
        this.productList = this.fboGeneralData.map((item: any) => item.key);
       
        //this.disabledOptions = this.fboGeneralData.filter((item: any) => !item.value.enabled).map((item: any) => item.key);
        this.disabledOptions = this.fboGeneralData
  .filter((item: any) => {
    // Check if the user is a sales agent
    console.log(this.userDesignation );
    if (this.userDesignation === 'Sales Agent') {
      // Enable only the "Khadya Paaln" option, disable others
      //return item.key !== 'Khadya Paaln';
      return !item.value.enabled;
    } 
    // For Area Officer: disable "Khadya Paaln" specifically
    else if (this.userDesignation === 'Area Officer(District Head)') {
      return item.key === 'Khadya Paaln' || !item.value.enabled;
    }
    else {
      // If the user is not a sales agent, apply the existing filter condition
      return !item.value.enabled;
    }
  })
  .map((item: any) => item.key);
        console.log(this.disabledOptions)
        for (let productName in res.product_name) {
          let product = res.product_name[productName];
          this.processAmnts[productName] = product['processing_amount'];
          this.servicesNames[productName] = product['service_name'];
        }
      },
      error: (err) => {
        let errorObj = err.error
        if (errorObj.userError) {
          this._registerService.signout();
        }
      }
    })
    // for getting fbo lists
    this._getFboGeneralData.getFbolist().subscribe({
      next: (res) => {
        this.loading = false;
        this.existingFbos = res.fboList;
      },
      error: (err) => {
      }
    })
  }

  //Get all bo General Data 
  getboGeneralData() {
    //start loading
    this.loading = true;
    this._getFboGeneralData.getbolist().subscribe({
      next: (res) => {
        this.existingbos = res.boList;
        //stop loading on success
        this.loading = false;
      },
      error: (err) => {
        //stop loading on error
        this.loading = false;
      }
    })

  }

  //Reset the form
  onReset(): void {
    this.submitted = false;
    this.fboForm.reset();
    this.need_gst_number = false; // this will hide gst number on form reset 
    this.isFostac = false;
    this.isFoscos = false;
    this.isHygiene = false;
    this.isMedical = false;
    this.isKhadyaPaaln = false;
    this.isWaterTest = false;
    this.fboForm.removeControl('gst_number')// this will remove gst number form control on form reset 
    //remove products form control from fbo form in case of reset
    this.fboForm.removeControl('fostac_training');
    this.fboForm.removeControl('foscos_training');
    this.fboForm.removeControl('hygiene_audit')
    this.fboForm.removeControl('water_test_report');
    this.fboForm.removeControl('medical');
    this.fboForm.removeControl('khadya_paaln');
    this.multiSelect.onReset();
  }

 
    getSelectedProduct($event: string[]) {
      this.productName = $event;
      this.emitSaleDocNames.emit(this.productName);
      this.fboForm.patchValue({ product_name: this.productName });
      
      const filtered = this.fboGeneralData.filter((a: any) => this.productName.includes(a.key));
      
      // Resetting flags
      this.isFostac = false;
      this.isFoscos = false;
      this.isHygiene = false;
      this.isMedical = false;
      this.isKhadyaPaaln = false;
      this.isWaterTest = false;
    
      // Remove controls if not selected
      this.fboForm.removeControl('fostac_training');
      this.fboForm.removeControl('foscos_training');
      this.fboForm.removeControl('hygiene_audit');
      this.fboForm.removeControl('water_test_report');
      this.fboForm.removeControl('medical');
      this.fboForm.removeControl('khadya_paaln');
    
      // Loop through selected products
      for (let product of this.productName) {
        switch (product) {
          case 'Fostac':
            this.isFostac = true;
            this.fboForm.addControl('fostac_training', this.fostac_training);
            break;
          
          case 'Foscos':
            this.isFoscos = true;
            this.fboForm.addControl('foscos_training', this.foscos_training);
            break;
    
          case 'HRA':
            this.isHygiene = true;
            this.fboForm.addControl('hygiene_audit', this.hygiene_audit);
            break;
    
          case 'Water Test Report':
            this.isWaterTest = true;
            this.fboForm.addControl('water_test_report', this.water_test_report);
            break;
    
          case 'Medical':
            this.isMedical = true;
            this.medical.patchValue({ medical_processing_amount: medicalProcessAmnt });
            this.fboForm.addControl('medical', this.medical);
            break;
    
          case 'Khadya Paaln':
            this.isKhadyaPaaln = true;
            this.fboForm.addControl('khadya_paaln', this.khadya_paaln);
            if (filtered[0]) {
              this.khadya_paaln_processAmnt = filtered[0].value.processing_amount;
              this.khadya_paaln_serviceName = filtered[0].value.service_name;
            }
            break;
          
          default:
            break;
        }
      }
    
      // Handle deselected cases for each control
      if (!this.isFostac) {
        this.fostacTotalAmount(0);
        this.resetFostacForm();
      }
      if (!this.isFoscos) {
        this.foscosTotalAmount(0);
        this.resetFoscosForm();
      }
      if (!this.isHygiene) {
        this.hygieneTotalAmount(0);
        this.resetHRAForm();
      }
      if (!this.isWaterTest) {
        this.watertestTotalAmount(0);
        this.resetWaterTestForm();
      }
      if (!this.isMedical) {
        this.medicalTotalAmount(0);
        this.resetMedicalForm();
      }
      if (!this.isKhadyaPaaln) {
        // Handle any additional reset logic if needed
        this.resetKhadyaPaaln();
      }
    }

  backToRegister() {
    location.reload();
  }

  isEditRecord(param: any) {
    this.isEditMode = param.isEditMode;
    const record = param.Record;
    this.objId = record._id
    this.formType = "Edit"
    this.fboForm.setValue({
      fbo_name: record.fbo_name,
      owner_name: record.owner_name,
      owner_contact: record.owner_contact,
      email: record.email,
      state: record.state,
      district: record.district,
      address: record.address,
      product_name: record.product_name,
      processing_amount: record.processing_amount,
      service_name: record.service_name,
      client_type: record.client_type,
      recipient_no: record.recipient_no,
      water_test_fee: record.water_test_fee,
      payment_mode: record.payment_mode,
      createdBy: record.createdBy,
      license_category: record.license_category,
      license_duration: record.license_duration,
      total_amount: record.total_amount
    })
  }

  ModeofPayment(event: any) {
    if (this.fboForm.value.total_amount !== '' && event.target.value == 'By Cheque') {
      if (this.fboForm.value.grand_total <= 2000) {
        this.fboForm.patchValue({ payment_mode: '' });
        this._toastrService.error('Grand total should be greated than 2000 For Cheque ')
        return
      }
      this.byCheque = true;
      this.fboForm.addControl('cheque_data', this.cheque_data);
    } else {
      this.byCheque = false;
      this.fboForm.removeControl('cheque_data');
    }
  }

  // Method to clear the child component's form
  clearChildForm(val: string) {
    if (val === 'fostac') {
      this.fostacChildComponent.resetForm();
    }
    if (val === 'foscos') {
      this.foscosChildComponent.resetForms();
    }
  }


  // This function conditionally add gst number filled in fbo form (condition: If checkox B2B is true in Business type field)
  onBusinessTypeChange($event: any) {
    let businessType: string = $event.target.value
    if (businessType) {
      if (businessType === 'b2b') { // If we have business type b2b then we want to add gst number form control
        this.need_gst_number = true;
        this.fboForm.addControl('gst_number', new FormControl('', Validators.required));
      }
      else if (businessType === 'b2c') { // If we have business type b2c then we want to remove gst number form control
        this.need_gst_number = false;
        this.fboForm.removeControl('gst_number');
      }
    } else { //if the check box is not checked then logic will work oppositely
      if (businessType === 'b2b') {
        this.need_gst_number = false;
        this.fboForm.removeControl('gst_number');
      }
      else if (businessType === 'b2c') {
        this.need_gst_number = true;
        this.fboForm.addControl('gst_number', new FormControl('', Validators.required));
      }
    }
  }

  fostacTotalAmount(TotalAmnt: any) {
    // Ensure `TotalAmnt` is a number
    this.fostac_processAmnt = typeof TotalAmnt === 'number' ? TotalAmnt : 0;
    this.updateGrandTotal();
}

foscosTotalAmount(TotalAmnt: any) {
    this.foscos_processAmnt = typeof TotalAmnt === 'number' ? TotalAmnt : 0;
    this.updateGrandTotal();
}

hygieneTotalAmount(TotalAmnt: any) {
    this.hra_processAmnt = typeof TotalAmnt === 'number' ? TotalAmnt : 0;
    this.updateGrandTotal();
}

watertestTotalAmount(TotalAmnt: any) {
    this.water_test_processAmnt = typeof TotalAmnt === 'number' ? TotalAmnt : 0;
    this.updateGrandTotal();
}

medicalTotalAmount(TotalAmnt: any) {
    this.medical_processAmnt = typeof TotalAmnt === 'number' ? TotalAmnt : 0;
    this.updateGrandTotal();
}

// Function to update the grand total
updateGrandTotal() {
    const grandTotal = 
        (typeof this.fostac_processAmnt === 'number' ? this.fostac_processAmnt : 0) +
        (typeof this.foscos_processAmnt === 'number' ? this.foscos_processAmnt : 0) +
        (typeof this.hra_processAmnt === 'number' ? this.hra_processAmnt : 0) +
        (typeof this.water_test_processAmnt === 'number' ? this.water_test_processAmnt : 0) +
        (typeof this.medical_processAmnt === 'number' ? this.medical_processAmnt : 0) +
        (typeof this.khadya_paaln_processAmnt === 'number' ? this.khadya_paaln_processAmnt : 0);

    // Patch the calculated grand total to the form
    this.fboForm.patchValue({ 'grand_total': grandTotal });
}


  foscosCharges(charges: any) {
    this.foscosFixedCharges = charges;
  }
  foscosGSTAmount(gstAmount: number) {
    this.foscosGST = gstAmount
  }
  fostacGSTAmount(gstAmount: any) {
    this.fostacGST = gstAmount
  }
  hygieneGSTAmount(gstAmount: any) {
    this.hygieneGST = gstAmount
  }
  khadyaPaalnGSTAmount(gstAmount: any){
    this.fboForm.patchValue({ 'grand_total': gstAmount})
  }

  getAllocatedArea() {
    let userData: any = this._registerService.LoggedInUserData();
    let parsedData = JSON.parse(userData)
    this._getFboGeneralData.getAllocatedAreas(parsedData._id).subscribe({
      next: (res) => {
        let data = res.allocatedPincodes;
        if (!data) {
          // this._toastrService.error('', 'Your Area is not allocated yet');
          // this.router.navigate(['/home']);
        } else {
          this.allocated_state = data.state;
          this.allocated_district = data.district;
          this.allocated_pincodes = data.pincodes;
          this.fboForm.patchValue({ state: this.allocated_state });
        }
      },
      error: (err) => {


      }
    })
  }

  onStateSelect() { // this methord will call api for getting all district belongs to a particular state and their respective pincodes and set them in district and pincodes var in case of pan india allowed
    let state = this.fbo['state'].value;
    this.allocated_district = [];
    this.allocated_pincodes = [];
    this.fbo['district'].setValue('');
    this.fbo['pincode'].setValue('');
    this.loading = true;
    this._getFboGeneralData.getPincodesData(state).subscribe({
      next: (res) => {
        let pincodesData = res;
        this.districtAndPincodes = res;
        pincodesData.forEach((obj: pincodeData) => {
          if (!this.allocated_district.find((item: string) => item.toLowerCase() === obj.District.toLowerCase())) {
            this.allocated_district.push(obj.District);
          }
        })
      },
      error: (err) => {
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
  }

  onDistrictChange() {
    if (!this.isPanIndiaAllowed) {
      return
    }
    this.allocated_pincodes = [];
    this.fbo['pincode'].setValue('');
    this.loading = true;
    let pincodeArr: any = [];
    this.districtAndPincodes.forEach((obj: any) => {
      if (obj.District == this.fbo['district'].value) {
        pincodeArr.push(obj.Pincode);
      }
    });

    pincodeArr = new Set(pincodeArr);
    this.allocated_pincodes = [...pincodeArr];
    this.loading = false;
  }
  customSaleFunc($event: any){
    this.customSale = $event.target.checked;
    console.log($event.target.checked)
  }

  resetFostacForm(): void {
    this.fostac_training.patchValue({ fostac_processing_amount: '' });
    this.fostac_training.patchValue({ fostac_service_name: '' });
    this.fostac_training.patchValue({ fostac_client_type: '' });
    this.fostac_training.patchValue({ recipient_no: '' });
    this.fostac_training.patchValue({ fostac_total: '' });
  }

  resetFoscosForm(): void {
    this.foscos_training.patchValue({ foscos_processing_amount: '' });
    this.foscos_training.patchValue({ foscos_service_name: '' });
    this.foscos_training.patchValue({ foscos_client_type: 'General Client' });
    this.foscos_training.patchValue({ shops_no: 1 });
    this.foscos_training.patchValue({ water_test_fee: '' });
    this.foscos_training.patchValue({ license_category: '' });
    this.foscos_training.patchValue({ license_duration: '' });
    this.foscos_training.patchValue({ foscos_total: '' });
  }

  resetHRAForm(): void {
    this.hygiene_audit.patchValue({ hra_processing_amount: 5000 });
    this.hygiene_audit.patchValue({ hra_service_name: 'HRA' });
    this.hygiene_audit.patchValue({ shops_no: 1 });
    this.hygiene_audit.patchValue({ hra_client_type: 'General Client' });
    this.hygiene_audit.patchValue({ hra_total: '' });
  }

  resetWaterTestForm(): void {
    this.water_test_report.patchValue({ water_test_processing_amount: '' });
    this.water_test_report.patchValue({ water_test_service_name: '' });
    this.water_test_report.patchValue({ water_test_total: '' });
  }

  resetMedicalForm(): void {
    this.medical.patchValue({ medical_processing_amount: medicalProcessAmnt });
    this.medical.patchValue({ medical_total: '' });
  }

  resetKhadyaPaaln(): void {
    this.khadya_paaln.patchValue({ khadya_paaln_service_name: ''});
    this.khadya_paaln.patchValue({ khadya_paaln_processing_amount: ''});
    this.khadya_paaln.patchValue({ khadya_paaln_total: ''});
    this.showDiscountCheckbox = false;
  }

  checkEmpId() { //this methord checks and allow to give Pan India location for a particular employee
    this.userEmployeeId = this.parsedUserData.employee_id;
    if (panIndiaAllowedEmpIds.includes(this.userEmployeeId) || this.parsedUserData.designation === 'Sales Agent') {
      this.isPanIndiaAllowed = true;
      // this.fboForm.patchValue({state: ""});
      this.allocated_state = stateName;
    }
  }

  closeMultiSelect() {
    this.multiSelect.isdropped = false;
  }

  uploadChequeImage($event: any) {
    let file = $event.target.files[0];

    if (file.type == "image/jpeg" || file.type == "image/jpg" || file.type == "image/png" || file.type == "application/pdf") {
      this.chequeImage = file;
    }
  }

  //func for adding medical amount in case of medical 
  medicalRecpChange($event: any) {
    if ($event.target.value <= 0) {
      this.medical.patchValue({ recipient_no: 1 });
    }
   
   if(!this.customSale){
    const perMedicalAmount = medicalProcessAmnt;
    const GSTPerMedical = Math.round(medicalProcessAmnt * 18 / 100);
    this.medicalGST = GSTPerMedical * $event.target.value;
    console.log(this.medicalGST)
    const perMedicalWithGST = perMedicalAmount + GSTPerMedical;
    const medicalTotal = perMedicalWithGST * $event.target.value;
    this.medical.patchValue({ medical_total: medicalTotal });
    this.medicalTotalAmount(medicalTotal);
   }else{
    const perMedicalAmount = Number(this.medical.value.medical_processing_amount);
    const medicalTotal = Math.round((perMedicalAmount * $event.target.value) * 1.18);
    this.medical.patchValue({ medical_total: medicalTotal });
    this.medicalTotalAmount(medicalTotal);
   }
    
  }
  customMedical($event:any){
    const perMedicalAmount = Number($event.target.value);
    const medicalTotal = Math.round((perMedicalAmount * this.medical.value.recipient_no) * 1.18);
    this.medical.patchValue({ medical_total: medicalTotal });
    this.medicalTotalAmount(medicalTotal);
  }

  onWaterTestServiceChange($event: any): void {//methord for water test service change
    this.getWaterTestProcessAmnt($event.target.value);
    this.waterTestGST = Math.round(this.water_test_report.value.water_test_processing_amount * 18 / 100); // calculate gst of water test
    const waterTestWithGst: number = Number(this.water_test_report.value.water_test_processing_amount) + this.waterTestGST
    this.water_test_report.patchValue({ water_test_total: waterTestWithGst }) //patch total to total amount
    this.watertestTotalAmount(waterTestWithGst);
  }

  getWaterTestProcessAmnt(serviceType: string): void { //methord for deciding processing watertest amount on service select
    if (serviceType === 'NABL') {
      //NABL
      this.water_test_report.patchValue({ water_test_processing_amount: 2966 });
    }
    if (serviceType === 'Non NABL') {
      //NON NABL
      this.water_test_report.patchValue({ water_test_processing_amount: 2119 });
    }
  }
  waterProcessAmount($event:any){
    const waterTestWithGst: number = Math.round(Number($event.target.value)* 1.18);
    this.water_test_report.patchValue({ water_test_total: waterTestWithGst }) //patch total to total amount
    this.watertestTotalAmount(waterTestWithGst);
  }

  patchValueCommingAsModal(data: any): void {
    this.fetchExistingUser(data)
  }

 
}
