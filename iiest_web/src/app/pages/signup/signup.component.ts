import { Component, OnInit } from '@angular/core';
import { Employee } from '../../utils/registerinterface'
import { DatePipe } from '@angular/common';
import { FormGroup, Validators, FormControl, FormBuilder, AbstractControl } from '@angular/forms';
import { RegisterService } from '../../services/register.service';
import { GetdataService } from '../../services/getdata.service'
import Validation from '../../utils/validation'
import {  NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { EmployeeState } from 'src/app/store/state/employee.state';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { UpdateEmployee } from 'src/app/store/actions/employee.action';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})

export class SignupComponent implements OnInit {
  @Select(EmployeeState.GetEmployeeList) employees$: Observable<Employee>;
  userData: any;
  objId: string;
  editedData: any;
  userName: string = '';
  parsedUserData: any;
  addemployee: any;
  dob: NgbDateStruct;
  getEmpGeneralData: any;
  getPortalType: any;
  getProjectName: any;
  getGradePay: any;
  formType: string = "Registration";
  isEditMode: boolean = false;
  postsData: any;
  isFirstPostChecked:boolean|undefined = undefined; // initially we want post type to be unselected so we assigen it niether true nor false
  post_type: string;
  department: string;
  post_types:string[] = [];
  departments:string[] = [];
  designations: string[] = [];
  //New Variables for pincode data
  pincodesData: Array<Object>;
  form: FormGroup = new FormGroup({
    employee_name: new FormControl(''),
    gender: new FormControl(''),
    dob: new FormControl(''),
    //username: new FormControl(''),
    email: new FormControl(''),
    //password: new FormControl(''),
    //confirmPassword: new FormControl(''),
    company_name: new FormControl(''),
    //employee_id: new FormControl(''),
    portal_type: new FormControl(''),
    project_name: new FormControl(''),
    doj: new FormControl(''),
    post_type: new FormControl(''),
    department: new FormControl(''),
    designation: new FormControl(''),
    salary: new FormControl(''),
    grade_pay: new FormControl(''),
    contact_no: new FormControl(''),
    alternate_contact: new FormControl(''),
    address: new FormControl(''),
    city: new FormControl(''),
    state: new FormControl(''),
    country: new FormControl(''),
    zip_code: new FormControl(''),
    //acceptTerms: new FormControl(false),
    createdBy: new FormControl(''),
    empSignature: new FormControl(''),
    employeeImage: new FormControl('')
  });
  submitted = false;
  dobValue: Date;
  dojValue: Date;
  signatureFile: File;
  empImageFile: File;
  constructor(
    private formBuilder: FormBuilder,
    private calendar: NgbCalendar,
    private datePipe: DatePipe,
    private _registerService: RegisterService,
    private _toastrService: ToastrService,
    private _getdataService: GetdataService,
    private store: Store) {
    this.empGeneralData();
    this.getPostsData();
    // this.getPincodesData();
  }

  ngOnInit(): void {
    this.userData = this._registerService.LoggedInUserData();
    this.parsedUserData = JSON.parse(this.userData);
    this.userName = this.parsedUserData.employee_name;
    console.log(this._registerService.msg);
    this.dobValue;
    this.dojValue;
    this.form = this.formBuilder.group(
      {
        employee_name: ['', Validators.required],
        gender: ['', Validators.required],
        dob: ['', Validators.required],
        email: ['',
          [
            Validators.required,
            Validators.email,
          ],
        ],
        company_name: ['', Validators.required],
        portal_type: ['', Validators.required],
        doj: ['', Validators.required],
        project_name: ['', Validators.required],
        post_type:['', Validators.required],
        department: ['', Validators.required],
        designation: ['', Validators.required],
        salary: ['', Validators.required], // Set a default value
        grade_pay: ['', Validators.required], // Set a default value
        contact_no: ['',
          [
            Validators.required,
            Validators.pattern(/^[0-9]{10}$/)
          ]
        ],
        alternate_contact: ['',
          [
            Validators.required,
            Validators.pattern(/^[0-9]{10}$/)
          ]
        ],
        empSignature: ['', [Validators.required, this.validateFileType(['png'])]],
        employeeImage: ['', [Validators.required, this.validateFileType(['png','jpg'])]],
        address: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        country: ['', Validators.required],
        zip_code: ['',
          [
            Validators.required,
            Validators.pattern(/^[0-9]{6}$/)
          ],
        ],
        //acceptTerms: [false, Validators.requiredTrue],
        createdBy: ['', Validators.required]
      },
      {
        validators: [Validation.match('password', 'confirmPassword')],
      }
    );

    console.log(this.calendar.getToday());

    this.form.patchValue({ createdBy: `${this.userName}(${this.parsedUserData.employee_id})` });

  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    //return;
    if (this.form.invalid) {
      return;
    }


    this.form.value.dob = this.datePipe.transform(this.form.value.dob, 'yyyy-MM-dd');
    this.form.value.doj = this.datePipe.transform(this.form.value.doj, 'yyyy-MM-dd');

    const formData = new FormData();
    formData.append('employee_name', this.form.get('employee_name')?.value);
    formData.append('gender', this.form.get('gender')?.value);
    formData.append('dob', this.form.get('dob')?.value);
    formData.append('email', this.form.get('email')?.value);
    formData.append('company_name', this.form.get('company_name')?.value);
    formData.append('portal_type', this.form.get('portal_type')?.value);
    formData.append('doj', this.form.get('doj')?.value);
    formData.append('project_name', this.form.get('project_name')?.value);
    formData.append('department', this.form.get('department')?.value);
    formData.append('designation', this.form.get('designation')?.value);
    formData.append('post_type', this.form.get('post_type')?.value)
    formData.append('salary', this.form.get('salary')?.value);
    formData.append('grade_pay', this.form.get('grade_pay')?.value);
    formData.append('contact_no', this.form.get('contact_no')?.value);
    formData.append('alternate_contact', this.form.get('alternate_contact')?.value);
    formData.append('empSignature', this.signatureFile);
    formData.append('employeeImage', this.empImageFile);
    formData.append('address', this.form.get('address')?.value);
    formData.append('city', this.form.get('city')?.value);
    formData.append('state', this.form.get('state')?.value);
    formData.append('country', this.form.get('country')?.value);
    formData.append('zip_code', this.form.get('zip_code')?.value);
    formData.append('createdBy', this.form.get('createdBy')?.value);

    if (this.isEditMode) {
      this.editedData = this.form.value;
      console.log(this.editedData);
      this._registerService.updateEmployee(this.objId, this.editedData, `${this.userName}(${this.parsedUserData.employee_id})`).subscribe({
        next: (response) => {
          if (response.success) {
            this.store.dispatch(new UpdateEmployee(this.objId, this.editedData));
            this._toastrService.success('Record Edited Successfully', response.message);
            this.backToRegister();
          } else {
            this._toastrService.error('Message Error!', response.message);
          }
        },
        error: (err) => {
          let errorObj = err.error
          if (errorObj.userError) {
            this._registerService.signout();
          } else if (errorObj.emailErr) {
            this._toastrService.error('Message Error!', errorObj.emailErr);
          } else if (errorObj.contactErr) {
            this._toastrService.error('Message Error!', errorObj.contactErr);
          } else if (errorObj.alternateContactErr) {
            this._toastrService.error('Message Error!', errorObj.alternateContactErr);
          } else if (errorObj.addressErr) {
            this._toastrService.error('Message Error!', errorObj.addressErr);
          }
        }
      })
    } else {
      this.addemployee = formData
      console.log(this.addemployee);
      this._registerService.addEmployee(this.addemployee).subscribe({
        next: (response) => {
          console.log(response);
          if (response.success) {
            this._toastrService.success('', 'Record Added Successfully.');
            this.onReset();
          } else {
            this._toastrService.error('', 'Some Error Occured');
          }
        },
        error: (err) => {
          let errorObj = err.error
          if (errorObj.userError) {
            this._registerService.signout();
          } else if (errorObj.emailErr) {
            this._toastrService.error('', 'This Email Already Exists.');
          } else if (errorObj.contactErr) {
            this._toastrService.error('', 'This Contact Number Already Exists.');
          } else if (errorObj.alternateContactErr) {
            this._toastrService.error('', 'This Alternate Contact Already Exists.');
          } else if (errorObj.addressErr) {
            this._toastrService.error('', 'This Address Already Exists.');
          } else if (errorObj.imageErr) {
            this._toastrService.error('', 'Could Not Upload Image.');
          } else if (errorObj.signatureErr){
            this._toastrService.error('', 'Could Not Upload Signature.');
          } else if(errorObj.randomErr){
            this._toastrService.error('', 'Some Error Occured. Please Try Again.');
          }
        }
      });
    }
  }

  onReset(): void {
    this.submitted=false;
    this.isFirstPostChecked=undefined;
    this.departments=[];
    this.designations=[];
    this.form.reset();
  }


  empGeneralData() {
    this._getdataService.getGeneralData().subscribe({
      next: (res) => {
        this.getPortalType = Object.values(res.portal_type);
        this.getProjectName = Object.values(res.project_name);
        this.getGradePay = Object.values(res.grade_pay);
      },
      error: (err) => {
        let errorObj = err.error
        if (errorObj.userError) {
          this._registerService.signout();
        }
      }
    })
  }

  backToRegister() {
    this.submitted = false;
    this.isEditMode = false;
    this.form.reset();
  }

  isEditRecord(param: any) {
    console.log(param.Record);
    this.isEditMode = param.isEditMode;
    const record = param.Record;
    this.objId = record._id
    console.log(record);
    this.formType = "Edit"
    this.form.setValue({
      'employee_name': record.employee_name,
      'gender': record.gender,
      'dob': this.datePipe.transform(record.dob, 'yyyy-MM-dd'),
      'email': record.email,
      'company_name': record.company_name,
      'portal_type': record.portal_type,
      'project_name': record.project_name,
      'doj': this.datePipe.transform(record.doj, 'yyyy-MM-dd'),
      'department': record.department,
      'designation': record.designation,
      'salary': record.salary,
      'grade_pay': record.grade_pay,
      'contact_no': record.contact_no,
      'alternate_contact': record.alternate_contact,
      'address': record.address,
      'city': record.city,
      'state': record.state,
      'country': record.country,
      'zip_code': record.zip_code,
      'createdBy': record.createdBy,
      'post_type': record.post_type
    })
  }

  onPostSelect(postVal: string) { // this function runs when post type changes employee register form and it sets the deparments array
    this.form.get('department')?.setValue('');
    this.form.get('designation')?.setValue('');
    this.post_type = postVal;
    this.departments = [];
    this.designations = [];
    this.departments = this.postsData.find((post:any) => post.name === this.post_type).departments
    .map((department:any) => department.name);
  }

  getPostsData() {  // this function retrives post data and save into variable by the help of getdataservice
    this._getdataService.getPostData().subscribe({
      next: (res) => {
        this.postsData = res;
        this.postsData.forEach((post: any) => {
          if (post.departments) {
            this.post_types.push(post.name);
          }
        });
      },
      error: (err) => {
        let errorObj = err.error
        if (errorObj.userError) {
          this._registerService.signout();
        }
      }
    }
    )
  }

  // getPincodesData() {  // this function retrives post data and save into variable by the help of getdataservice
  //   this._getdataService.getPincodesData().subscribe({
  //     next: (res) => {
  //       console.log(res);
  //       this.pincodesData = res;
  //       // this.postsData.forEach((post: any) => {
  //       //   if (post.departments) {
  //       //     this.post_types.push(post.name);
  //       //   }
  //       // });
  //     },
  //     error: (err) => {
  //       let errorObj = err.error
  //       if (errorObj.userError) {
  //         this._registerService.signout();
  //       }
  //     }
  //   }
  //   )
  // }

  fetchSelectedPostData(type:string){
    this.f['post_type'].patchValue(type);
    this.departments = [];
    this.designations = [];
    this.f['department'].patchValue(''); //every time when this onPostSelect() run we want department to be unset 
    this.f['designation'].patchValue(''); //every time when this onPostSelect() run we want designation to be unset 
    this.departments = this.postsData.find((post:any) => post.name === this.post_type).departments
    .map((department:any) => department.name);
  }

  onDepartmentSelect() {
    this.department = this.f['department'].value;
    this.f['designation'].patchValue(''); //every time when this onPostSelect() run we want designation to be unset 
    this.designations = this.postsData.find((post:any) => post.name === this.post_type).departments
    .find((department:any) => department.name === this.department).designations
    .map((designation:any) => designation.name);
  }

  onSignatureEnter($event: any) {
    if ($event.target.files && $event.target.files[0]) {
      let file = $event.target.files[0];
      console.log(file);
        if(file.type == "image/png") {
          console.log("correct");
          this.signatureFile = file;
          console.log(this.signatureFile);
        }
        else {
          //call validation
          // this.f['empSignature'].setValue('');
        }
    }
  }

  onEmpImageChange($event: any){
    if ($event.target.files && $event.target.files[0]) {
      let file = $event.target.files[0];
      console.log(file);
        if(file.type == "image/png" || file.type == "image/jpg") {
          console.log("correct");
          this.empImageFile = file;
          console.log(this.empImageFile);
        }
        else {
          //call validation
        }
    }
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