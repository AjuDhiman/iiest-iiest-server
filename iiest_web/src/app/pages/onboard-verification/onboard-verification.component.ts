import { IconDefinition, faCheckCircle, faCircleXmark, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RegisterService } from 'src/app/services/register.service';

@Component({
  selector: 'app-onboard-verification',
  templateUrl: './onboard-verification.component.html',
  styleUrls: ['./onboard-verification.component.scss']
})
export class OnboardVerificationComponent implements OnInit, AfterViewInit{

  id:string;//id for finding record in Bo database
  type: string;
  //icons
  faCheckCircle: IconDefinition = faCheckCircle;
  faCircleExclamation: IconDefinition = faCircleExclamation;
  faCircleXmark:IconDefinition = faCircleXmark;

  status: 'ongoing'|'not-verified'|'verified' = 'ongoing';//restrict status to only 3 values
  loading: boolean = false;
  message: string = 'Verifing Email'; //Default Message

  constructor(private _registerService: RegisterService,
    private route: ActivatedRoute,
    private router: Router
  ){

  }

  ngOnInit(): void {
    const bodyElement = document.body;
    bodyElement.classList.remove('app'); //remove calss app from whole body for removing margins and padding related to it
    this.id = this.route.snapshot.params['id'];//getting id from route
    this.type = this.route.snapshot.params['type'];//getting type from route
    this.verifyMail(); // verify mail api
  }

  ngAfterViewInit(): void {
    const bodyElement = document.body;
    bodyElement.classList.remove('app');//remove calss app from whole body for removing margins and padding related to it
  }

  verifyMail(): void{
    this.loading = true; //turn on loading for while calling api

    if(this.type === 'bo') {
      this._registerService.verifyMail(this.id).subscribe({
        next: res => {
          this.loading = false; //setting loading off on success
          this.status = 'verified';
          this.message = res.message; //getting message from backend
          const timeOut = setTimeout(() => {
            this.router.navigate(['/']);
          }, 3000) //redirect after 3 sec of completion
        },
        error: err => {
          this.loading = false;//setting loading off on error
          this.status = 'not-verified';
          this.message = err.error.message;//getting message from backend
          const timeOut = setTimeout(() => {
            this.router.navigate(['/']);
          }, 3000)//redirect after 3 sec of completion
        }
      });
    } else if(this.type === 'fbo') {
      this._registerService.updateFboVerification(this.id).subscribe({
        next: res => {
          this.loading = false; //setting loading off on success
          this.status = 'verified';
          this.message = res.message; //getting message from backend
          const timeOut = setTimeout(() => {
            this.router.navigate(['/']);
          }, 3000) //redirect after 3 sec of completion
        },
        error: err => {
          this.loading = false;//setting loading off on error
          this.status = 'not-verified';
          this.message = err.error.message;//getting message from backend
          const timeOut = setTimeout(() => {
            this.router.navigate(['/']);
          }, 3000)//redirect after 3 sec of completion
        }
      });
    } else if(this.type === 'product') {
      this._registerService.verifyProductLink(this.id).subscribe({
        next: res => {
          this.loading = false; //setting loading off on success
          this.status = 'verified';
          this.message = res.message; //getting message from backend
          const timeOut = setTimeout(() => {
            this.router.navigate(['/']);
          }, 3000) //redirect after 3 sec of completion
        },
        error: err => {
          this.loading = false;//setting loading off on error
          this.status = 'not-verified';
          this.message = err.error.message;//getting message from backend
          const timeOut = setTimeout(() => {
            this.router.navigate(['/']);
          }, 3000)//redirect after 3 sec of completion
        }
      });
    }else if(this.type === 'doc') {
      this._registerService.verifydocLink(this.id).subscribe({
        next: res => {
          this.loading = false; //setting loading off on success
          this.status = 'verified';
          this.message = res.message; //getting message from backend
          const timeOut = setTimeout(() => {
            this.router.navigate(['/']);
          }, 3000) //redirect after 3 sec of completion
        },
        error: err => {
          this.loading = false;//setting loading off on error
          this.status = 'not-verified';
          this.message = err.error.message;//getting message from backend
          // const timeOut = setTimeout(() => {
          //   this.router.navigate(['/']);
          // }, 3000)//redirect after 3 sec of completion
        }
      });
    }
    
  }
}
