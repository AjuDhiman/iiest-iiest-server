import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, Validators, FormControl, FormBuilder, AbstractControl } from '@angular/forms';
import { RegisterService } from 'src/app/services/register.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { ToastrService } from 'ngx-toastr';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';  
import * as XLSX from 'xlsx'
@Component({
  selector: 'app-recipient',
  templateUrl: './recipient.component.html',
  styleUrls: ['./recipient.component.scss']
})
export class RecipientComponent implements OnInit {
  @Input() public fboData: any;
  @Input() public serviceType :string;
  selectedFile: File | null = null;
  fboID: any;
  recipientData: any;
  shopData: any;
  addRecipient: any;
  submitted = false;
  isfostac:boolean = false;
  faFileExcel = faFileExcel;
  recipientform: FormGroup = new FormGroup({
    name: new FormControl(''),
    phoneNo: new FormControl(''),
    aadharNo: new FormControl(''),
    operatorName: new FormControl(''),
    address: new FormControl(''),
    eBill: new FormControl('')
  });
  recipientform1: FormGroup = new FormGroup({
   
  });
  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private _registerService: RegisterService,
    private _toastrService: ToastrService,
    private _utilService: UtilitiesService) {

  }
  ngOnInit(): void {
    console.log(this.fboData);
    this.recipientData = this.fboData.recipientDetails; 
    this.shopData = this.fboData.shopDetails;

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
  }
  get recipient(): { [key: string]: AbstractControl } {
    return this.recipientform.controls;
  }
  //Form Submit Methode
  onSubmit() {
    this.submitted = true;
    if (this.recipientform.invalid) {
      return;
    }

    this.fboID = this.fboData._id
    console.log(this.fboID);

    if(this.serviceType === 'fostac'){

      this._registerService.addFboRecipent(this.fboID, this.recipientform.value).subscribe({
        next: (res) => {
          if (res.success) {
            this._toastrService.success('Record Added successfully', res.message);
            this.closeModal();
          }
        },
        error: (err) => {
          let errorObj = err.error;
          if (errorObj.userError) {
            this._registerService.signout();
          } else if (errorObj.aadharErr) {
            this._toastrService.error('Message Error!', 'This aadhar number already exists');
          }
        }
      })
    }else if(this.serviceType === 'foscos'){

      let formData: any = new FormData()

      formData.append('operatorName', this.recipientform.get('operatorName')?.value)
      formData.append('address', this.recipientform.get('address')?.value)
      if (this.selectedFile) {
        formData.append('eBill', this.selectedFile);
      }

      console.log(this.recipientform.get('eBill')?.value)

      console.log(this.addRecipient)

      this._registerService.addFboShop(this.fboID, formData).subscribe({
        next: (res) => {
          if (res.success) {
            this._toastrService.success('Record Added successfully', res.message);
            this.closeModal();
          }
        },
        error: (err) => {
          let errorObj = err.error;
          if (errorObj.userError) {
            this._registerService.signout();
          } else if (errorObj.addressErr) {
            this._toastrService.error('Message Error!', 'This address already exists');
          }
        }
      })
    }
  }
  closeModal() {
    this.activeModal.close();
  } 

  //file type validation
  onImageChangeFromFile($event:any)
  {
      if ($event.target.files && $event.target.files[0]) {
        let file = $event.target.files[0];
        console.log(file);
          if(file.type == "image/jpeg" || file.type == "image/png") {
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
//by the help  of this function we can upload data as anexcel sheet, we used XLSX npm package in it
  onExcelUpload(event:any){
    let file = event.target.files[0];
    let fileReader: FileReader = new FileReader();
    fileReader.readAsBinaryString(file);

    fileReader.onload = (e:any) => {
      let workbook = XLSX.read(fileReader.result, {type: 'binary'});
      let sheetNames = workbook.SheetNames;
      let data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);
      console.log(data);
    }
  }

  downloadCSV(fileType:String){
    this._utilService.downloadFile(fileType);
  }
}
