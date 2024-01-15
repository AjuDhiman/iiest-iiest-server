import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, Validators, FormControl, FormBuilder, AbstractControl } from '@angular/forms';
import { RegisterService } from 'src/app/services/register.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { ToastrService } from 'ngx-toastr';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';

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
  selectedFile: File | null = null;
  fboID: any;
  recipientData: any;
  shopData: any;
  addRecipient: any;
  submitted = false;
  isfostac: boolean = false;
  faFileExcel = faFileExcel;
  uploadExcel: boolean = false;
  excelData: any;
  finalData:any[];
  recipientform: FormGroup = new FormGroup({
    name: new FormControl(''),
    phoneNo: new FormControl(''),
    aadharNo: new FormControl(''),
    operatorName: new FormControl(''),
    address: new FormControl(''),
    eBill: new FormControl('')
  });
  excelSubmited: boolean = false;
  recipientform1: FormGroup = new FormGroup({

  });
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
    // this.recipientData = this.fboData.recipientDetails; 
    // this.shopData = this.fboData.shopDetails;

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
        break;
      case "foscos":
        this.isfostac = false;
        this.recipientform = this.formBuilder.group(
          {
            operatorName: ['', Validators.required],
            address: ['', Validators.required],
            eBill: ['', Validators.required]
          });
        break;
      /* case "*":
        console.log(val1 * val2);
        break;
      case "/":
        console.log(val1 / val2);
        break;
      default:
        console.log("Invalid operator");
        break; */
    }
    this.excelForm = this.formBuilder.group({
      excel: ['', [Validators.required, this.validateFileType(['csv', 'xlsx'])]],
    });
  }
  get recipient(): { [key: string]: AbstractControl } {
    return this.recipientform.controls;
  }
  get excelform(): { [key: string]: AbstractControl } {
    return this.excelForm.controls;
  }
  //Form Submit Methode
  onSubmit() {
    this.submitted = true;

    if (this.recipientform.invalid) {
      return;
    }

    this.fboID = this.fboData._id
    console.log(this.fboID);

    if (this.serviceType === 'fostac') {
      console.log([this.recipientform.value]);

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
          }
        }
      })
    } else if (this.serviceType === 'foscos') {

      let formData: any = new FormData()

      formData.append('operatorName', this.recipientform.get('operatorName')?.value)
      formData.append('address', this.recipientform.get('address')?.value)
      if (this.selectedFile) {
        formData.append('eBill', this.selectedFile);
      }

      console.log(this.recipientform.get('eBill')?.value)

      console.log(this.addRecipient)

      this._registerService.addFboShop(this.fboID, [formData]).subscribe({
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
  closeModal() {
    this.activeModal.close();
  }

  //file type validation
  onImageChangeFromFile($event: any) {
    if ($event.target.files && $event.target.files[0]) {
      let file = $event.target.files[0];
      console.log(file);
      if (file.type == "image/jpeg" || file.type == "image/png") {
        console.log("correct");
        this.selectedFile = file;
        console.log(this.selectedFile);
      }
      else {
        //call validation
        this.recipientform.reset();
        this.recipientform.controls["eBill"].setValidators([Validators.required]);
      }
    }
  }

  getSaleRecipientsList(saleId: string) {
    this.getDataServices.getSaleRecipients(saleId).subscribe({
      next: (res) => {
        this.recipientData = res.recipientsList;
      }
    })
  }

  getSaleShopsList(saleId: string) {
    this.getDataServices.getSaleShops(saleId).subscribe({
      next: (res) => {
        this.shopData = res.shopsList
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

      console.log(data);
      this.excelData = data;
    }
  }

  submitExcel(){
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
          }
        }
      })
    } else if(this.serviceType==='foscos'){
      this._registerService.addFboShop(this.fboID, this.excelData).subscribe({
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

  downloadCSV(fileType: String) {
    this._utilService.downloadFile(fileType);
  }

  ChangeFormType($event: any) {
    this.uploadExcel = !this.uploadExcel
  }

  validateFileType(allowedExtensions: string[]) {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const file = control.value;
      console.log(file);
      if (file) {
        const fileExtension = file.split('.').pop()?.toLowerCase();
        console.log(fileExtension)
        if (fileExtension && allowedExtensions.find(item => item === fileExtension)) {
          return null;
        } else {
          return { invalidFileType: true };
        }
      }

      return null;
    };
  }
}
