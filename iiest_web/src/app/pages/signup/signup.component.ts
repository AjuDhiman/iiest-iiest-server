import { Component, OnInit } from '@angular/core';
import { Employee } from '../../utils/registerinterface'
import { DatePipe } from '@angular/common';
import { FormGroup, Validators, FormControl, FormBuilder, AbstractControl } from '@angular/forms';
import { RegisterService } from '../../services/register.service';
import { GetdataService } from '../../services/getdata.service'
import Validation from '../../utils/validation'
import { NgbDate, NgbDateStruct, NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { EmployeeState } from 'src/app/store/state/employee.state';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { GetEmployee, UpdateEmployee } from 'src/app/store/actions/employee.action';

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
  addemployee: Employee;
  dob: NgbDateStruct;
  getEmpGeneralData: any;
  getPortalType: any;
  getProjectName: any;
  getGradePay: any;
  formType: string = "Registration";
  isEditMode: boolean = false;
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
    createdBy: new FormControl('')
  });
  submitted = false;
  dobValue: Date;
  dojValue: Date;
  signature_file: File;
  constructor(
    private formBuilder: FormBuilder,
    private calendar: NgbCalendar,
    private datePipe: DatePipe,
    private _registerService: RegisterService,
    private _toastrService: ToastrService,
    private _getdataService: GetdataService,
    private store: Store) {
    this.empGeneralData();
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
        signature: [null, [Validators.required, this.validateFileType(['png'])]],
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

    this.form.patchValue({ createdBy: `${this.userName}(${this.parsedUserData.employee_id})` });
    console.log(this.calendar.getToday());

  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    console.log(this.signature_file);
    console.log(this.form);
    if (this.form.invalid) {
      return;
    }

    this.form.value.dob = this.datePipe.transform(this.form.value.dob, 'yyyy-MM-dd');
    this.form.value.doj = this.datePipe.transform(this.form.value.doj, 'yyyy-MM-dd');

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
      this.addemployee = this.form.value;
      this._registerService.addEmployee(this.addemployee).subscribe({
        next: (response) => {
          if (response.success) {
            this._toastrService.success('Record Added Successfully', response.message);
            this.onReset();
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
      });
    }
  }

  onReset(): void {
    this.submitted = false;
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
      //'acceptTerms': record.,
      'createdBy': record.createdBy
    })
  }

  onSignatureEnter(event: any) {
    this.signature_file = event.target.files[0];
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