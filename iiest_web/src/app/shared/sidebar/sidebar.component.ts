import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RegisterService } from 'src/app/services/register.service';
import { Router } from '@angular/router';
import { fbo_roles, empRegister_roles, caseList_roles, bookSaleRoles, director_roles } from 'src/app/utils/config';
import { GetdataService } from 'src/app/services/getdata.service';
import { faUserPlus, faCalendarWeek, faCalendarDays, IconDefinition, faList, faList12, faFileInvoice , faListOl} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  userData: any;
  //array of roles comming from config.ts that decides perticular route for particular roles
  fboRoles = fbo_roles;
  bookSaleRoles = bookSaleRoles;
  employeeRoles = empRegister_roles;
  caseListRoles = caseList_roles;
  directorRoles = director_roles;
  userImage: string = 'assets/images/logo-side.png';
  userImageId: string;

  //icons
  faUserPlus: IconDefinition = faUserPlus;
  faCalendarDays: IconDefinition = faCalendarDays;
  faCalendarWeek: IconDefinition = faCalendarWeek;
  faList: IconDefinition = faList;
  faList12: IconDefinition = faList12;
  faFileInvoice: IconDefinition = faFileInvoice;


  //input variables
  @Input() sideBarToggle: boolean;
  @Input() isSidebarVisible: boolean;
  @Input() largeDisplay: boolean;


  //output event emittor
  @Output() sideBarToggleUpdate = new EventEmitter();
  constructor(private registerService: RegisterService,
    private getDataService: GetdataService,
    private router: Router) {
  }

  ngOnInit(): void {
    this.getUserData();
    console.log(this.userData);
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

  //methord for getting user data
  getUserData() {
    const rawUserData: any = this.registerService.LoggedInUserData()
    this.userData = JSON.parse(rawUserData);
    if(this.userData) {
      this.userImageId = this.userData.employeeImage;
      this.getUserImage();
    }
  }

  //methord for toggleing sidebar
  sideBarToggleValue() {
    this.sideBarToggleUpdate.emit(false);
    this.toggelShow = false;
    this.isSidebarVisible = !this.isSidebarVisible;
  }

  //methord for getting user image
  getUserImage() {
    if(!this.userImageId) {
      this.userImage = 'assets/images/landing_img/baharat-logo.png';
      return;
    }
    const rawUserData: any = this.registerService.LoggedInUserData();
    const parsedData: any = JSON.parse(rawUserData);
    this.getDataService.getUserImage(parsedData.employeeImage).subscribe({
      next: (res) => {
        if(res) {
          if (res.imageConverted) {
            this.userImage = res.imageConverted;
          } else if (res.defaulImage) {
            this.userImage = res.defaultImage;
          }
        }
      }
    })
  }

  //methotd for closing side bar
  closeDropMenu() {
    this.toggelShow = false;
  }

  navigateToEmployment(type: string) {
    this.router.navigate(['/employment', type]);
  }
}
