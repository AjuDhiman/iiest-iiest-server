import { Component, OnInit, Input } from '@angular/core';
import { loginEmployee, forgotPassword, } from 'src/app/utils/registerinterface'
import { RegisterService } from 'src/app/services/register.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, Validators, FormControl, FormBuilder, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { faLock, faUser, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { Store } from '@ngxs/store';
import { ClearBos } from 'src/app/store/actions/bo.action';
import { ClearEmployees } from 'src/app/store/actions/employee.action';
import { ClearGSTList } from 'src/app/store/actions/gstlist.action';
import { ClearSales } from 'src/app/store/actions/sales.action';
import { ClearShops } from 'src/app/store/actions/shop.action';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  /*FontAwesome Icon*/
  falock = faLock;
  fauser = faUser;
  faenvelope = faEnvelope

  /*Interface*/
  loginemployee: loginEmployee;
  forgotpassword: forgotPassword;

  /*Login form Group*/
  form: FormGroup = new FormGroup({
    username: new FormControl(''),
    password: new FormControl('')
  });

  /*Forgot password form Group*/
  formFp: FormGroup = new FormGroup({
    email: new FormControl('')
  });
  formNewPassword: FormGroup = new FormGroup({
    temporaryPassword: new FormControl(''),
    newPassword: new FormControl(''),
    confirmPassword: new FormControl('')
  });
  @Input() userType:any ;
  submitted = false;
  submittedFP = false;
  error: boolean = false;
  errorMgs: string = '';
  temporaryPassword: string = '';
  newPasswordModal: any = '';

  constructor(
    private formBuilder: FormBuilder,
    private _registerService: RegisterService,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private route: Router,
    private toastrService: ToastrService,
    private _utilServices: UtilitiesService,
    private store: Store
  ) { }

  ngOnInit(): void {
    
    this.form = this.formBuilder.group(
      {
        username: ['', Validators.required],
        password: ['', Validators.required]
      });

    this.formFp = this.formBuilder.group(
      {
        email: ['',
          [
            Validators.required,
            Validators.email,
          ],
        ]
      });

    this.formNewPassword = this.formBuilder.group({
      username: ['', Validators.required],
      temporaryPassword: ['', Validators.required],
      newPassword: ['', Validators.required, ],
      confirmPassword: ['', Validators.required]
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }
  get forgotPass(): { [key: string]: AbstractControl } {
    return this.formFp.controls;
  }
  get fnp(): { [key: string]: AbstractControl } {
    return this.formNewPassword.controls;
  }

  /**********************Login Method Start *******************/
  loginForm() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
    this.loginemployee = this.form.value;
    this._registerService.loginEmployee(this.loginemployee)
      .subscribe({
        next: (res) => {
          this._registerService.storeToken(res);
          this.activeModal.close();
          const bodyElement = document.body;
          bodyElement.classList.add('app');
          //clearing the store on login
          this.store.dispatch(ClearBos);
          this.store.dispatch(ClearEmployees);
          this.store.dispatch(ClearGSTList);
          this.store.dispatch(ClearSales);
          this.store.dispatch(ClearShops);
          this._utilServices.setShopListData([]);
          this._utilServices.setData([]);
          console.log(this.userType);
          if(this.userType.userType === 'company'){
            this.route.navigateByUrl('/home')
          }else{
            
          }
        },
        error: (err) => {
          let errorObj = err.error
          this.toastrService.error('Internal Server Error!', errorObj.message && 'Please Check Your Internet Connection');
          this.error = true;
          this.errorMgs = errorObj.message
        },
        complete: () => {
          console.info('complete')
        }
      });
  }
  /**********************Forgot Password modal open *******************/
  openFpModal(fp: any) {
    this.activeModal.close();
    this.modalService.open(fp, { size: 'md', backdrop: 'static' });
  }
  /**********************Reset Password modal open *******************/
  /* Reset Password */
  resetPassword(newPasswordModal: any): void {
    this.submittedFP = true;
    if (this.formFp.invalid) {
      return;
    }

    const email = this.formFp.value.email; // Extract email from form value

    this._registerService.forgotPassword(email).subscribe({
      next: (res: any) => {
        this.temporaryPassword = res.temporaryPassword; // Capture temporary password from the API response
        console.log(this.temporaryPassword);
        this.toastrService.success(res.message); // Display success message
        this.openNewPasswordModal(newPasswordModal); // Open the new password modal
        this.submittedFP = false;
        
      },
      error: (err) => {
        this.toastrService.error('Reset Password Error!', err.error.message);
        this.error = true;
        this.errorMgs = err.error.message;
        this.submittedFP = false;
      }
    });
  }


  openNewPasswordModal(newPasswordModal: any): void {
    this.modalService.dismissAll();
    this.modalService.open(newPasswordModal, { size: 'md', backdrop: 'static' }); // Use the template variable name
    this.formNewPassword.patchValue({'temporaryPassword': ''})
  }

  /* Set New Password */
  setNewPassword(): void {
    if (this.formNewPassword.invalid) {
      return;
    }

    const { username, temporaryPassword, newPassword, confirmPassword } = this.formNewPassword.value;
    if (newPassword !== confirmPassword) {
      this.toastrService.error('Passwords do not match');
      return;
    }

    const email = this.formFp.value.email;

    this._registerService.resetPassword(username, email, temporaryPassword, newPassword).subscribe({
      next: (res: any) => {
        this.modalService.dismissAll();
        this.toastrService.success(res.message);
      },
      error: (err) => {
        // this.modalService.dismissAllc
        if (err.status === 401 && err.error.message === 'Temporary password is incorrect') {
          this.toastrService.error('Temporary password is incorrect');
        } else if (err.status === 404 && err.error.message === 'User not found') {
          this.toastrService.error('Username is incorrect');
        } else {
          this.toastrService.error('Reset Password Error!', err.error.message);
        }
        this.error = true;
        this.errorMgs = err.error.message;
      }
    });
  }

  closeModal() {
    this.activeModal.close();
  }
}

