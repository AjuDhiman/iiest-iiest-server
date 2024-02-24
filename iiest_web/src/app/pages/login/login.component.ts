import { Component, OnInit} from '@angular/core';
import { loginEmployee, forgotPassword } from '../../utils/registerinterface'
import { RegisterService } from '../../services/register.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, Validators, FormControl, FormBuilder, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { faLock, faUser, faEnvelope} from '@fortawesome/free-solid-svg-icons';
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
    loginemployee :loginEmployee;
    forgotpassword :forgotPassword;

     /*Login form Group*/
    form: FormGroup = new FormGroup({
      username: new FormControl(''),
      password: new FormControl('')
    });

    /*Forgot password form Group*/
    formFp:FormGroup = new FormGroup({
        email: new FormControl('')
    });
    submitted = false;
    submittedFP =false;
    error:boolean = false;
    errorMgs:string;

    constructor(
      private formBuilder: FormBuilder,
      private _registerService: RegisterService,
      public activeModal: NgbActiveModal,
      private modalService: NgbModal,
      private route:Router,
      private toastrService:ToastrService
      ){}

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
    }

    get f(): { [key: string]: AbstractControl } {
      return this.form.controls;
    }
    get forgotPass(): { [key: string]: AbstractControl } {
      return this.formFp.controls;
    }
/**********************Login Method Start *******************/
    loginForm(){
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
          this.route.navigateByUrl('/home')
        },
        error: (err) => {
          let errorObj = err.error
          this.toastrService.error('Message Error!', errorObj.message);
          this.error = true;
          this.errorMgs = errorObj.message 
        },
        complete: () =>{ 
          console.info('complete')
        }
    });
 }
/**********************Forgot Password modal open *******************/
    openFpModal(fp:any){
      this.activeModal.close();
      this.modalService.open(fp, { size: 'md', backdrop: 'static' });     
    }
/**********************Reset Password modal open *******************/
    resetPassword(){
      this.submittedFP = true;
      if (this.formFp.invalid) {
        return;
      }
      console.log(this.loginemployee);
      this._registerService.loginEmployee(this.loginemployee)
      .subscribe({
        next: (res) => { 
          console.log(res)
          sessionStorage.setItem('token', res.authToken);
          this.activeModal.close();
          this.route.navigate(['/home']); 
        },
        error: (err) => {
          let errorObj = err.error
          this.error = true;
          this.errorMgs = errorObj.message
        },
        complete: () =>{ 
          console.info('complete')
        }
    });

    }

    closeModal(){
      this.activeModal.close();
    }
}

