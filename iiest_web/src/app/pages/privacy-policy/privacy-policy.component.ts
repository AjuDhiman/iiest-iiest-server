import { Component, ElementRef, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { IconDefinition, faBuilding, faCircleInfo, faHome, faLocationDot, faPeopleGroup, faPhone, faSignIn } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { RegisterService } from 'src/app/services/register.service';
import { LoginComponent } from '../login/login.component';
import { OnboardModalComponent } from '../onboard-modal/onboard-modal.component';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent implements OnInit, AfterViewInit {
  faPeopleGroup: IconDefinition = faPeopleGroup;
  faBuilding: IconDefinition = faBuilding;
  faLocationDot = faLocationDot;
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

  openModal() {
    if (!this.isToken) {
      this.modalService.open(LoginComponent, { size: 'md', backdrop: 'static' });
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
