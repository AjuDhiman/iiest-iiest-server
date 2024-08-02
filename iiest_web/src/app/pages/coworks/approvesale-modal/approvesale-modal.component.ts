import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { RegisterService } from 'src/app/services/register.service';

@Component({
  selector: 'app-approvesale-modal',
  templateUrl: './approvesale-modal.component.html',
  styleUrls: ['./approvesale-modal.component.scss']
})
export class ApprovesaleModalComponent implements OnInit{

  //loading vars
  loading: boolean = false;

  //var that contains refrence of get cowork invoice list func of cowork invoice component
  refreshCoworkInvoiceList: Function;

  //form related vars
  submitted: boolean = false;

  saleInfo: any;

  approvalForm: FormGroup = new FormGroup({
    receivedNarration: new FormControl(''),
    receivedDate: new FormControl(''),
    receviedAmount: new FormControl('')
  })

  get approvalform(): { [key: string]: AbstractControl } {
    return this.approvalForm.controls;
  }

  //constructor 
  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private _registerService: RegisterService,
    private _tostrService: ToastrService
  ) {

  }

  ngOnInit(): void {
    this.setFormValidation();
  }

  //methords 
  onSubmit(): void {

    //retirn while loading ot if form is invalid
    if (this.approvalForm.invalid || this.loading) {
      return
    }

    this.loading = true;

    this._registerService.updateReceivingInfo(this.saleInfo._id, this.approvalForm.value).subscribe({
      next: res => {
        console.log(res);
        this.loading = false;
        this.activeModal.close();
        this._tostrService.success('Sale Approved');
        //refresh invoice list after approval
        this.refreshCoworkInvoiceList();
      }
    })
  }

  //setting form validation
  setFormValidation(): void {
    this.approvalForm = this.formBuilder.group({
      receivedNarration: ['', Validators.required],
      receivedDate: ['', Validators.required],
      receviedAmount: ['', Validators.required]
    })
  }
}
