import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { FostacComponent } from '../fostac/fostac.component';
import { FoscosComponent } from '../foscos/foscos.component';
import { MultiSelectComponent } from 'src/app/shared/multi-select/multi-select.component';
import { FbolistComponent } from '../../fbolist/fbolist.component';
import { clientType, hraProcessingAmnt, licenceType, panIndiaAllowedEmpIds, paymentMode, processAmnt, serviceNames, stateName, waterTestFee } from 'src/app/utils/config';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';
import { pincodeData } from 'src/app/utils/registerinterface';


@Component({
  selector: 'app-fbonew',
  templateUrl: './fbonew.component.html',
  styleUrls: ['./fbonew.component.scss']
})


export class FbonewComponent implements OnInit {
  @ViewChild(FostacComponent, { static: false }) fostacChildComponent: FostacComponent;
  @ViewChild(FoscosComponent, { static: false }) foscosChildComponent: FoscosComponent;
  isQrCode = false;
  userName: string = '';
  userData: any;
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
  isEditMode: boolean = false;
  formType: string = "Registration";
  isReadOnly: boolean = false;
  need_gst_number: boolean = false;
  isBusinessTypeB2B: boolean = false;
  selected: any; // related to multi drop-down, remove it if are removing multi-dropdown component
  fostac_processAmnt: number = 0;
  foscos_processAmnt: number = 0;
  hra_processAmnt: number = 0;
  maxSelectedItems: number = 2;
  @ViewChild(MultiSelectComponent) multiSelect !: MultiSelectComponent;
  isExisting: boolean;
  isExistingFbo: boolean;
  isExistingBo: boolean;
  existingUserForm: FormGroup;
  existingUserFboForm: FormGroup;
  existingUserBoForm: FormGroup;
  fboFieldName: string = "FBO Name";
  fboPlaceholder: string = "FBO Name";
  formName: string = "BO"
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

  //New variables by vansh on 16-01-2023
  existingFbos: Object[];

  loading: boolean = false;
  // new varable by chandan
  existingbos: Object[];

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
    foscos_service_name: new FormControl(''),
    // foscos_client_type: new FormControl(''),
    // shops_no: new FormControl(''),
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
    // hra_client_type: new FormControl(''),
    // shops_no: new FormControl(''),
    hra_total: new FormControl('')
  })

  fboForm: FormGroup = new FormGroup({
    boInfo: new FormControl(''),
    fbo_name: new FormControl(''),
    owner_name: new FormControl(''),
    business_entity: new FormControl(''),
    business_category: new FormControl(''),// form control added by chandan for business_Owner
    business_ownership_type: new FormControl(''), // form control added for business_Owner
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
  })



  constructor(
    private formBuilder: FormBuilder,
    private _getFboGeneralData: GetdataService,
    private _registerService: RegisterService,
    private _toastrService: ToastrService,
    private existingFrom: FormBuilder,
    private existingFboFrom: FormBuilder,
    private existingBoFrom: FormBuilder

  ) {
    this.getFboGeneralData();
  }
  ngOnInit(): void {
    this.userData = this._registerService.LoggedInUserData();
    this.parsedUserData = JSON.parse(this.userData)
    this.userName = this.parsedUserData.employee_name;
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
      foscos_service_name: ['', Validators.required],
      // foscos_client_type: ['', Validators.required],
      // shops_no: ['' , Validators.required],
      foscos_client_type: ['General Client', Validators.required],
      shops_no: [1 , Validators.required],
      water_test_fee: ['', Validators.required],
      license_category: ['', Validators.required],
      license_duration: ['', Validators.required],
      foscos_total: ['', Validators.required]
    });

    this.hygiene_audit = this.formBuilder.group({
      hra_service_name: [serviceNames['HRA'][0], Validators.required],
      hra_processing_amount: [hraProcessingAmnt, Validators.required],
      // hra_client_type: ['', Validators.required],
      // shops_no: ['', Validators.required],
      hra_client_type: ['General Client', Validators.required],
      shops_no: [1, Validators.required],
      hra_total: ['', Validators.required]
    });



    this.existingUserFboForm = this.existingFboFrom.group({
      existingUserFbo: [''],
      searchUser: ['', Validators.required]
    })

    this.existingUserBoForm = this.existingBoFrom.group({
      existingUserBo: [''],
      searchUser: ['', Validators.required]
    })

    // this.existingUserForm = this.existingFrom.group({
    //   existingUser: [''],
    //   searchUser: ['', Validators.required]
    // })

    let allocated_state:string = '';

    if(!this.isPanIndiaAllowed) { //we will patch allowed state to state field of fbo form in case of only a particulat area allowd to a employee
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
    if(!this.isPanIndiaAllowed) {
      this.getAllocatedArea();
    }
    this.getboGeneralData();
  }

  get fbo(): { [key: string]: AbstractControl } {
    return this.fboForm.controls;
  }

  setRequired() {
    return [Validators.required];
  }

  //  existingUserFbo($event: any) {
  //    this.isExistingFbo = $event.target.checked
  //   }

  //   existingUserBo($event: any) {
  //     this.isExistingBo = $event.target.checked
  //    }


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
    this.isFoscos = false;
    this.isFostac = false;
    this.isHygiene = false;
    this.fbo['district'].setValue('');
    this.fbo['pincode'].setValue('');
    this.fbo['payment_mode'].setValue('');
    if(!this.isPanIndiaAllowed) {
      this.fbo['state'].setValue(this.allocated_state);
    } else {
      this.fbo['state'].setValue('');
    }
    this.fostac_training.patchValue({ fostac_client_type: '' });
    // this.foscos_training.patchValue({ foscos_client_type: '' });
    // this.hygiene_audit.patchValue({ hra_client_type: '' });
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
    console.log(this.existingbos)
    this.searchSuggestionsOnBo = this.existingbos.filter((obj: any) => regex.test(obj.owner_name) || regex.test(obj.customer_id));
    console.log(this.searchSuggestionsOnBo);
  }


  fetchExistingUser(fboObj: any) {
    this.isFboSelected = true;
    this.existingFboId = fboObj.customer_id
    this.searchElemFBO.nativeElement.value = ''
    this.isSearchEmptyFBO = true;
    this.selectedFbo = fboObj;
    this.fbo['fbo_name'].setValue(fboObj.fbo_name);
    this.fbo['owner_name'].setValue(fboObj.owner_name);
    this.fbo['owner_contact'].setValue(fboObj.owner_contact);
    this.fbo['business_entity'].setValue(fboObj.boInfo.business_entity);
    this.fbo['business_category'].setValue(fboObj.boInfo.business_category);
    this.fbo['business_ownership_type'].setValue(fboObj.boInfo.business_ownership_type);
    this.fbo['email'].setValue(fboObj.email);
    this.fbo['state'].setValue(fboObj.state);
    this.loading = true;
    this.allocated_district = [];
    this.allocated_pincodes = [];
    this.fbo['district'].setValue('');
    this.fbo['pincode'].setValue('');
    if(fboObj.pincode){
      this._getFboGeneralData.getPincodesData(fboObj.state).subscribe({
        next: res => {
          this.allocated_district = res.map((item: any) => item.District);
          console.log(fboObj.district)
          this.fbo['district'].setValue(fboObj.district);
          if(fboObj.district){
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
    this.loading= false;
  
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


  fetchExistingBo(fboObj: any) {

    this.existingFboId = fboObj.customer_id
    this.searchElemBO.nativeElement.value = ''
    this.isSearchEmptyBO = true;
    console.log(fboObj);
    this.fbo['owner_name'].setValue(fboObj.owner_name);
    this.fbo['business_entity'].setValue(fboObj.business_entity);
    this.fbo['business_category'].setValue(fboObj.business_category);
    this.fbo['business_ownership_type'].setValue(fboObj.business_ownership_type);
    this.fbo['owner_contact'].setValue(fboObj.contact_no);
    this.fbo['email'].setValue(fboObj.email);
    this.fbo['boInfo'].setValue(fboObj._id);
  }


  //Form Submit Method
  onSubmit() {

    this.loggedUser = this._registerService.LoggedInUserData();
    this.objId = JSON.parse(this.loggedUser)._id;
    this.submitted = true;
    console.log(this.fboForm.value);
    if (this.fboForm.invalid) {
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
          this._registerService.fboPayment(this.objId, this.addFbo, this.foscosGST, this.fostacGST, this.hygieneGST, this.foscosFixedCharges).subscribe({
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
          this._registerService.addFbo(this.objId, this.addFbo, this.foscosGST, this.fostacGST, this.hygieneGST, this.foscosFixedCharges).subscribe({
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
        }
      } else {
        if (this.addFbo.payment_mode === 'Cash') {
          this._registerService.existingFboSale(this.objId, this.addFbo, this.foscosGST, this.fostacGST, this.hygieneGST, this.foscosFixedCharges, this.existingFboId).subscribe({
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
        } else if (this.addFbo.payment_mode === 'Pay Page') {
          this._registerService.existingFboPayPage(this.objId, this.addFbo, this.foscosGST, this.fostacGST, this.hygieneGST, this.foscosFixedCharges, this.existingFboId).subscribe({
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
        this.fboGeneralData = Object.entries(this.fboGeneralData).map(([key, value]) => ({ key, value }))
          .sort((item: any) => {
            if (item.value.enabled) {
              return -1;
            }
            else {
              return 1;
            }
          });
        console.log(this.fboGeneralData);
        this.productList = this.fboGeneralData.map((item: any) => item.key);
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
        console.log(res);
        this.existingFbos = res.fboList;
      },
      error: (err) => {
      }
    })
  }

  //Get bo General Data
  getboGeneralData() {

    this._getFboGeneralData.getbolist().subscribe({
      next: (res) => {
        this.existingbos = res.boList;
        console.log(this.existingbos);
      },
      error: (err) => {
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
    this.fboForm.removeControl('gst_number')// this will remove gst number form control on form reset 
    this.fboForm.removeControl('fostac_training');
    this.fboForm.removeControl('foscos_training');
    this.fboForm.removeControl('hygiene_audit');
    this.multiSelect.onReset();
    this.isHygiene = false;
    this.isFoscos = false;
    this.isFostac = false;
  }

  getSelectedProduct($event: any) {
    console.log($event);

    this.productName = $event;
    this.fboForm.patchValue({ product_name: this.productName })
    var filtered = this.fboGeneralData.filter((a: any) => this.productName.find((item: any) => item === a.key));

    this.isFostac = false;
    this.isFoscos = false;
    this.isHygiene = false;
    if (this.productName.includes('Fostac')) {
      this.isFostac = true;
      this.fboForm.addControl('fostac_training', this.fostac_training);
    }
    else {
      this.fboForm.removeControl('fostac_training');
      //next line will remove the fostac amount from grand total in case of deselection of fostac in products
      this.fostacTotalAmount(0);
      this.resetFostacForm();
    }
    if (this.productName.includes('Foscos')) {
      this.isFoscos = true;
      this.fboForm.addControl('foscos_training', this.foscos_training);
      // this.fboForm.get('village')?.setValidators([Validators.required]);
      // this.fboForm.get('village')?.clearValidators();
      // this.fboForm.get('village')?.updateValueAndValidity();
      // this.fboForm.get('tehsil')?.clearValidators();
      // this.fboForm.get('tehsil')?.updateValueAndValidity();
    }
    else {
      this.fboForm.removeControl('foscos_training');
      // this.fboForm.get('village')?.updateValueAndValidity();
      // this.fboForm.get('tehsil')?.updateValueAndValidity();
      //next line will remove the foscos amount from grand total in case of deselection of foscos in products
      this.foscosTotalAmount(0);
      this.resetFoscosForm();
    }
    if (this.productName.includes('HRA')) {
      this.isHygiene = true;
      this.fboForm.addControl('hygiene_audit', this.hygiene_audit);
    }
    else {
      this.fboForm.removeControl('hygiene_audit');
      //next line will remove the HRA amount from grand total in case of deselection of HRA in products
      this.hygieneTotalAmount(0);
      this.resetHRAForm();
    }

  }

  backToRegister() {
    location.reload();
    // this.submitted = false;
    // this.isEditMode = false;
    // this.isFoscos = false;
    // this.isFostac = false;
    // this.isHygiene = false;
    // this.multiSelect.onReset();
    // this.fboForm.reset();
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
    if (this.fboForm.value.total_amount !== '' && event.target.value == 'Pay Page') {
      this.isQrCode = true;
    } else {
      this.isQrCode = false;
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
    // if (val === 'HRA') {
    //   this.hraChildComponent.resetForms();
    // }
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
    this.fostac_processAmnt = TotalAmnt;
    this.fboForm.patchValue({ 'grand_total': TotalAmnt + this.foscos_processAmnt + this.hra_processAmnt });
  }
  foscosTotalAmount(TotalAmnt: any) {
    this.foscos_processAmnt = TotalAmnt;
    this.fboForm.patchValue({ 'grand_total': TotalAmnt + this.fostac_processAmnt + this.hra_processAmnt });
  }
  hygieneTotalAmount(TotalAmnt: any) {
    this.hra_processAmnt = TotalAmnt;
    this.fboForm.patchValue({ 'grand_total': TotalAmnt + this.fostac_processAmnt + this.foscos_processAmnt });
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
          console.log(data.district);
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
    this.allocated_district=[];
    this.allocated_pincodes=[];
    this.fbo['district'].setValue('');
    this.fbo['pincode'].setValue('');
    this.loading=true;
    this._getFboGeneralData.getPincodesData(state).subscribe({
      next: (res) => {
        // console.log(res);
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
    if(!this.isPanIndiaAllowed) {
      return
    } 
    this.allocated_pincodes = [];
    this.fbo['pincode'].setValue('');
    this.loading = true;
    let pincodeArr: any =[];
    this.districtAndPincodes.forEach((obj:any) => {
      console.log(this.allocated_pincodes)
      if(obj.District == this.fbo['district'].value) {
        console.log(11);
        pincodeArr.push(obj.Pincode);
      }
    });

    pincodeArr = new Set(pincodeArr);
    this.allocated_pincodes = [...pincodeArr];
    this.loading = false;
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
    // this.foscos_training.patchValue({ foscos_client_type: '' });
    // this.foscos_training.patchValue({ shops_no: '' });
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
    // this.hygiene_audit.patchValue({ shops_no: '' });
    // this.hygiene_audit.patchValue({ hra_client_type: '' });
    this.hygiene_audit.patchValue({ hra_total: '' });
  }

  checkEmpId() { //this methord checks and allow to give Pan India location for a particular employee
    this.userEmployeeId = this.parsedUserData.employee_id;
    if(panIndiaAllowedEmpIds.includes(this.userEmployeeId)) {
      this.isPanIndiaAllowed = true;
      // this.fboForm.patchValue({state: ""});
      this.allocated_state = stateName;
    }
  }

  closeMultiSelect() {
    this.multiSelect.isdropped = false;
  }
}
