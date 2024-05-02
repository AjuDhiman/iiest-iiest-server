import { IconDefinition, faCheckCircle, faCircleXmark, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RegisterService } from 'src/app/services/register.service';

@Component({
  selector: 'app-onboard-verification',
  templateUrl: './onboard-verification.component.html',
  styleUrls: ['./onboard-verification.component.scss']
})
export class OnboardVerificationComponent implements OnInit, AfterViewInit{

  id:string;
  faCheckCircle: IconDefinition = faCheckCircle;
  faCircleExclamation: IconDefinition = faCircleExclamation;
  faCircleXmark:IconDefinition = faCircleXmark;

  status: 'ongoing'|'not-verified'|'verified' = 'ongoing';
  loading: boolean = false;
  message: string = 'Verifing Email';

  constructor(private _registerService: RegisterService,
    private route: ActivatedRoute,
  ){

  }

  ngOnInit(): void {
    const bodyElement = document.body;
    bodyElement.classList.remove('app');
    this.id = this.route.snapshot.params['id'];
    this.verifyMail();
  }

  ngAfterViewInit(): void {
    const bodyElement = document.body;
    bodyElement.classList.remove('app');
  }

  verifyMail(): void{
    this.loading = true;
    this._registerService.verifyMail(this.id).subscribe({
      next: res => {
        this.loading = false;
        this.status = 'verified';
        this.message = res.message;
      },
      error: err => {
        this.loading = false;
        this.status = 'not-verified';
        this.message = err.error.message;
      }
    });
  }
}
