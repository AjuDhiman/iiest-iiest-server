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
  //Logical Reactive angular form
  businessForm: FormGroup = new FormGroup({
    owner_name: new FormControl(''),
    business_entity: new FormControl(''),
    business_category: new FormControl(''),
    manager_name: new FormControl(''),
    business_ownership_type: new FormControl(''),
    contact_no: new FormControl(''),
    email: new FormControl(''),
    onboard_by: new FormControl('')
  });

  //var for traicking if submit button is clicked or not
  submitted = false;

  //var for turning on and off the loader
  loading: boolean = false;

  //list of all active sales executive who can onboard 
  empList: {_id: string, employee_name: string, employee_id: string}[];

  constructor(private formBuilder: FormBuilder, 
    private _registerService: RegisterService, 
    private _getDataService: GetdataService,
    public activeModal: NgbActiveModal, 
    private _toasterService: ToastrService) { }

  ngOnInit(): void {
    this.setFormValidation();
    this.getEmpNameNIdList();
  }

  get businessform(): { [key: string]: AbstractControl } {
    return this.businessForm.controls;
  }

  setFormValidation(): void { //methord for setting form validation
    this.businessForm = this.formBuilder.group({
      owner_name: ['', Validators.required],
      business_entity: ['', Validators.required],
      business_category: ['', Validators.required],
      business_ownership_type: ['', Validators.required],
      manager_name: ['', Validators.required],
      contact_no: ['', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]],
      email: ['', [Validators.required, Validators.email]],
      onboard_by: ['', Validators.required]
    }); 
  }

   

  submitForm(): void {//func will run ater submit button is clicked
    this.submitted = true;
    if (this.businessForm.invalid || this.loading) { // we dont't want to submit form wile loading and in case of invalid form
      return;
    }

    this.loading = true;
    // this._toasterService.success('You Are Successfully Onboarded', '', { timeOut: 1500, easeTime: 700});
    
    this._registerService.addbo(this.businessForm.value).subscribe({ //api for creating new bo object
      next: res => {
        this.loading = false;//setting off loading on success
        this._toasterService.success(res.message);
        this.activeModal.close();//close the onboard modal on success
      }, 
      error: err => {
        this.loading = false;//setting off the loading after api fail
        if(err.error){
          if(err.error.emailErr){//error if same email exsists in db            this._toasterService.error('Use some Another Mail', 'Email Already Exsists')
          }
          if(err.error.contactErr){//error if same contact no exsists in db        
            this._toasterService.error('Use some Another Contact', 'Contact Already Exsists')
          }
        }
      }
    });

  }

  getEmpNameNIdList(): void { //methord for getting all active sales man list for showing in onboard form
    this._getDataService.getEmpNameNIdList().subscribe({
      next: res => {
        this.empList = res;
      }
    });
  }
 
  resetForm(): void {//reset onboard form
    this.submitted = false;
    this.businessForm.reset();
  }

}
