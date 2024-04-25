import { Component, OnInit } from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
// import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';

@Component({
  selector: 'app-onboard-modal',
  templateUrl: './onboard-modal.component.html',
  styleUrls: ['./onboard-modal.component.scss']
})
export class OnboardModalComponent implements OnInit {
  businessForm: FormGroup;

  submitted = false;

  constructor(private fb: FormBuilder, 
    private _registerService: RegisterService, 
    public activeModal: NgbActiveModal, 
    private _toasterService: ToastrService) { }

  ngOnInit(): void {
    this.initForm();
  }

  get function(): { [key: string]: AbstractControl } {
    return this.businessForm.controls;
  }

  initForm(): void {
    this.businessForm = this.fb.group({
      owner_name: ['', Validators.required],
      business_entity: ['', Validators.required],
      business_category: ['', Validators.required],
      business_ownership_type: ['', Validators.required],
      contact_no: ['', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]],
      email: ['', [Validators.required, Validators.email]]
    }); 
  }

   

  submitForm(): void {
    if (this.businessForm.valid) {
      this.submitted = true;
      const formData = this.businessForm.value;
      console.log(formData);
      // this._toasterService.success('You Are Successfully Onboarded', '', { timeOut: 1500, easeTime: 700});
      
      this._registerService.addbo(this.businessForm.value).subscribe({
        next: res => {
          this._toasterService.success(res.message);

        }
      })

      this.activeModal.close();
    } else {
      this.markFormTouched(this.businessForm);
    }
  }

 
  resetForm(): void {
    this.submitted = false;
    this.businessForm.reset();
  }


  markFormTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup) {
        this.markFormTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }
}
