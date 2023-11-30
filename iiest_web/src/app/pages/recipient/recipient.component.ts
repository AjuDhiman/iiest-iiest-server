import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, Validators, FormControl, FormBuilder, AbstractControl } from '@angular/forms';
import { RegisterService } from 'src/app/services/register.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-recipient',
  templateUrl: './recipient.component.html',
  styleUrls: ['./recipient.component.scss']
})
export class RecipientComponent implements OnInit {
  @Input() public fboData: any;
  selectedFile: File | null = null;
  fboID: any;
  fboType: string;
  fboRecipientCount : number;
  recipientData: any;
  addRecipient: any;
  submitted = false;
  isfostac:boolean = false;
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
    private _toastrService: ToastrService) {

  }
  ngOnInit(): void {
    console.log(this.addRecipient);
    console.log(this.fboData)
    this.fboType = this.fboData.product_name;
    this.fboRecipientCount = this.fboData.recipient_no;
    this.fboID = this.fboData._id;
    this.recipientData = this.fboData.recipientDetails;
   // console.log(this.fboID, this.recipientData);
    switch (this.fboType) {
      case "Fostac Training":
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
      case "Foscos Training":
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

    let formData = new FormData()

    if(this.fboType === 'Fostac Training'){

      console.log(this.recipientform.get('name')?.value)
      console.log(this.recipientform.get('aadharNo')?.value)

      formData.append('name', this.recipientform.get('name')?.value)
      formData.append('phoneNo', this.recipientform.get('phoneNo')?.value)
      formData.append('aadharNo', this.recipientform.get('aadharNo')?.value)

      this.addRecipient = formData

      this._registerService.addFboRecipent(this.fboID, this.addRecipient).subscribe({
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
          } else if (errorObj.contactErr) {
            this._toastrService.error('Message Error!', errorObj.contactErr);
          } else if (errorObj.emailErr) {
            this._toastrService.error('Message Error!', errorObj.emailErr);
          } else if (errorObj.addressErr) {
            this._toastrService.error('Message Error!', errorObj.addressErr);
          }
        }
      })
    }else if(this.fboType === 'Foscos Training'){
      formData.append('operatorName', this.recipientform.get('operatorName')?.value)
      formData.append('address', this.recipientform.get('address')?.value)
      if (this.selectedFile) {
        formData.append('eBill', this.selectedFile);
      }

      console.log(this.recipientform.get('eBill')?.value)

      this.addRecipient = formData;

      console.log(this.addRecipient)

      this._registerService.addFboShop(this.fboID, this.addRecipient).subscribe({
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
          } else if (errorObj.contactErr) {
            this._toastrService.error('Message Error!', errorObj.contactErr);
          } else if (errorObj.emailErr) {
            this._toastrService.error('Message Error!', errorObj.emailErr);
          } else if (errorObj.addressErr) {
            this._toastrService.error('Message Error!', errorObj.addressErr);
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
}
