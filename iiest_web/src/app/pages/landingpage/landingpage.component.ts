import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoginComponent } from '../login/login.component';
import { faPeopleGroup, faBuilding, faLocationDot, faHome, faSignIn, faCircleInfo, faPhone, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { RegisterService } from 'src/app/services/register.service';
import { Router } from '@angular/router';
import { OnboardModalComponent } from '../onboard-modal/onboard-modal.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-landingpage',
  templateUrl: './landingpage.component.html',
  styleUrls: ['./landingpage.component.scss'],
})
export class LandingpageComponent implements OnInit, AfterViewInit {

  faPeopleGroup: IconDefinition = faPeopleGroup;
  faBuilding: IconDefinition = faBuilding;
  faLocationDot: IconDefinition = faLocationDot;
  faHome: IconDefinition = faHome;
  faSignIn: IconDefinition = faSignIn;
  faCircleInfo: IconDefinition = faCircleInfo;
  faPhone: IconDefinition = faPhone;
  isToken: boolean = false;
  isMobileNav: boolean = false;

  @ViewChild('backgroundVidRef') backgroundVidRef: ElementRef;
  // @ViewChild('headRef') headRef: ElementRef;

  constructor(
    private modalService: NgbModal,
    private _resiterService: RegisterService,
    private _toastrService: ToastrService,
    private router: Router) {

  }
  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    // this.headRef.nativeElement.style.height = this.backgroundVidRef.nativeElement.style.height;
    const bodyElement = document.body;
    bodyElement.classList.remove('app');
    this.isToken = this._resiterService.isLoggedIn();
  }

  openModal(type:string) {
    console.log(type);
    if (!this.isToken) {
      const modalRef = this.modalService.open(LoginComponent, { size: 'md', backdrop: 'static' });
      modalRef.componentInstance.userType = { userType: type }; 
    } else {
      const bodyElement = document.body;
      bodyElement.classList.add('app');
      this.router.navigateByUrl('/home');
    }
  }

  //methord opens the onboard ,modal if user if user is loggedin this runs on click of onboard button on landing page view
  openOnboardModal() {

      this.modalService.open(OnboardModalComponent, { size: 'md', backdrop: 'static' });

  }

  routeTo(str: string) {
    this.router.navigateByUrl(`/${str}`)
  }
}