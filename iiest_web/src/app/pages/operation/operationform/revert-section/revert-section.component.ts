import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IconDefinition, faCircleCheck, faCircleExclamation, faFileArrowUp, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ViewDocumentComponent } from 'src/app/pages/modals/view-document/view-document.component';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';
import { days, months } from 'src/app/utils/config';

@Component({
  selector: 'app-revert-section',
  templateUrl: './revert-section.component.html',
  styleUrls: ['./revert-section.component.scss']
})
export class RevertSectionComponent implements OnInit, OnChanges {

  filedStatus: boolean = false;
  filed: boolean = false;

  paymentReceipt: File;
  receiptSrc: string = '';

  completedStatus: boolean = false;

  faCircleCheck = faCircleCheck;

  faCircleExclamation = faCircleExclamation;

  faFileArrowUp = faFileArrowUp;

  faFilePdf: IconDefinition = faFilePdf;

  reverts: string[] = [];

  @Input() verifiedStatus: boolean = false;

  @Input() verifiedData: any;

  @Input() customerId: string;

  //output event emitters
  @Output() emitFilingResult: EventEmitter<string> = new EventEmitter<string>;

  revertForm: FormGroup = new FormGroup({
    fssai_revert: new FormControl('')
  });

   //Filing Reactive form 
   filingForm: FormGroup = new FormGroup({
    username: new FormControl(''),
    password: new FormControl(''),
    payment_amount: new FormControl(''),
    payment_recipt: new FormControl(''),
    payment_date: new FormControl('')
  });

  constructor(private formBuilder: FormBuilder,
    private _registerService: RegisterService,
    private _toastrService: ToastrService,
    private _getDataService: GetdataService,
    private _modalService: NgbModal) {

  }

  ngOnInit(): void {
    this.revertForm = this.formBuilder.group({
      fssai_revert: [''],
    });

    this.filingForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      payment_amount: ['', Validators.required],
      payment_receipt: ['', [Validators.required, this.validateFileType(['pdf'])]],
      payment_date: ['', Validators.required],
    });

    this.getReverts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes['verifiedData']){
      this.getFiledData();
    }
  }

  get filingform(): { [key: string]: AbstractControl } {
    return this.filingForm.controls;
  }

  onFile() {
    this.filed = true;
    console.log(this.verifiedStatus);
    if(this.filingForm.invalid){
      return;
    }

    let formData = new FormData();

    formData.append('username', this.filingForm.value.username);
    formData.append('password', this.filingForm.value.password);
    formData.append('payment_amount', this.filingForm.value.payment_amount);
    formData.append('payment_receipt', this.paymentReceipt);
    formData.append('payment_date', this.filingForm.value.payment_date);

    this._registerService.filefoscos(this.verifiedData._id, formData).subscribe({
      next: res => {
        console.log(res);
        this.filedStatus = true;
        this.emitFilingResult.emit('Filed');
      }
    })
  }

  onUpdate() {
    console.log(this.revertForm.value.fssai_revert);
    if (this.revertForm.value.fssai_revert != '') {
      this._registerService.regiterRevert(this.customerId, this.revertForm.value).subscribe({
        next: res => {
          console.log(res);
          this._toastrService.success('Revert Updated');
          this.revertForm.patchValue({ fssai_revert: '' });
        }
      });
    }
  }

  getReverts(): void {
    this._getDataService.getReverts(this.customerId).subscribe({
      next: res => {
        console.log(res);
        this.formatReverts(res.reverts);
      }
    })
  }

  //this methord formats the logs in a better presentational form from a object form
  formatReverts(logs: any) {

    logs.forEach((log: any) => {
      let revert: string = `${log.fssaiRevert} by ${log.operatorInfo.employee_name} (${log.operatorInfo.employee_id}) on ${this.getFormatedDate(log.createdAt.toString())} at ${this.getFormattedTime(log.createdAt)}`;

      this.reverts.push(revert);
    });
  }

  onReceiptUpload($event: any) {
    this.paymentReceipt = $event.target.files[0];
    console.log(this.paymentReceipt);
  }

  getFiledData() {
    if(this.verifiedData){
      this._getDataService.getFoscosFiledData(this.verifiedData._id).subscribe({
        next: res => {
          if(res.success){
            this.filedStatus = true;
            this.filingForm.patchValue({'username': res.filedData.username});
            this.filingForm.patchValue({'password': res.filedData.password});
            this.filingForm.patchValue({'payment_amount': res.filedData.paymentAmount});
            this.filingForm.patchValue({'payment_date': new Date(res.filedData.paymentDate.toString())});
            this.receiptSrc = res.filedData.paymentReceipt;
            this.emitFilingResult.emit('Filed');
          }
        }
      });
    }
  }

  viewReceipt(): void {
    if(!this.receiptSrc) {
      this._toastrService.error('File Not Present')
      return
    }
    const modalRef = this._modalService.open(ViewDocumentComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.doc = {
      name:'Payment Receipt',
      format: 'pdf',
      src: []
    }
  }

  getFormatedDate(date: string): string {
    const originalDate = new Date(date);
    const year = originalDate.getFullYear();
    let formattedDate;
    if (Math.floor((new Date().getTime() - originalDate.getTime()) / (24 * 60 * 60 * 1000)) < 7) {
      formattedDate = days[originalDate.getDay()];
    } else {
      const month = months[originalDate.getMonth()];
      const day = String(originalDate.getDate()).padStart(2, '0');
      formattedDate = `${day}-${month}-${year}`;
    }
    return formattedDate;
  }

  getFormattedTime(dateString: string) {
    const originalDate = new Date(dateString);
    let hours = String(originalDate.getHours() % 12).padStart(2, '0');
    const minutes = String(originalDate.getMinutes()).padStart(2, '0');
    const meridiem = originalDate.getHours() >= 12 ? 'PM' : 'AM';
    const formattedTime = `${hours}:${minutes} ${meridiem}`;
    return formattedTime;
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

}
