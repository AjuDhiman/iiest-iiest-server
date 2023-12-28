import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoginComponent } from '../login/login.component';
import { faPeopleGroup, faBuilding, faLocationDot, faHome, faSignIn, faCircleInfo, faPhone} from '@fortawesome/free-solid-svg-icons';
import { RegisterService } from 'src/app/services/register.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landingpage',
  templateUrl: './landingpage.component.html',
  styleUrls: ['./landingpage.component.scss']
})
export class LandingpageComponent implements OnInit {

  faPeopleGroup = faPeopleGroup;
  faBuilding = faBuilding;
  faLocationDot = faLocationDot;
  faHome = faHome;
  faSignIn = faSignIn;
  faCircleInfo = faCircleInfo;
  faPhone = faPhone;
  isToken:boolean;
constructor(
  private modalService: NgbModal,
  private _resiterService: RegisterService,
  private router: Router){
  const bodyElement = document.body;
  bodyElement.classList.remove('app');
  this.isToken = this._resiterService.isLoggedIn();
  
}
ngOnInit(): void {

}
openModal(){
  if(!this.isToken){
   this.modalService.open(LoginComponent, { size: 'md', backdrop: 'static' });
  }else{
      this.router.navigateByUrl('/home')
  }
}

}
