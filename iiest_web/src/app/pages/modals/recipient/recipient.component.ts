import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, Validators, FormControl, FormBuilder, AbstractControl } from '@angular/forms';
import { RegisterService } from 'src/app/services/register.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { ToastrService } from 'ngx-toastr';
import { faFileExcel, faFile, faDownload, IconDefinition } from '@fortawesome/free-solid-svg-icons';

import * as XLSX from 'xlsx'
import { GetdataService } from 'src/app/services/getdata.service';
import { fboRecipient } from 'src/app/utils/registerinterface';
@Component({
  selector: 'app-recipient',
  templateUrl: './recipient.component.html',
  styleUrls: ['./recipient.component.scss']
})
export class RecipientComponent implements OnInit {
  @Input() public fboData: any;
  @Input() public serviceType: string;
  fboID: any;
  recipientData: any;
  shopData: any;
  addRecipient: any;
  submitted = false;
  isfostac: boolean = false;
  pageNumber: number = 1;
  finalData: any[];
  showEBill: boolean = false;
  ebillImage: string = '';
  showPagination: boolean = false;
  recipientCount: number = 0;
  shopsCount: number;
  listCount: number;

  //icons
  faFileExcel: IconDefinition = faFileExcel;
  faFile: IconDefinition = faFile;
  faDownload: IconDefinition = faDownload;

  //variables for File 
  ebillFile: File;
  ownerPhotoFile: File;
  shopPhotoFile: File;
  aadharFile: File;

  //recipient reactive form this contains intialization of it's form control because we are using this form conditionally
  recipientform: FormGroup = new FormGroup({
    //form controls recipient
    name: new FormControl(''),
    phoneNo: new FormControl(''),
    aadharNo: new FormControl(''),

    //form controls shops
    operatorName: new FormControl(''),
    address: new FormControl(''),
    pincode: new FormControl(''),
    village: new FormControl(''),
    tehsil: new FormControl(''),
    eBill: new FormControl(''),
    owner_photo: new FormControl(''),
    shop_photo: new FormControl(''),
    aadhar_photo: new FormControl('')
  });


  //excel related variables and form
  uploadExcel: boolean = false;
  excelData: any;
  excelSubmited: boolean = false;
  excelForm: FormGroup = new FormGroup({
    excel: new FormControl(''),
  });

  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private _registerService: RegisterService,
    private getDataServices: GetdataService,
    private _toastrService: ToastrService,
    private _utilService: UtilitiesService) {

  }

  ngOnInit(): void {
    if (this.serviceType === 'fostac') {
      this.getSaleRecipientsList(this.fboData._id);
    }

    if (this.serviceType === 'foscos') {
      this.getSaleShopsList(this.fboData._id);
    }

    this.setFormValidation();
  }

  get recipient(): { [key: string]: AbstractControl } {
    return this.recipientform.controls;
  }

  get excelform(): { [key: string]: AbstractControl } {
    return this.excelForm.controls;
  }
  //Form Submit Methode
  onSubmit(): void {
    this.submitted = true;

    // if (this.recipientform.invalid) {
    //   return;
    // }

    this.fboID = this.fboData._id

    console.log(this.serviceType);

    if (this.serviceType === 'fostac') {

      console.log(5);

      this._registerService.addFboRecipent(this.fboID, [this.recipientform.value]).subscribe({
        next: (res) => {
          if (res.success) {
            this._toastrService.success('', 'Record Added Successfully.');
            this.closeModal();
          }
        },
        error: (err) => {
          let errorObj = err.error;
          if (errorObj.userError) {
            this._registerService.signout();
          } else if (errorObj.aadharErr) {
            this._toastrService.error('', 'This Aadhar Number Already Exists');
          } else if (errorObj.phoneErr) {
            this._toastrService.error('', 'This Phone Number Already Exists');
          }
        }
      })
    } else if (this.serviceType === 'foscos') {

      let formData: any = new FormData()
      console.log(6);

      formData.append('operatorName', this.recipientform.get('operatorName')?.value);
      formData.append('address', this.recipientform.get('address')?.value);
      formData.append('pincode', this.recipientform.get('pincode')?.value);
      formData.append('village', this.recipientform.get('village')?.value);
      formData.append('tehsil', this.recipientform.get('tehsil')?.value);
      formData.append('eBill', this.ebillFile);
      formData.append('ownerPhoto', this.ownerPhotoFile);
      formData.append('shopPhoto', this.shopPhotoFile);

      console.log(1);
      this._registerService.addFboShop(this.fboID, formData).subscribe({
        next: (res) => {
          if (res.success) {
            this._toastrService.success('', 'Record Added Successfully.');
            this.closeModal();
          }
        },
        error: (err) => {
          let errorObj = err.error;
          if (errorObj.userError) {
            this._registerService.signout();
          } else if (errorObj.addressErr) {
            this._toastrService.error('', 'This Address Already Exists.');
          }
        }
      })
    }
  }

  closeModal(): void {
    this.activeModal.close();
  }

  //file type validation
  onImageChangeFromFile($event: any, fileType: string) {
    if ($event.target.files && $event.target.files[0]) {
      let file = $event.target.files[0];
      console.log(file);
      if (file.type == "image/jpeg" || file.type == "image/jpg" || file.type == "image/png") {
        switch (fileType) {
          case 'eBill':
            this.ebillFile = file;
            break;
          case 'ownerPhoto':
            this.ownerPhotoFile = file;
            break;
          case 'shopPhoto':
            this.shopPhotoFile = file;
            break;
          case 'aadhar':
            this.aadharFile = file;
            break;
        }
        console.log(this.ebillFile, this.ownerPhotoFile, this.shopPhotoFile, this.aadharFile);
      }
      else {
        //call validation
        // this.recipientform.reset();
        // this.recipientform.controls["eBill"].setValidators([Validators.required]);
      }
    }
  }

  getSaleRecipientsList(saleId: string): void {
    this.getDataServices.getSaleRecipients(saleId).subscribe({
      next: (res) => {
        if (res.recipientsList.length) {
          this.showPagination = true;
          this.recipientData = res.recipientsList;
          this.recipientCount = res.recipientsList.length;
        }
      }
    })
  }

  getSaleShopsList(saleId: string): void {
    this.getDataServices.getSaleShops(saleId).subscribe({
      next: (res) => {
        if (res.shopsList.length) {
          this.shopData = res.shopsList
          this.showPagination = true;
          this.shopsCount = res.shopsList.length;
        }
      }
    })

  }
  //by the help  of this function we can upload data as anexcel sheet, we used XLSX npm package in it
  onExcelUpload(event: any) {
    this.excelSubmited = true;
    let file = event.target.files[0];
    let fileReader: FileReader = new FileReader();
    fileReader.readAsBinaryString(file);

    fileReader.onload = (e: any) => {
      let workbook = XLSX.read(fileReader.result, { type: 'binary' });
      let sheetNames = workbook.SheetNames;
      let data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);

      this.excelData = data;
    }

  }

  submitExcel() {
    this.fboID = this.fboData._id
    if (this.serviceType === 'fostac') {
      this._registerService.addFboRecipent(this.fboID, this.excelData).subscribe({
        next: (res) => {
          if (res.success) {
            this._toastrService.success('', 'Records Added Successfully.');
            this.closeModal();
          }
        },
        error: (err) => {
          let errorObj = err.error;
          if (errorObj.userError) {
            this._registerService.signout();
          } else if (errorObj.aadharErr) {
            this._toastrService.error('', 'This Aadhar Number Already Exists');
          } else if (errorObj.phoneErr) {
            this._toastrService.error('', 'This Phone Number Already Exists');
          }
        }
      })
    } else if (this.serviceType === 'foscos') {
      this._registerService.addFboShopByExcel(this.fboID, this.excelData).subscribe({
        next: (res) => {
          if (res.success) {
            this._toastrService.success('', 'Record Added Successfully.');
            this.closeModal();
          }
        },
        error: (err) => {
          let errorObj = err.error;
          if (errorObj.userError) {
            this._registerService.signout();
          }
        }
      })
    }
  }

  downloadCSV(fileType: String) {
    this._utilService.downloadFile(fileType);
  }

  ChangeFormType($event: any) {
    this.uploadExcel = !this.uploadExcel
  }

  validateFileType(allowedExtensions: string[]) {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const file = control.value;
      if (file) {
        const fileExtension = file.split('.').pop()?.toLowerCase();
        if (fileExtension && allowedExtensions.find(item => item === fileExtension)) {
          return null;
        } else {
          return { invalidFileType: true };
        }
      }

      return null;
    };
  }

  onTableDataChange(event: any) {
    this.pageNumber = event;
    // this.filter();
  }

  setFormValidation(): void {
    switch (this.serviceType) {
      case "fostac":
        this.isfostac = true;
        this.recipientform = this.formBuilder.group(
          {
            name: ['', Validators.required],
            phoneNo: ['',
              [
                Validators.required,
                Validators.pattern(/^[0-9]{10}$/)
              ]],
            aadharNo: ['',
              [
                Validators.required,
                Validators.pattern(/^[0-9]{12}$/)
              ]]
          });
        this.listCount = this.fboData.fostacInfo.recipient_no;
        break;
      case "foscos":
        this.isfostac = false;
        this.recipientform = this.formBuilder.group(
          {
            operatorName: ['', Validators.required],
            address: ['', Validators.required],
            pincode: ['', Validators.required],
            village: ['', Validators.required],
            tehsil: ['', Validators.required],
            eBill: ['', [Validators.required, this.validateFileType(['jpeg', 'jpg', 'png'])]],
            owner_photo: ['', [Validators.required, this.validateFileType(['jpeg', 'jpg', 'png'])]],
            shop_photo: ['', [Validators.required, this.validateFileType(['jpeg', 'jpg', 'png'])]],
          });
        this.listCount = this.fboData.foscosInfo.shops_no;
        break;
    }

    this.excelForm = this.formBuilder.group({
      excel: ['', [Validators.required, this.validateFileType(['csv', 'xlsx'])]],
    });
  }

  openEBillWindow(id: string) {
    this.showEBill = true;
    this.getEbill(id);
  }

  closeEBillWindow() {
    this.showEBill = false;
  }

  getEbill(id: string) {
    this.getDataServices.getEbill(id).subscribe({
      next: (res) => {
        this.ebillImage = res.billConverted;
      }
    })
  }

  uploadEbill($event: any, shopId: string){
    let file = $event.target.files[0]
    let formData: FormData = new FormData();
    formData.append('eBill', file);
    this._registerService.uploadEbill(shopId, formData).subscribe({
      next: res => {
        this.activeModal.close();
        this._toastrService.success('Ebill Uploaded')
      }
    })
  }

  uploadOwnerPhoto($event: any, shopId: string){
    let file = $event.target.files[0]
    let formData: FormData = new FormData();
    formData.append('ownerPhoto', file);
    this._registerService.uploadOwnerPhoto(shopId, formData).subscribe({
      next: res => {
        this.activeModal.close();
        this._toastrService.success('Owner photo Uploaded')
      }
    })
  }

  uploadShopPhoto($event: any, shopId: string){
    let file = $event.target.files[0]
    let formData: FormData = new FormData();
    formData.append('shopPhoto', file);
    this._registerService.uploadShopPhoto(shopId, formData).subscribe({
      next: res => {
        this.activeModal.close();
        this._toastrService.success('shopPhoto Uploaded')
      }
    })
  }
}
