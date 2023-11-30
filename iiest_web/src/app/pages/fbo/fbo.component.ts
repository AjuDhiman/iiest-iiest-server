import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { waterTestFee, clientType, paymentMode, licenceType } from '../../utils/config';
import { RegisterService } from '../../services/register.service';
import { GetdataService } from '../../services/getdata.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';


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
  serviceName: any;
  addFbo: any;
  isFoscos: boolean = false;
  recipientORshop: string = 'Recipients';
  isEditMode: boolean = false;
  formType: string = "Registration";
  isReadOnly: boolean = false;

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
    product_name: new FormControl(''),
    processing_amount: new FormControl(''),
    service_name: new FormControl(''),
    client_type: new FormControl(''),
    recipient_no: new FormControl(''),
    water_test_fee: new FormControl(''),
    payment_mode: new FormControl(''),
    createdBy: new FormControl(''),
    license_category: new FormControl(''),
    license_duration: new FormControl(''),
    total_amount: new FormControl('')
  })


  constructor(
    private formBuilder: FormBuilder,
    private _getFboGeneralData: GetdataService,
    private _registerService: RegisterService,
    private _toastrService: ToastrService,
    private router: Router
  ) {
    this.getFboGeneralData();
  }
  ngOnInit(): void {

    this.userData = this._registerService.LoggedInUserData();
    this.parsedUserData = JSON.parse(this.userData)
    this.userName = this.parsedUserData.employee_name;

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
        product_name: ['', Validators.required],
        processing_amount: ['', Validators.required],
        service_name: ['', Validators.required],
        client_type: ['', Validators.required],
        recipient_no: ['', Validators.required],
        water_test_fee: [''],
        payment_mode: ['', Validators.required],
        createdBy: ['', Validators.required],
        license_category: [''],
        license_duration: [''],
        total_amount: ['', Validators.required]
      });

      this.fboForm.patchValue({createdBy : `${this.userName}(${this.parsedUserData.employee_id})`})
      
  }
  get fbo(): { [key: string]: AbstractControl } {
    return this.fboForm.controls;
  }

  setRequired() {
    return [Validators.required];
  }
  //Form Submit Method
  onSubmit() {
    this.submitted = true;
    if (this.fboForm.invalid) {
      return;
    }

    if(this.isEditMode){
      this.editedData = this.fboForm.value;
      this._registerService.updateFbo(this.objId, this.editedData, `${this.userName}(${this.parsedUserData.employee_id})`).subscribe({
        next: (res)=>{
          if(res.success){
            this._toastrService.success('Record edited successfully', res.message);
            this.backToRegister();
          }
        }
      });
    }else{
      this.addFbo = this.fboForm.value;
      if(this.addFbo.payment_mode === 'Pay Page'){
        this._registerService.fboPayment(this.addFbo).subscribe({
          next: (res)=>{
            window.location.href = res.message
          },
          error: (err)=>{
            console.log(err);
          }
        })
      }else{
        this._registerService.addFbo(this.addFbo).subscribe({
        next: (res)=>{
          if(res.success){
            this._toastrService.success('Record edited successfully', res.message);
            this.backToRegister();
          }
        },
        error: (err)=>{
          let errorObj = err.error;
          if(errorObj.userError){
          this._registerService.signout();
          }else if(errorObj.contactErr){
          this._toastrService.error('Message Error!', errorObj.contactErr);
          }else if(errorObj.emailErr){
          this._toastrService.error('Message Error!', errorObj.emailErr);
          }else if(errorObj.addressErr){
          this._toastrService.error('Message Error!', errorObj.addressErr);
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
        console.log(this.fboGeneralData);
        this.fboGeneralData = Object.entries(this.fboGeneralData).map(([key, value]) => ({ key, value }));
        this.productList = Object.keys(res.product_name);
      },
      error: (err) => {
        let errorObj = err.error
        if(errorObj.userError){
          this._registerService.signout();
        }
      }
    })
  }

  //Reset the form
  onReset(): void {
    this.submitted = false;
    
    this.fboForm.reset();
  }

  //Get Product List
  getProduct(event: any) {
    this.clearFunc();
    this.isQrCode = false;
    this.productName = event.target.value;
    var filtered = this.fboGeneralData.filter((a: any) => a.key == this.productName)
    filtered = filtered[0].value;
    this.processAmnt = Object.values(filtered.processing_amount);
    this.serviceName = Object.values(filtered.service_name);

    if (this.productName == 'Foscos Training') {
      this.recipientORshop = 'Shops';
      this.isFoscos = true;       
      this.fboForm.controls['license_category'].setValidators(this.setRequired());   
      this.fboForm.controls['license_duration'].setValidators(this.setRequired());  
    }else {
      this.recipientORshop = 'Recipients';
      this.isFoscos = false;
      this.fboForm.controls['license_category'].clearValidators();
      this.fboForm.controls['license_duration'].clearValidators();
    }
  }
  //Processing Amount + GST
  processAmount(event: any) {
    if(this.fboForm.value.client_type != '' || this.fboForm.value.recipient_no != '' || this.fboForm.value.total_amount != ''){
      var GST_amount = (Number(this.fboForm.value.processing_amount) ) * 18 / 100;
      var total_amount = (Number(GST_amount) + Number(this.fboForm.value.processing_amount * this.fboForm.value.recipient_no));
      this.fboForm.patchValue({ 'total_amount': total_amount });
    }
  }
  //Water test Ammount + GST
  waterTestAdd(event:any){
    if(event.target.value != 0){
    var processAmnt = (Number(this.fboForm.value.processing_amount * this.fboForm.value.recipient_no)) + Number(this.fboForm.value.water_test_fee);
    var GST_amount = processAmnt * 18 / 100;
    var total_amount = (Number(GST_amount) + processAmnt);
    this.fboForm.patchValue({ 'total_amount': total_amount });
    }
    else{
      var processAmnt = (Number(this.fboForm.value.processing_amount * this.fboForm.value.recipient_no));
      var GST_amount = processAmnt * 18 / 100;
      var total_amount = (Number(GST_amount) + processAmnt);
      this.fboForm.patchValue({ 'total_amount': total_amount });
    }
  }

  //Client Type + GST
  clienttypeFun(event: any) {
    if (event.target.value === 'General Client') {
      this.fboForm.patchValue({ 'recipient_no': 1 })
      this.isReadOnly = true;
      var total_amount = this.GSTandTotalAmnt(1)
      this.fboForm.patchValue({ 'total_amount': total_amount });
    }
    if (event.target.value === 'Corporate Client') {
      this.minValue = 2;
      var val = 2;
      this.fboForm.patchValue({ 'recipient_no': val });
      this.recipientCount(val);
    }
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
  recipientCount(val: any) {
    this.isReadOnly = false;
    if (typeof (val) == 'number') {
      var total_amount = this.GSTandTotalAmnt(val)
      this.fboForm.patchValue({ 'total_amount': total_amount });
    } else {
      var recipient = val.target.value;
      var total_amount = this.GSTandTotalAmnt(recipient)
      this.fboForm.patchValue({ 'total_amount': total_amount });
    }
  }

  //GST Calculation and Add to Total Amount
  GSTandTotalAmnt(param: any) {
    console.log(param)
    var processAmnt = this.fboForm.value.processing_amount * param;
    var GST_amount = processAmnt * 18 / 100;
    var total_amount = Number(GST_amount) + processAmnt;
    return total_amount;
  }

  ModeofPayment(event: any){
    if(this.fboForm.value.total_amount !== '' && event.target.value == 'Pay Page'){
      this.isQrCode = true;
    }else{
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
}

