import { Component, OnInit } from '@angular/core';
import { loginEmployee, forgotPassword, } from 'src/app/utils/registerinterface'
import { RegisterService } from 'src/app/services/register.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, Validators, FormControl, FormBuilder, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { faLock, faUser, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';

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
    private toastrService: ToastrService
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
          this.route.navigateByUrl('/home')
        },
        error: (err) => {
          let errorObj = err.error
          this.toastrService.error('Message Error!', errorObj.message);
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
        this.toastrService.success(res.message); // Display success message
        this.openNewPasswordModal(newPasswordModal); // Open the new password modal
      },
      error: (err) => {
        this.toastrService.error('Reset Password Error!', err.error.message);
        this.error = true;
        this.errorMgs = err.error.message;
      }
    });
  }


  openNewPasswordModal(newPasswordModal: any): void {
    this.modalService.dismissAll();
    this.modalService.open(newPasswordModal, { size: 'md', backdrop: 'static' }); // Use the template variable name
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
        this.toastrService.success(res.message);
        this.activeModal.close();
      },
      error: (err) => {
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

