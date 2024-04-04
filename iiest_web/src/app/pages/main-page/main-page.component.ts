import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faBuilding, faCircleInfo, faHome, faLocationDot, faPeopleGroup, faPhone, faSignIn } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegisterService } from 'src/app/services/register.service';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent {
  faPeopleGroup: IconDefinition = faPeopleGroup;
  faBuilding: IconDefinition = faBuilding;
  faLocationDot: IconDefinition = faLocationDot;
  faHome: IconDefinition = faHome;
  faSignIn: IconDefinition = faSignIn;
  faCircleInfo: IconDefinition = faCircleInfo;
  faPhone: IconDefinition = faPhone;
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
