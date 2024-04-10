import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RegisterService } from 'src/app/services/register.service';
import { Router } from '@angular/router';
import { fbo_roles, empRegister_roles, caseList_roles } from 'src/app/utils/config';
import { GetdataService } from 'src/app/services/getdata.service';
import { faUserPlus, faCalendarWeek, faCalendarDays, IconDefinition } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  userData: any;
  fboRoles = fbo_roles;
  employeeRoles = empRegister_roles;
  caseListRoles = caseList_roles;
  userImage: string = '../../assets/logo-side.png';
  userImageId: string;
  faUserPlus: IconDefinition = faUserPlus;
  faCalendarDays: IconDefinition = faCalendarDays;
  faCalendarWeek: IconDefinition = faCalendarWeek;

  @Input() sideBarToggle: boolean;
  @Input() isSidebarVisible: boolean;
  @Input() largeDisplay: boolean;
  @Output() sideBarToggleUpdate = new EventEmitter();
  constructor(private registerService: RegisterService,
    private getDataService: GetdataService,
    private router: Router) {
  }

  ngOnInit(): void {
    this.getUserData();
    this.getUserImage();
    // this.getUserImage();
  }

  toggelStyle: object = {
    'position': 'absolute',
    'z-index': 1021,
    'inset': '160px auto auto',
    'margin': '0px; transform: translate3d(0.666667px, 28px, 0px)'
  }

  toggelShow: boolean = false;
  toggleClass(event: any) {
    this.toggelShow = !this.toggelShow;
    event.target.classList.toggle('show');
  }
  getUserData() {
    const rawUserData: any = this.registerService.LoggedInUserData()
    this.userData = JSON.parse(rawUserData);
  }
  sideBarToggleValue() {
    this.sideBarToggleUpdate.emit(false);
    this.toggelShow = false;
    this.isSidebarVisible = !this.isSidebarVisible;
  }
  getUserImage() {
    const rawUserData: any = this.registerService.LoggedInUserData();
    const parsedData: any = JSON.parse(rawUserData);
    this.getDataService.getUserImage(parsedData.employeeImage).subscribe({
      next: (res) => {
        if (res.imageConverted) {
          this.userImage = res.imageConverted;
        } else if (res.defaulImage) {
          this.userImage = res.defaultImage;
        }
      }
    })
  }

  closeDropMenu() {
    this.toggelShow = false;
  }

  navigateToEmployment(type: string) {
    this.router.navigate(['/employment', type]);
  }
}
