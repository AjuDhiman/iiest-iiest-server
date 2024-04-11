import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoginComponent } from 'src/app/pages/login/login.component';
import { faPeopleGroup, faBuilding, faLocationDot, faHome, faSignIn, faCircleInfo, faPhone} from '@fortawesome/free-solid-svg-icons';
import { RegisterService } from 'src/app/services/register.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landingpage',
  templateUrl: './landingpage.component.html',
  styleUrls: ['./landingpage.component.scss'],
  host: {
    "(window:resize)": "onWindowResize($event)"
  }
})
export class LandingpageComponent implements OnInit, AfterViewInit {

  faPeopleGroup = faPeopleGroup;
  faBuilding = faBuilding;
  faLocationDot = faLocationDot;
  faHome = faHome;
  faSignIn = faSignIn;
  faCircleInfo = faCircleInfo;
  faPhone = faPhone;
  isToken:boolean = false;

  @ViewChild('backgroundVidRef') backgroundVidRef: ElementRef;
  @ViewChild('headRef') headRef: ElementRef;
  
constructor(
  private modalService: NgbModal,
  private _resiterService: RegisterService,
  private router: Router){
  
}
ngOnInit(): void {
}

ngAfterViewInit(): void {
  this.headRef.nativeElement.style.height = this.backgroundVidRef.nativeElement.style.height;
  const bodyElement = document.body;
  bodyElement.classList.remove('app');
  this.isToken = this._resiterService.isLoggedIn();
}
openModal(){
  if(!this.isToken){
   this.modalService.open(LoginComponent, { size: 'md', backdrop: 'static' });
  }else{
      this.router.navigateByUrl('/home');
  }
}

onWindowResize($event: any): void {
   this.headRef.nativeElement.style.height = this.backgroundVidRef.nativeElement.style.height;
}


}
