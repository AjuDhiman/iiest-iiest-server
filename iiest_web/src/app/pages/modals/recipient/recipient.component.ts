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
import { hraKob } from 'src/app/utils/config';
@Component({
  selector: 'app-recipient',
  templateUrl: './recipient.component.html',
  styleUrls: ['./recipient.component.scss']
})
export class RecipientComponent implements OnInit {
  @Input() public fboData: any;
  @Input() public serviceType: string;
  @Input() public isVerifier: string;
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
  onlyRecpList: boolean = false;
  loading: boolean = false;

  hraKobs = hraKob;

  //icons
  faFileExcel: IconDefinition = faFileExcel;
  faFile: IconDefinition = faFile;
  faDownload: IconDefinition = faDownload;

  //variables for File 
  ebillFile: File;
  ownerPhotoFile: File;
  shopPhotoFile: File;
  aadharFile: File;

  fostacCertificate: File;
  foscosLicense: File;

  //recipient reactive form this contains intialization of it's form control because we are using this form conditionally
  recipientform: FormGroup = new FormGroup({
    //form controls recipient
    name: new FormControl(''),
    phoneNo: new FormControl(''),
    aadharNo: new FormControl(''),
    fatherName: new FormControl(''),
    dob: new FormControl(''),
    email: new FormControl(''),
    recp_address: new FormControl(''),

    //form controls shops
    operatorName: new FormControl(''),
    address: new FormControl(''),
    pincode: new FormControl(''),
    village: new FormControl(''),
    tehsil: new FormControl(''),
    // eBill: new FormControl(''),
    owner_photo: new FormControl(''),
    shop_photo: new FormControl(''),
    aadhar_photo: new FormControl(''),

    // form controls for hra shops 
    manager_name: new FormControl(''),
    manager_contact: new FormControl(''),
    manager_email: new FormControl(''),
    // kob: new FormControl(''),
    // food_handlers: new FormControl(''),
    // fostac_certificate: new FormControl(''),
    // foscos_license: new FormControl('')
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
    this.setFormValidation();
    if (this.serviceType === 'Fostac') {
      this.getSaleRecipientsList(this.fboData._id);
    }

    if (this.serviceType === 'Foscos') {
      this.getSaleShopsList(this.fboData._id);
      this.recipientform.patchValue({
        operatorName:this.fboData.fboInfo.boInfo.manager_name,
        address: this.fboData.fboInfo.address,
        pincode: this.fboData.fboInfo.pincode,
        village: this.fboData.fboInfo.village,
        tehsil: this.fboData.fboInfo.tehsil,
        state: this.fboData.fboInfo.state,
        district: this.fboData.fboInfo.district
      });
    }

    if (this.serviceType === 'HRA') {
      this.getHygieneShopList(this.fboData._id);
      this.recipientform.patchValue({
        manager_name: this.fboData.fboInfo.boInfo.manager_name, 
        address: this.fboData.fboInfo.address,
        manager_contact: this.fboData.fboInfo.owner_contact,
        manager_email: this.fboData.fboInfo.email,
        pincode: this.fboData.fboInfo.pincode,
        village: this.fboData.fboInfo.village,
        tehsil: this.fboData.fboInfo.tehsil,
        state: this.fboData.fboInfo.state,
        district: this.fboData.fboInfo.district
      });
    }

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
    console.log(this.recipientform);

    if (this.recipientform.invalid || this.loading) { //can't submit while loading and in case of invalid recp form
      return;
    }

    this.loading = true;

    this.fboID = this.fboData._id

    if (this.serviceType === 'Fostac') {

      this._registerService.addFboRecipent(this.fboID, [this.recipientform.value]).subscribe({
        next: (res) => {
          if (res.success) {
            const formData = new FormData();
            formData.append('name', 'Aadhar Photo');
            formData.append('format', 'Image');
            formData.append('panelType', 'Fostac');
            formData.append('multipleDoc', 'true');
            formData.append('handlerId', res.recpArr[0].recipientId);
            (this.aadharFile as any).forEach((file: File) => {
              formData.append('document', file);
            })
            this._registerService.saveFostacDocument(formData).subscribe({
              next: res => {
                this._toastrService.success('', 'Record Added Successfully.');
              }
            });
           
            this.closeModal();
            this.loading = false;
          }
        },
        error: (err) => {
          let errorObj = err.error;
          this.loading = false;
          if (errorObj.userError) {
            this._registerService.signout();
          } else if (errorObj.aadharErr) {
            this._toastrService.error('', 'This Aadhar Number Already Exists');
          } else if (errorObj.phoneErr) {
            this._toastrService.error('', 'This Phone Number Already Exists');
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
      if (file.type == "image/jpeg" || file.type == "image/jpg" || file.type == "image/png" || file.type == "application/pdf") {
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
          case 'aadharPhoto':
            this.aadharFile = $event.target.files;
            break;
          case 'fostacCerificate':
            this.fostacCertificate = file;
            break;
          case 'foscosLicense':
            this.foscosLicense = file;
            break;
        }
      }
      else {
        //call validation
        // this.recipientform.reset();
        // this.recipientform.controls["eBill"].setValidators([Validators.required]);
      }
    }
  }

  getSaleRecipientsList(saleId: string) {
    this.loading = true;
    this.getDataServices.getSaleRecipients(saleId).subscribe({
      next: (res) => {
        console.log(res);
        this.loading = false;
        if (res.recipientsList.length) {
          this.showPagination = true;
          this.recipientData = res.recipientsList;
          this.recipientCount = res.recipientsList.length;
          
          // getting doocs of all recps
          this.recipientData.forEach((recp: any) => {
             this.getDataServices.getDocs(recp.recipientId).subscribe({
              next: response => {
                console.log(response)
                recp.documents = response.docs;
                
              }
             })
          })
        }
      },
      error: err => {
        this.loading = false;
      }
    });
  }

  getSaleShopsList(saleId: string): void {
    this.loading = false;
    this.getDataServices.getSaleShops(saleId).subscribe({
      next: (res) => {
        if (res.shopsList.length) {
          this.shopData = res.shopsList;
          this.showPagination = true;
          this.shopsCount = res.shopsList.length;
          this.loading = false;
        }
      }
    });

  }

  getHygieneShopList(saleId: string) {
    this.loading = true;
    this.getDataServices.getHygieneSaleShops(saleId).subscribe({
      next: res => {
        this.loading = false;
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

  //submit excels
  submitExcel() {
    this.loading = true;
    this.fboID = this.fboData._id
    if (this.serviceType === 'Fostac') {
      this._registerService.addFboRecipent(this.fboID, this.excelData).subscribe({
        next: (res) => {
          if (res.success) {
            this._toastrService.success('', 'Records Added Successfully.');
            this.loading = false;
            this.closeModal();
          }
        },
        error: (err) => {
          let errorObj = err.error;
          this.loading = false;
          if (errorObj.userError) {
            this._registerService.signout();
          } else if (errorObj.aadharErr) {
            this._toastrService.error('', 'This Aadhar Number Already Exists');
          } else if (errorObj.phoneErr) {
            this._toastrService.error('', 'This Phone Number Already Exists');
          }
        },
      })
    } else if (this.serviceType === 'Foscos') {
      this._registerService.addFboShopByExcel(this.fboID, this.excelData).subscribe({
        next: (res) => {
          if (res.success) {
            this.loading = false;
            this._toastrService.success('', 'Record Added Successfully.');
            this.closeModal();
          }
        },
        error: (err) => {
          this.loading = false;
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
      case "Fostac":
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
              ]],
            recp_address: ['', Validators.required],
            fatherName: ['', Validators.required],
            dob: ['', Validators.required],
            email: ['', Validators.required],
            aadhar_photo: ['', Validators.required],
          });

        this.listCount = this.fboData.fostacInfo.recipient_no;
        break;
      case "Foscos":
        this.isfostac = false;
        this.recipientform = this.formBuilder.group(
          {
            operatorName: ['', Validators.required],
            address: ['', Validators.required],
            pincode: ['', [Validators.required, Validators.pattern('^[1-9][0-9]{5}$')]],
            // village: ['', Validators.required],
            // tehsil: ['', Validators.required],
            village: [''],
            tehsil: [''],
            // eBill: ['', [Validators.required, this.validateFileType(['jpeg', 'jpg', 'png'])]],
            owner_photo: ['', [Validators.required, this.validateFileType(['jpeg', 'jpg', 'png'])]],
            shop_photo: ['', [Validators.required, this.validateFileType(['jpeg', 'jpg', 'png'])]],
            aadhar_photo: ['', [Validators.required, this.validateFileType(['jpeg', 'jpg', 'png'])]],
          });
        this.listCount = this.fboData.foscosInfo.shops_no;
        break;
      case "HRA":
        this.isfostac = false;
        this.recipientform = this.formBuilder.group(
          {
            manager_name: ['', Validators.required],
            manager_contact: ['', Validators.required],
            manager_email: ['', [Validators.required, Validators.email]],
            address: ['', Validators.required],
            pincode: ['', [Validators.required, Validators.pattern('^[1-9][0-9]{5}$')]],
            // kob: ['', Validators.required],
            // food_handlers: ['', Validators.required],
            // fostac_certificate: ['',[ Validators.required, this.validateFileType(['jpeg', 'jpg', 'png', 'pdf'])]],
            // foscos_license: ['', [Validators.required, this.validateFileType(['jpeg', 'jpg', 'png', 'pdf'])]]
            owner_photo: ['', [Validators.required, this.validateFileType(['jpeg', 'jpg', 'png'])]],
            shop_photo: ['', [Validators.required, this.validateFileType(['jpeg', 'jpg', 'png'])]],
            aadhar_photo: ['', [Validators.required, this.validateFileType(['jpeg', 'jpg', 'png'])]],
          });
        this.listCount = this.fboData.hraInfo.shops_no;
    }
    this.excelForm = this.formBuilder.group({
      excel: ['', [Validators.required, this.validateFileType(['csv', 'xlsx'])]],
    });
  }

}
