import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormGroup, Validators, FormControl, FormBuilder, AbstractControl } from '@angular/forms';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { EmployeeState } from 'src/app/store/state/employee.state';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { UpdateEmployee } from 'src/app/store/actions/employee.action';
import { stateName } from 'src/app/utils/config';
import { RegisterService } from 'src/app/services/register.service';
import { GetdataService } from 'src/app/services/getdata.service';
import { Employee, pincodeData } from 'src/app/utils/registerinterface';
import Validation from 'src/app/utils/validation';
import { UtilitiesService } from 'src/app/services/utilities.service';

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
  panelTypes: string[] = [];
  projects: string[] = [];
  getProjectData: any;
  payBands: string[];
  formType: string = "Registration";
  isEditMode: boolean = false;
  postsData: any;
  isFirstPostChecked: boolean | undefined = undefined; // initially we want post type to be unselected so we assigen it niether true nor false
  post_type: string;
  department: string;
  post_types: string[] = [];
  departments: string[] = [];
  designations: string[] = [];
  loading: boolean = false;
  //New Variables for pincode data
  stateName=stateName
  cities:string[]=[];
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
    panel_type: new FormControl(''),
    project_name: new FormControl(''),
    doj: new FormControl(''),
    post_type: new FormControl(''),
    department: new FormControl(''),
    designation: new FormControl(''),
    salary: new FormControl(''),
    pay_band: new FormControl(''),
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
    private _utilService: UtilitiesService,
    private store: Store) {
    this.getPostsData();
    this.empGeneralData();
  }

  //var relarte to uplading empp files to server 
  empSignature: string;
  empImage: string;
  // imageFormat: string;
  // signatureFormat: string;

  ngOnInit(): void {
    this.userData = this._registerService.LoggedInUserData();
    this.parsedUserData = JSON.parse(this.userData);
    this.userName = this.parsedUserData.employee_name;
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
        panel_type: ['', Validators.required],
        doj: ['', Validators.required],
        project_name: ['', Validators.required],
        post_type: ['', Validators.required],
        department: ['', Validators.required],
        designation: ['', Validators.required],
        salary: ['', Validators.required], // Set a default value
        pay_band: ['', Validators.required], // Set a default value
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
        employeeImage: ['', [Validators.required, this.validateFileType(['png', 'jpg', 'jpeg'])]],
        address: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        country: ['India', Validators.required],
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

    this.form.patchValue({ createdBy: `${this.userName}(${this.parsedUserData.employee_id})` });

  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  //methord for submitting the form
  async onSubmit() {
    this.submitted = true;
    // return;
    if (this.form.invalid) {
      return;
    }
    this.loading = true;

    this.form.value.dob = this.datePipe.transform(this.form.value.dob, 'yyyy-MM-dd');
    this.form.value.doj = this.datePipe.transform(this.form.value.doj, 'yyyy-MM-dd');

    //uploading employee Images ans signtures
    await this.uploadEmpSignature();
    await this.uploadEmpImage();
    

    if (this.isEditMode) {
      this.editedData = this.form.value;
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
          switch (true) {
            case (errorObj.userError): this._registerService.signout();
              break;
            case (errorObj.emailErr): this._toastrService.error('Message Error!', errorObj.emailErr);
              break;
            case (errorObj.contactErr): this._toastrService.error('Message Error!', errorObj.contactErr);
              break;
            case (errorObj.alternateContactErr): this._toastrService.error('Message Error!', errorObj.alternateContactErr);
              break;
            case (errorObj.addressErr): this._toastrService.error('Message Error!', errorObj.addressErr);
              break;
          }
          // if (errorObj.userError) {
          //   this._registerService.signout();
          // } else if (errorObj.emailErr) {
          //   this._toastrService.error('Message Error!', errorObj.emailErr);
          // } else if (errorObj.contactErr) {
          //   this._toastrService.error('Message Error!', errorObj.contactErr);
          // } else if (errorObj.alternateContactErr) {
          //   this._toastrService.error('Message Error!', errorObj.alternateContactErr);
          // } else if (errorObj.addressErr) {
          //   this._toastrService.error('Message Error!', errorObj.addressErr);
          // }
        }
      })
    } else {
      this.addemployee = {...this.form.value, empSignature: this.empSignature, employeeImage: this.empImage}
      this._registerService.addEmployee(this.addemployee).subscribe({
        next: (response) => {
          if (response.success) {
            this._toastrService.success('', 'Record Added Successfully.');
            this.onReset();
          } else {
            this._toastrService.error('', 'Some Error Occured');
          }
        },
        error: (err) => {
          this.loading = false;
          let errorObj = err.error
          switch (true) {
            case errorObj.userError: this._registerService.signout();
              break;
            case errorObj.emailErr: this._toastrService.error('', 'This Email Already Exists.');
              break;
            case errorObj.contactErr: this._toastrService.error('', 'This Contact Number Already Exists.');
              break;
            case errorObj.alternateContactErr: this._toastrService.error('', 'This Alternate Contact Already Exists.');
              break;
            case errorObj.addressErr: this._toastrService.error('', 'This Address Already Exists.');
              break;
            case errorObj.imageErr: this._toastrService.error('', 'Could Not Upload Image.');
              break;
            case errorObj.signatureErr: this._toastrService.error('', 'Could Not Upload Signature.');
              break;
            case errorObj.randomErr: this._toastrService.error('', 'Some Error Occurred. Please Try Again.');
              break;
          }
        },
        complete: () => {
          this.loading = false; // stop loading on completion either error or resolve
        }
      });
    }
  }

  onReset(): void {
    this.submitted = false;
    this.isFirstPostChecked = undefined;
    this.departments = [];
    this.designations = [];
    this.form.reset();
    this.f['country'].setValue('India'); // We want default value of country be India even after form reset 
  }


  empGeneralData() {
    this._getdataService.getGeneralData().subscribe({
      next: (res) => {
        this.getProjectData = Object.values(res.project_name);
        this.projects = this.getProjectData.map((item:any) => item.name);
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
    this.isEditMode = param.isEditMode;
    const record = param.Record;
    this.objId = record._id
    this.formType = "Edit"
    this.form.setValue({
      'employee_name': record.employee_name,
      'gender': record.gender,
      'dob': this.datePipe.transform(record.dob, 'yyyy-MM-dd'),
      'email': record.email,
      'company_name': record.company_name,
      'panel_type': record.panel_type,
      'project_name': record.project_name,
      'doj': this.datePipe.transform(record.doj, 'yyyy-MM-dd'),
      'department': record.department,
      'designation': record.designation,
      'salary': record.salary,
      'pay_band': record.pay_band,
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
    this.form.get('pay_band')?.setValue('');
    this.post_type = postVal;
    this.departments = [];
    this.designations = [];
    this.payBands = [];
    this.departments = this.postsData.find((post: any) => post.name === this.post_type).departments
      .map((department: any) => department.name);
    this.payBands=this.postsData.find((post: any) => post.name === this.post_type).pay_bands;
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

  fetchSelectedPostData(type: string) {
    this.f['post_type'].patchValue(type);
    this.departments = [];
    this.designations = [];
    this.f['department'].patchValue(''); //every time when this onPostSelect() run we want department to be unset 
    this.f['designation'].patchValue(''); //every time when this onPostSelect() run we want designation to be unset 
    this.departments = this.postsData.find((post: any) => post.name === this.post_type).departments
      .map((department: any) => department.name);
  }

  onDepartmentSelect() {
    this.department = this.f['department'].value;
    this.f['designation'].patchValue(''); //every time when this onPostSelect() run we want designation to be unset 
    this.designations = this.postsData.find((post: any) => post.name === this.post_type).departments
      .find((department: any) => department.name === this.department).designations
      .map((designation: any) => designation.name);
  }

  onProjectSelect() { //we want panel types to be filtered on the basis of project type
    this.panelTypes=[];
    this.f['panel_type'].setValue(''); // we want to reset panels on selection of projects
    let project_name = this.f['project_name'].value;
    this.panelTypes = this.getProjectData
      .find((project: any) => project.name === project_name).panel_type;
  }

  onStateSelect(){
    let state = this.f['state'].value;
    this.cities=[];
    this.f['city'].setValue('');
    this.loading=true;
    this._getdataService.getPincodesData(state).subscribe({
      next: (res) => {
        let pincodesData = res;
        pincodesData.forEach((obj: pincodeData) => {
          if (!this.cities.find((item: string) => item.toLowerCase() === obj.City.toLowerCase())) {
            this.cities.push(obj.City);
          }
        })
      },
      error: (err) => {
        let errorObj = err.error
        // if (errorObj.userError) {
        //   this._registerService.signout();
        // }
      },
      complete: () => {
        this.loading = false;
      }
    }
    )
  }

  onSignatureEnter($event: any) {
    if ($event.target.files && $event.target.files[0]) {
      let file = $event.target.files[0];
      if (file.type == "image/png") {
        this.signatureFile = file;
        this.empSignature = `sign${new Date().getTime()}.${this._utilService.getExtention(this.signatureFile.name)}`;
      }
      else {
        //call validation
        // this.f['empSignature'].setValue('');
      }
    }
  }

  onEmpImageChange($event: any) {
    if ($event.target.files && $event.target.files[0]) {
      let file = $event.target.files[0];
      if (file.type == "image/png" || file.type == "image/jpeg") {
        this.empImageFile = file;
        this.empImage = `image${new Date().getTime()}.${this._utilService.getExtention(this.empImageFile.name)}`;
      }
      else {
        //call validation
      }
    }
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

  //methord for uploading e,mployee signature
  uploadEmpSignature(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._getdataService.getEmployeeDocUploadURL(this.empSignature, this.signatureFile.type).subscribe({
        next: res => {
          this._registerService.uplaodDocstoS3(res.uploadUrl, this.signatureFile).subscribe({
            next: res => {
              resolve(res);
              // this.form.patchValue({'empSignature': this.empSignature});
              // this._toastrService.success('Done')
            },
            error: err => {
              this.loading = false;
              reject(err);
              this._toastrService.error('Signature Uploading Problem')
            }
          });
        }
      })
    })
  }

   //methord for uploading e,mployee image
   uploadEmpImage(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._getdataService.getEmployeeDocUploadURL(this.empImage, this.empImageFile.type).subscribe({
        next: res => {
          this._registerService.uplaodDocstoS3(res.uploadUrl, this.empImageFile).subscribe({
            next: res => {
              // this.form.patchValue({'employeeImage': this.empImage});
              resolve(res);
              // this._toastrService.success('Done')
            },
            error: err => {
              this.loading = false;
              reject(err);
              this._toastrService.error('Image Uploading Problem')
            }
          });
        }
      })
    })
  }
}