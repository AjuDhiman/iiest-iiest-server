import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { waterTestFee, clientType, paymentMode, licenceType } from '../../utils/config';
import { RegisterService } from '../../services/register.service';
import { GetdataService } from '../../services/getdata.service';
import { ToastrService } from 'ngx-toastr';
import { MultiSelectComponent } from 'src/app/shared/multi-select/multi-select.component';

@Component({
  selector: 'app-fbo',
  templateUrl: './fbo.component.html',
  styleUrls: ['./fbo.component.scss']
})

export class FboComponent implements OnInit {
  isQrCode = false;
  userName: string = '';
  userData: any;
  minValue: number = 1;
  loggedUser: any;
  objId: string;
  editedData: any;
  parsedUserData: any;
  submitted = false;
  waterTestFee = waterTestFee;
  clientType = clientType;
  paymentMode = paymentMode;
  licenceType = licenceType;
  isDisabled: boolean = true;
  fboGeneralData: any;
  productList: string[] = [];
  productName: any;
  processAmnt: any;
  processAmnts: any = {};
  serviceName: any;
  servicesNames: any = {};
  addFbo: any;
  isFostac: boolean = false;
  isFoscos: boolean = false;
  recipientORshop: string = 'Recipients';
  isEditMode: boolean = false;
  formType: string = "Registration";
  isReadOnly: boolean = false;
  resetMultiDrop: boolean;
  need_gst_number: boolean = false;
  isBusinessTypeB2B: boolean = false;
  selected: any; // related to multi drop-down, remove it if are removing multi-dropdown component
  fostac_processAmnt: any;
  foscos_processAmnt: any;
  @ViewChild(MultiSelectComponent) multiSelect !: MultiSelectComponent;
  foscosFixedCharge: number = 0;


  fostac_training: FormGroup = new FormGroup({
    fostac_processing_amount: new FormControl(''),
    fostac_service_name: new FormControl(''),
    fostac_client_type: new FormControl(''),
    recipient_no: new FormControl(''),
    fostac_total: new FormControl('')
  });

  foscos_training: FormGroup = new FormGroup({
    foscos_processing_amount: new FormControl(''),
    foscos_service_name: new FormControl(''),
    foscos_client_type: new FormControl(''),
    shops_no: new FormControl(''),
    water_test_fee: new FormControl(''),
    license_category: new FormControl(''),
    license_duration: new FormControl(''),
    foscos_total: new FormControl(''),
  });

  fboForm: FormGroup = new FormGroup({
    fbo_name: new FormControl(''),
    owner_name: new FormControl(''),
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
    // b2c: new FormControl(),
    // b2b:new FormControl(),
    payment_mode: new FormControl(''),
    createdBy: new FormControl(''),
    grand_total: new FormControl('')
  })

  constructor(
    private formBuilder: FormBuilder,
    private _getFboGeneralData: GetdataService,
    private _registerService: RegisterService,
    private _toastrService: ToastrService
  ) {
    this.getFboGeneralData();
  }
  ngOnInit(): void {
    console.log(this.fboForm.get('foscos_service_name')?.value());
    this.userData = this._registerService.LoggedInUserData();
    this.parsedUserData = JSON.parse(this.userData)
    this.userName = this.parsedUserData.employee_name;

    this.fostac_training = this.formBuilder.group({
      fostac_processing_amount: ['', Validators.required],
      fostac_service_name: ['', Validators.required],
      fostac_client_type: ['', Validators.required],
      recipient_no: ['', Validators.required],
      fostac_total: ['', Validators.required]
    })

    this.foscos_training = this.formBuilder.group({
      foscos_processing_amount: ['', Validators.required],
      foscos_service_name: ['', Validators.required],
      foscos_client_type: ['', Validators.required],
      shops_no: ['', Validators.required],
      water_test_fee: ['', Validators.required],
      license_category: ['', Validators.required],
      license_duration: ['', Validators.required],
      foscos_total: ['', Validators.required]
    }),

      this.fboForm = this.formBuilder.group(
        {
          fbo_name: ['', Validators.required],
          owner_name: ['', Validators.required],
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
          state: ['', Validators.required],
          district: ['', Validators.required],
          address: ['', Validators.required],
          village: [''],
          tehsil: [''],
          pincode: [''],
          product_name: [[], this.arrayNotEmptyValidator],
          business_type: ['b2c', Validators.required],
          payment_mode: ['', Validators.required],
          createdBy: ['', Validators.required],
          grand_total: ['', Validators.required],
        });

    this.fboForm.patchValue({ createdBy: `${this.userName}(${this.parsedUserData.employee_id})` })
  }
  get fbo(): { [key: string]: AbstractControl } {
    return this.fboForm.controls;
  }

  get fostac(): FormGroup {
    return this.fboForm.get('fostac_training') as FormGroup;
  }

  get foscos(): FormGroup {
    return this.fboForm.get('foscos_training') as FormGroup;
  }


  setRequired() {
    return [Validators.required];
  }
  //Form Submit Method
  onSubmit() {
    this.loggedUser = this._registerService.LoggedInUserData();
    this.objId = JSON.parse(this.loggedUser)._id;
    if (this.fbo['product_name'].errors) {
      this.multiSelect.invalid = true;
    } else {
      this.multiSelect.invalid = false;
    }
    this.submitted = true;
    console.log(this.fboForm);
    if (this.fboForm.invalid) {
      return;
    }

    if (this.isEditMode) {
      this.editedData = this.fboForm.value;
      this._registerService.updateFbo(this.objId, this.editedData, `${this.userName}(${this.parsedUserData.employee_id})`).subscribe({
        next: (res) => {
          if (res.success) {
            this._toastrService.success('Record edited successfully', res.message);
            this.backToRegister();
          }
        }
      });
    } else {
      this.addFbo = this.fboForm.value;
      if (this.addFbo.payment_mode === 'Pay Page') {
        this._registerService.fboPayment(this.objId, this.addFbo).subscribe({
          next: (res) => {
            window.location.href = res.message;
          },
          error: (err) => {
            let errorObj = err.error;
            if (errorObj.userError) {
              this._registerService.signout();
            } else if (errorObj.contactErr) {
              this._toastrService.error('Message Error!', errorObj.contactErr);
            } else if (errorObj.emailErr) {
              this._toastrService.error('Message Error!', errorObj.emailErr);
            }
          }
        })
      } else {
        console.log(this.addFbo)
        this._registerService.addFbo(this.objId, this.addFbo).subscribe({
          next: (res) => {
            if (res.success) {
              this._toastrService.success('Record edited successfully', res.message);
              this.backToRegister();
            }
          },
          error: (err) => {
            let errorObj = err.error;
            if (errorObj.userError) {
              this._registerService.signout();
            } else if (errorObj.contactErr) {
              this._toastrService.error('Message Error!', errorObj.contactErr);
            } else if (errorObj.emailErr) {
              this._toastrService.error('Message Error!', errorObj.emailErr);
            }
          }
        })
      }
    }
  }


  //Get Fbo General Data
  getFboGeneralData() {
    this._getFboGeneralData.getFboGeneralData().subscribe({
      next: (res) => {
        this.fboGeneralData = res.product_name;
        this.fboGeneralData = Object.entries(this.fboGeneralData).map(([key, value]) => ({ key, value }));
        console.log(this.fboGeneralData);
        this.productList = Object.keys(res.product_name);
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
  }

  //Reset the form
  onReset(): void {
    this.submitted = false;
    this.fboForm.reset();
    this.need_gst_number = false; // this will hide gst number on form reset 
    this.isFostac = false;
    this.isFoscos = false;
    this.fboForm.removeControl('gst_number')// this will remove gst number form control on form reset 
    this.fboForm.removeControl('fostac_training');
    this.fboForm.removeControl('foscos_training');
    this.resetMultiDrop = true;
    this.multiSelect.onReset();
  }

  //Get Product List
  getProduct(event: any) {
    this.clearFunc();
    this.isQrCode = false;
    if (event.length > 0) {
      this.multiSelect.invalid = false;
    }
    this.productName = event;
    this.fboForm.patchValue({ product_name: this.productName })
    var filtered = this.fboGeneralData.filter((a: any) => this.productName.find((item: any) => item === a.key))
    console.log(filtered);

    this.isFostac = false;
    this.isFoscos = false;
    if (this.productName.find((item: any) => item === 'Fostac Training')) {
      this.isFostac = true;
      this.fboForm.addControl('fostac_training', this.fostac_training);
    }
    else {
      this.fboForm.removeControl('fostac_training');
    }
    if (this.productName.find((item: any) => item === 'Foscos Training')) {
      this.recipientORshop = 'Shops';
      this.isFoscos = true;
      this.fboForm.addControl('foscos_training', this.foscos_training);
    }
    else {
      this.fboForm.removeControl('foscos_training');
    }

    if (this.productName.length == 0) {
      if (this.submitted === true) {
        this.multiSelect.invalid = true
      }
    }
    this.getGrandTotalAmount();
  }
  //Processing Amount + GST
  processAmount(event: any) {

    let group = event.target.getAttribute('group');

    if (group === 'fostac') {
      if (this.fboForm.value.fostac_training.fostac_client_type != '' || this.fboForm.value.fostac_training.recipient_no != '' || this.fboForm.value.fostac_training.fostac_processing_amount != '') {
        var GST_amount = (Number(this.fboForm.value.fostac_training.fostac_processing_amount)) * 18 / 100;
        var total_amount = (Number(GST_amount) + Number(this.fboForm.value.fostac_training.fostac_processing_amount)) * this.fboForm.value.fostac_training.recipient_no;
        console.log(this.fboForm.value.fostac_training.recipient_no);
        this.fboForm.get('fostac_training')?.patchValue({ 'fostac_total': total_amount });
        this.fboForm.patchValue({ 'grand_total': total_amount });
      }
    }
    if (group === 'foscos') {
      let licenceCat = this.fboForm.value.foscos_training.license_category;
      let licenceDur = this.fboForm.value.foscos_training.license_duration;
      let serviceType = this.fboForm.value.foscos_training.foscos_service_name;

      

      if (licenceDur != '' || this.fboForm.value.foscos_training.foscos_client_type != '' || this.fboForm.value.foscos_training.shops_no != '' || this.fboForm.value.foscos_training.foscos_processing_amount != '') {
        var GST_amount = (Number(this.fboForm.value.foscos_training.foscos_processing_amount)) * 18 / 100;
        var total_amount = (Number(GST_amount) + Number(this.fboForm.value.foscos_training.foscos_processing_amount)) * this.fboForm.value.foscos_training.shops_no;
        if (Number(this.fboForm.value.foscos_training.water_test_fee)) {
          total_amount = total_amount + Number(this.fboForm.value.foscos_training.water_test_fee);
        }
        
         
        this.fboForm.get('foscos_training')?.patchValue({ 'foscos_total': total_amount });
        this.fboForm.patchValue({ 'grand_total': total_amount });
      }
    }
    this.getGrandTotalAmount();
  }
  //Water test Ammount + GST
  waterTestAdd(event: any) {
    if (event.target.value != 0) {
      var processAmnt = (Number(this.fboForm.value.foscos_training.foscos_processing_amount * this.fboForm.value.foscos_training.shops_no));
      var GST_amount = processAmnt * 18 / 100;
      var total_amount = (Number(GST_amount) + processAmnt) + Number(this.fboForm.value.foscos_training.water_test_fee);
      this.fboForm.get('foscos_training')?.patchValue({ 'foscos_total': total_amount });
      this.fboForm.patchValue({ 'grand_total': total_amount });
    }
    else {
      var processAmnt = (Number(this.fboForm.value.foscos_training.foscos_processing_amount * this.fboForm.value.foscos_training.shops_no));
      var GST_amount = processAmnt * 18 / 100;
      var total_amount = (Number(GST_amount) + processAmnt) + Number(this.fboForm.value.foscos_training.water_test_fee);
      this.fboForm.get('foscos_training')?.patchValue({ 'foscos_total': total_amount });
      this.fboForm.patchValue({ 'grand_total': total_amount });
    }
    this.getGrandTotalAmount();
  }

  //Client Type + GST
  clienttypeFun(event: any) {
    let group = event.target.getAttribute('group');

    if (event.target.value === 'General Client') {
      this.isReadOnly = true;
      var total_amount = this.GSTandTotalAmnt(1, group)
      if (group === 'fostac') {
        this.fboForm.get('fostac_training')?.patchValue({ 'recipient_no': 1 });
        this.GSTandTotalAmnt(1, group);
        this.fboForm.get('fostac_training')?.patchValue({ 'fostac_total': total_amount });
        this.fboForm.patchValue({ 'grand_total': total_amount });

      }
      if (group === 'foscos') {
        this.fboForm.get('foscos_training')?.patchValue({ 'shops_no': 1 });
        let serviceType = this.fboForm.value.foscos_training.foscos_service_name;
        let licenceCat = this.fboForm.value.foscos_training.license_category;
        let licenceDur = this.fboForm.value.foscos_training.license_duration;
        console.log(serviceType, licenceCat, licenceDur);

        if (this.fboForm.value.foscos_training.water_test_fee) {
          total_amount = total_amount + Number(this.fboForm.value.foscos_training.water_test_fee);
        }
        this.fboForm.get('foscos_training')?.patchValue({ 'foscos_total': total_amount });
        this.fboForm.patchValue({ 'grand_total': total_amount });
      }

      this.getGrandTotalAmount();
    }

    if (event.target.value === 'Corporate Client') {
      this.minValue = 2;
      var val = 2;
      if (group === 'fostac') {
        this.fboForm.get('fostac_training')?.patchValue({ 'recipient_no': val });
      }
      if (group === 'foscos') {
        this.fboForm.get('foscos_training')?.patchValue({ 'shops_no': val });
      }
      this.recipientCount(val, group);
    }
    this.getGrandTotalAmount();
  }
  backToRegister() {
    this.submitted = false;
    this.isEditMode = false;
    this.fboForm.reset();
  }
  isEditRecord(param: any) {
    console.log(param.Record);
    this.isEditMode = param.isEditMode;
    const record = param.Record;
    this.objId = record._id
    console.log(record);
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

  //Recipient Count based Total Amount calulation
  recipientCount(val: any, group: string) {
    this.isReadOnly = false;
    console.log(val);
    if (typeof (val) == 'number') {
      var total_amount = this.GSTandTotalAmnt(val, group);
      console.log(total_amount)
      if (group === 'fostac') {
        this.fboForm.get('fostac_training')?.patchValue({ 'fostac_total': total_amount });
        this.fboForm.patchValue({ 'grand_total': total_amount });
      }
      if (group === 'foscos') {
        if (this.fboForm.value.foscos_training.water_test_fee) {
          //let water_test_gst = Number(this.fboForm.value.foscos_training.water_test_fee) * 18 / 100;
          total_amount = total_amount + Number(this.fboForm.value.foscos_training.water_test_fee)
        }
        console.log(total_amount);
        this.fboForm.get('foscos_training')?.patchValue({ 'foscos_total': total_amount });
        this.fboForm.patchValue({ 'grand_total': total_amount });
      }
      this.getGrandTotalAmount();
    } else {
      var recipient = val.target.value;
      let group1 = val.target.getAttribute('group');
      var total_amount = this.GSTandTotalAmnt(recipient, group1)
      if (group1 === 'fostac') {
        this.fboForm.get('fostac_training')?.patchValue({ 'fostac_total': total_amount });
        this.fboForm.patchValue({ 'grand_total': total_amount });
      }
      if (group1 === 'foscos') {
        if (this.fboForm.value.foscos_training.water_test_fee) {
          total_amount = total_amount + Number(this.fboForm.value.foscos_training.water_test_fee)
        }
        this.fboForm.get('foscos_training')?.patchValue({ 'foscos_total': total_amount });
        this.fboForm.patchValue({ 'grand_total': total_amount });
      }
      this.getGrandTotalAmount();
    }
    this.getGrandTotalAmount();
  }

  //GST Calculation and Add to Total Amount
  GSTandTotalAmnt(param: any, group: string) {
    console.log(param, group)

    if (group === 'fostac') {
      this.fostac_processAmnt = this.fboForm.value?.fostac_training?.fostac_processing_amount * param
      var GST_amount = this.fostac_processAmnt * 18 / 100;
      var total_amount = Number(GST_amount) + this.fostac_processAmnt;
    }
    if (group === 'foscos') {
      this.foscos_processAmnt = this.fboForm.value?.foscos_training?.foscos_processing_amount * param
      var GST_amount = this.foscos_processAmnt * 18 / 100;
      var total_amount = Number(GST_amount) + this.foscos_processAmnt;
    }
    console.log(total_amount);
    return total_amount;
  }

  ModeofPayment(event: any) {
    if (this.fboForm.value.total_amount !== '' && event.target.value == 'Pay Page') {
      this.isQrCode = true;
    } else {
      this.isQrCode = false;
    }
  }

  //On Product Change clear these inputs
  clearFunc() {
    this.fboForm.patchValue({ 'processing_amount': '' })
    this.fboForm.patchValue({ 'client_type': '' })
    this.fboForm.patchValue({ 'recipient_no': '' })
    this.fboForm.patchValue({ 'total_amount': '' })
    this.fboForm.patchValue({ 'service_name': '' })
  }

  getGrandTotalAmount() {
    let grand_total_amount = (this.fboForm.value?.fostac_training?.fostac_total || 0) + (this.fboForm.value?.foscos_training?.foscos_total || 0);
    this.fboForm.patchValue({ 'grand_total': grand_total_amount });
  }

  //This function is a custom validator form validating that a form control has a empty array or not
  arrayNotEmptyValidator(control: FormControl) {
    const value = control.value;
    return Array.isArray(value) && value.length > 0 ? null : { arrayNotEmpty: true };
  }

  closeDropDown() {
    this.multiSelect.isdropped = false;
  }

  // This function conditionally add gst number filled in fbo form (condition: If checkox B2B is true in Business type field)
  onBusinessTypeChange($event: any) {
    let businessType: string = $event.target.value
    console.log(businessType);
    if (businessType) {
      if (businessType === 'b2b') { // If we have business type b2b then we want to add gst number form control
        this.need_gst_number = true;
        this.fboForm.addControl('gst_number', new FormControl('', Validators.required));
      }
      else if (businessType === 'b2c') { // If we have business type b2b then we want to remove gst number form control
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

  onFoscosServiceName($event: any){
    let foscosSection: any = this.fboForm.get('foscos_training')?.value;
    if($event.target.value && foscosSection.license_category){
      this.foscosProcessAmountChange($event.target.value, foscosSection.license_category)
    }
    if($event.target.value && foscosSection.license_category && foscosSection.license_duration){
      this.foscosProcessAmountChange($event.target.value, foscosSection.license_category)
      this.fixedChargeFunction($event.target.value, foscosSection.license_category, foscosSection.license_duration)
      this.foscosTotalAmountCal()
    }
  }

  onFoscosLicenceCategory($event: any){
    let foscosSection: any = this.fboForm.get('foscos_training')?.value;
    if(foscosSection.foscos_service_name && $event.target.value){
      this.foscosProcessAmountChange(foscosSection.foscos_service_name, $event.target.value)
    }
    if(foscosSection.foscos_service_name && $event.target.value && foscosSection.license_duration){
      this.foscosProcessAmountChange(foscosSection.foscos_processing_amount, $event.target.value)
      this.fixedChargeFunction(foscosSection.foscos_service_name, $event.target.value, foscosSection.license_duration)
      this.foscosTotalAmountCal()
    }
  }
  foscosProcessAmountChange(serviceName: string, licenceCategory: string){
    console.log(serviceName, licenceCategory);
    if(serviceName === 'State'){
      if(licenceCategory === 'New Licence'){
        this.fboForm.get('foscos_training')?.patchValue({'foscos_processing_amount': 3000})
      }else if(licenceCategory === 'Renewal'){
        this.fboForm.get('foscos_training')?.patchValue({'foscos_processing_amount': 2000})
      }else if(licenceCategory === 'Modified'){
        this.fboForm.get('foscos_training')?.patchValue({'foscos_processing_amount': 2500})
      }
    }else if(serviceName === 'Registration'){
      if(licenceCategory === 'New Licence'){
        this.fboForm.get('foscos_training')?.patchValue({'foscos_processing_amount': 1700})
      }else if(licenceCategory === 'Renewal'){
        this.fboForm.get('foscos_training')?.patchValue({'foscos_processing_amount': 1300})
      }else if(licenceCategory === 'Modified'){
        this.fboForm.get('foscos_training')?.patchValue({'foscos_processing_amount': 1500})
      }
    }
  }

  fixedChargeFunction(serviceName: string, licenceCategory: string, durationVal: number){
    if(serviceName === 'Registration'){
      if(licenceCategory === 'New Licence' || licenceCategory === 'Renewal'){
        this.foscosFixedCharge = 100 * durationVal
      }else if(licenceCategory === 'Modified'){
        this.foscosFixedCharge = 100
      }
    }else if(serviceName === 'State'){
      if(licenceCategory === 'New Licence' || licenceCategory === 'Renewal'){
        this.foscosFixedCharge = 2000 * durationVal
      }else if(licenceCategory === 'Modified'){
        this.foscosFixedCharge = 1000
      }
    }
  }

  onFoscosDuration($event: any){
    let foscosSection: any = this.fboForm.get('foscos_training')?.value;
    if(foscosSection.foscos_service_name && foscosSection.license_category && $event.target.value){
      this.fixedChargeFunction(foscosSection.foscos_service_name, foscosSection.license_category, $event.target.value)
      if(foscosSection.foscos_service_name && foscosSection.license_category && $event.target.value && foscosSection.foscos_client_type){
        this.fixedChargeFunction(foscosSection.foscos_service_name, foscosSection.license_category, $event.target.value)
        this.foscosTotalAmountCal()
      }
    }
  }

  onFoscosClientType($event: any){

    let foscosSection: any = this.fboForm.get('foscos_training')?.value;
    
    if(foscosSection.foscos_service_name && foscosSection.license_category && $event.target.value && foscosSection.foscos_processing_amount && foscosSection.license_duration){
      if($event.target.value === 'General Client'){
        this.isReadOnly = true;
        this.fboForm.get('foscos_training')?.patchValue({'shops_no': 1})
        this.foscosTotalAmountCal()
      }else if($event.target.value === 'Corporate Client'){
        this.isReadOnly = false;
        this.fboForm.get('foscos_training')?.patchValue({'shops_no': 2})
        this.foscosTotalAmountCal()
      }
    }
    if(foscosSection.foscos_service_name && foscosSection.license_category && foscosSection.license_duration && $event.target.value){
      this.foscosTotalAmountCal()
    }
  }

  foscosTotalAmountCal(){
    let foscosSection:  any = this.fboForm.get('foscos_training')?.value;
    this.fboForm.get('foscos_training')?.patchValue({'shops_no': foscosSection.shops_no})
    let totalProcessingAmount = foscosSection.foscos_processing_amount * foscosSection.shops_no;
    let GST_amount = totalProcessingAmount * 18 / 100;
    let total_amount: number = Number(GST_amount) + totalProcessingAmount;
    console.log(total_amount)
    this.fboForm.get('foscos_training')?.patchValue({'foscos_total': total_amount + this.foscosFixedCharge})
  }

}
