import { Component, OnInit } from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { GetdataService } from 'src/app/services/getdata.service';
// import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';

@Component({
  selector: 'app-onboard-modal',
  templateUrl: './onboard-modal.component.html',
  styleUrls: ['./onboard-modal.component.scss']
})
export class OnboardModalComponent implements OnInit {
  businessForm: FormGroup = new FormGroup({
    owner_name: new FormControl(''),
    business_entity: new FormControl(''),
    business_category: new FormControl(''),
    business_ownership_type: new FormControl(''),
    contact_no: new FormControl(''),
    email: new FormControl(''),
    onboard_by: new FormControl('')
  });

  submitted = false;

  loading: boolean = false;

  empList: {_id: string, employee_name: string, employee_id: string}[];

  constructor(private formBuilder: FormBuilder, 
    private _registerService: RegisterService, 
    private _getDataService: GetdataService,
    public activeModal: NgbActiveModal, 
    private _toasterService: ToastrService) { }

  ngOnInit(): void {
    this.initForm();
    this.getEmpNameNIdList();
  }

  get businessform(): { [key: string]: AbstractControl } {
    return this.businessForm.controls;
  }

  initForm(): void {
    this.businessForm = this.formBuilder.group({
      owner_name: ['', Validators.required],
      business_entity: ['', Validators.required],
      business_category: ['', Validators.required],
      business_ownership_type: ['', Validators.required],
      contact_no: ['', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]],
      email: ['', [Validators.required, Validators.email]],
      onboard_by: ['', Validators.required]
    }); 
  }

   

  submitForm(): void {
    this.submitted = true;
    console.log(this.businessForm);
    if (this.businessForm.invalid) {
      return;
    }

    const formData = this.businessForm.value;
    console.log(formData);
    this.loading = true;
    // this._toasterService.success('You Are Successfully Onboarded', '', { timeOut: 1500, easeTime: 700});
    
    this._registerService.addbo(this.businessForm.value).subscribe({
      next: res => {
        this.loading = false;
        this._toasterService.success(res.message);
        this.activeModal.close();
      }, 
      error: err => {
        this.loading = false;
        if(err.error){
          if(err.error.emailErr){
            this._toasterService.error('Use some Another Mail', 'Email Already Exsists')
          }
          if(err.error.contactErr){
            this._toasterService.error('Use some Another Contact', 'Contact Already Exsists')
          }
        }
      }
    });

  }

  getEmpNameNIdList(): void {
    this._getDataService.getEmpNameNIdList().subscribe({
      next: res => {
        console.log(res);
        this.empList = res;
      }
    });
  }
 
  resetForm(): void {
    this.submitted = false;
    this.businessForm.reset();
  }

}
