import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';
import { stateName, processAmnt } from 'src/app/utils/config';
import { pincodeData } from 'src/app/utils/registerinterface';


@Component({
  selector: 'app-create-invoice',
  templateUrl: './create-invoice.component.html',
  styleUrls: ['./create-invoice.component.scss']
})
export class CreateInvoiceComponent implements OnInit {

  //vars
  submitted: boolean = false;

  //loading vars
  loading: boolean = false;

  //state and ditrict related vars
  states: string[] = stateName;
  distrcts: string[] = [];
  pincodes: number[] = [];
  districtAndPincodes: any = [];


  products: string[] = [
    'FVO',
    'MAO',
    'ROC',
    'Cabin',
    'Flexi Seat',
    'Confrence Room',
    'Meeting Room'
  ];
  invoiceTypes: string[] = [
    'Customer',
    'Tax',
    'Service'
  ];


  //var for deciding is gst no visible or not
  isGstNoVisible: boolean = false;


  //logical form
  invoiceForm: FormGroup = new FormGroup({
    business_name: new FormControl(''),
    contact_no: new FormControl(''),
    email: new FormControl(''),
    state: new FormControl(''),
    district: new FormControl(''),
    pincode: new FormControl(''),
    address: new FormControl(''),
    product_code: new FormControl(''),
    product: new FormControl(''),
    invoice_type: new FormControl(''),
    behalf_of: new FormControl(''),
    qty: new FormControl(''),
    total_amount: new FormControl(''),
    narration: new FormControl(''),
    processing_amount: new FormControl(''),
    invoice_date: new FormControl(''),
    gst_amount: new FormControl('')
  })

  get invoiceform(): { [key: string]: AbstractControl } {
    return this.invoiceForm.controls;
  }


  //constructor
  constructor(private formBuilder: FormBuilder,
    private _getDataService: GetdataService,
    private _registerService: RegisterService,
    private _toastrService: ToastrService
  ) {

  }


  //life cycle hooks
  ngOnInit(): void {
    this.setformValidation();
  }

  //methords

  //onsubmit
  onSubmit(): void {
    this.submitted = true;
    console.log(this.invoiceForm);
    if (this.invoiceForm.invalid || this.loading) {
      return
    }

    this.loading = true;

    this._registerService.createInvoice(this.invoiceForm.value).subscribe({
      next: res => {
        console.log(res);
        this.loading = false;
        this._toastrService.success('Invoice Created Successfully');
      }
    })
  }

  //methord for setting form's validation
  setformValidation(): void {
    this.invoiceForm = this.formBuilder.group({
      business_name: ['', Validators.required],
      contact_no: ['', [Validators.required,   Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      state: ['', [Validators.required]],
      district: ['', [Validators.required]],
      pincode: ['', [Validators.required]],
      address: ['', [Validators.required]],
      product_code: ['', [Validators.required]],
      product: ['', [Validators.required]],
      invoice_type: ['', Validators.required],
      behalf_of: ['', Validators.required],
      qty: ['', Validators.required],
      total_amount: ['', Validators.required],
      narration: ['', Validators.required],
      processing_amount: ['', Validators.required],
      invoice_date: ['', Validators.required],
      gst_amount: ['', Validators.required]
    })
  }

  //methord run on state selection and fetch districts according to it
  onStateSelect() {
    let state = this.invoiceform['state'].value;

    //re configuring districs and pincodes
    this.distrcts = [];
    this.pincodes = [];
    this.invoiceform['district'].setValue('');
    this.invoiceform['pincode'].setValue('');
    this.loading = true;
    this._getDataService.getPincodesData(state).subscribe({
      next: (res) => {
        let pincodesData = res;
        this.districtAndPincodes = res;
        pincodesData.forEach((obj: pincodeData) => {
          if (!this.distrcts.find((item: string) => item.toLowerCase() === obj.District.toLowerCase())) {
            this.distrcts.push(obj.District);
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

  //methord fetches pincode on the basis of district select
  onDistrictChange(): void {
    this.pincodes = [];
    this.invoiceform['pincode'].setValue('');
    this.loading = true;
    let pincodeArr: any = [];
    this.districtAndPincodes.forEach((obj: any) => {
      if (obj.District == this.invoiceform['district'].value) {
        pincodeArr.push(obj.Pincode);
      }
    });

    pincodeArr = new Set(pincodeArr);
    this.pincodes = [...pincodeArr];
    this.loading = false;
  }

  //methord for invoicce type change
  onInvoiceTypeChange($event: any): void {
    const type = $event.target.value;

    if (type === 'Tax') {
      this.isGstNoVisible = true;
      this.invoiceForm.addControl('gst_number', new FormControl('', Validators.required));
    } else {
      this.isGstNoVisible = false;
      this.invoiceForm.removeControl('gst_number')
    }

    this.setTotalAmount()
  }

  //methord sets total rocessing amont in the basis of prosessing amount and invoice type
  setTotalAmount(): void {
    const processAmnt: number = this.invoiceform['processing_amount'].value;
    const invoiceType: string = this.invoiceform['invoice_type'].value;
    const qty: number = this.invoiceform['qty'].value;
    console.log(qty);

    let gstAmount = 0;
    if (invoiceType === 'Tax' || invoiceType === 'Customer') {
      gstAmount = Math.round(processAmnt * (18 / 100));
    } else if (invoiceType === 'Service') {
      gstAmount = 0;
    }

    gstAmount = gstAmount * qty;

    const totalAmount = (processAmnt*qty) + gstAmount;

    this.invoiceform['gst_amount'].setValue(gstAmount);
    this.invoiceform['total_amount'].setValue(totalAmount);
  }

  //set invoice code on the basis if product
  setInvoiceCode(): void {
    const product = this.invoiceform['product'].value;

    let ext = '';
    switch (product) {
      case 'FVO':
        ext = 'FVO'
        break;
      case 'MAO':
        ext = 'MAO'
        break;
      case 'ROC':
        ext = 'ROC'
        break;
      case 'Cabin':
        ext = 'CB'
        break;
      case 'Meeting Room':
        ext = 'MR'
        break;
      case 'Flexi Seat':
        ext = 'FS'
        break;
      case 'Confrence Room':
        ext = 'CR'
        break;
    }

    const invoiceCode = `SW/IS-${ext}`;

    this.invoiceform['product_code'].setValue(invoiceCode);
  }


  //methord on qty change

  onQtyChange(): void {
    this.setTotalAmount();
  }

}
