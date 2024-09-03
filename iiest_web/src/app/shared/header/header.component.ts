import { Component, OnInit, Input, Output, EventEmitter, ViewChild, HostListener } from '@angular/core';
import { RegisterService } from 'src/app/services/register.service';
import { SidebarComponent } from 'src/app/shared/sidebar/sidebar.component';
import { GetdataService } from 'src/app/services/getdata.service';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  host: {
    "(window:resize)": "onWindowResize($event)"
  }
})
export class HeaderComponent implements OnInit {
  toggelShow: boolean = false;
  toggelSettings: boolean = false;
  toggelNotification: boolean = false;
  width: number = window.innerWidth;
  userImage: string = 'assets/images/logo-side.png';
  userImageId: string;
  isSidebarVisible = false;
  largeDisplay: boolean = false;
  notifications: Array<{
    purpose: string, isRead: boolean, readerInfo: string, createdAt: string, _id: string, product: string,
    employee_name: string, employeeImage: string
  }> = []
  toggelStyle: object = {
    'position': 'fixed',
    'inset': '0px 0px auto auto',
    'margin': '0px; transform: translate3d(0.666667px, 28px, 0px)'
  }

  //notification related vars
  notificationContent: string = '';
  unreadMessageNum: number = 0;

  public getScreenWidth: any;

  @Input() item: boolean;
  @Input() userdata: any;
  @Input() isSideBar: boolean;
  @Output() toogleSideBarEvent = new EventEmitter<any>();
  //the purpose of this sidebar is to close drop menu of functions in sidebar component by falsing toggleshow var in sidebar component
  @ViewChild(SidebarComponent) sideBar: SidebarComponent;


  blockMsg: boolean = true;
  empName: any;
  userData: any;
  constructor(private _registerService: RegisterService,
    private getDataService: GetdataService,
    private router: Router) {

  }
  ngOnInit() {
    this.getUserData();
    if (this.width >= 1920) {
      this.isSideBar = true;
      this.isSidebarVisible = true;
      this.toogleSideBarEvent.emit({ isSidebarVisible: true, largeDisplay: false });
    }
    else if (this.width >= 1200) {
      this.largeDisplay = true;
      this.isSidebarVisible = false;
      this.toogleSideBarEvent.emit({ isSidebarVisible: false, largeDisplay: false });
    }
    else {
      this.toogleSideBarEvent.emit({ isSidebarVisible: false, largeDisplay: true });
    }
  }

  //methord for getting panel user data 
  getUserData() {
    const rawUserData: any = this._registerService.LoggedInUserData()
    this.userData = JSON.parse(rawUserData);
    if (this.userData) {
      this.userImageId = this.userData.employeeImage;
      this.getUserImage();
    }

    this.getNotifications()
  }


  //Window size
  onWindowResize(event: any) {
    this.width = event.target.innerWidth;
    this.sideBar.toggelShow = false; // on window resize deop menu will close in sidebar component
    if (this.width >= 1920) {
      this.isSideBar = true;
      this.isSidebarVisible = true;
      this.toogleSideBarEvent.emit({ isSidebarVisible: true, largeDisplay: true })
    }
    else if (this.width >= 1200) {
      this.largeDisplay = true;
      this.isSidebarVisible = false;
      this.toogleSideBarEvent.emit({ isSidebarVisible: false, largeDisplay: true });
    }
    else {
      this.isSideBar = false;
      this.isSidebarVisible = false;
      this.largeDisplay = false;
      this.toogleSideBarEvent.emit({ isSidebarVisible: false, largeDisplay: false })
    }
  }

  //methord open and closes the popups in headers relared to settings notoifications etc.
  toggleClass = (event: any) => {
    event.stopPropagation();
    let title = event.target.getAttribute('title');
    if (title === 'dropdown-menu') {
      this.toggelSettings = false;
      this.toggelNotification = false;
      this.toggelShow = !this.toggelShow;
      event.target.classList.toggle('show');
    }
    else if (title === 'Settings') {
      this.toggelShow = false;
      this.toggelNotification = false;
      this.toggelSettings = !this.toggelSettings;
      event.target.classList.toggle('show');
    }
    else if (title === 'Notifications') {
      this.toggelShow = false;
      this.toggelSettings = false;
      this.toggelNotification = !this.toggelNotification;
      event.target.classList.toggle('show');
    }
  }

  //methord for closing notifications and other popups on tab on any side of doc modal other than the popuo area
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;
    if ((!targetElement.closest('.app-user-dropdown'))) {
      this.toggelShow = false;
    }

    if ((!targetElement.closest('.dropdown-menu'))) {
      this.toggelNotification = false;
    }
  }

  //methord for logging out
  logout() {
    this._registerService.signout();
  }

  //methord for toggling side bar
  sideBarToggle(event: any) {
    this.sideBar.toggelShow = false;
    this.toggelNotification = false; // we want notifications and show to be closed on 
    this.toggelShow = false;
    this.isSideBar = !this.isSideBar;
    this.isSidebarVisible = !this.isSidebarVisible; //this variable is changing the right-margin in header on toggle 
    this.toogleSideBarEvent.emit({ isSidebarVisible: this.isSidebarVisible, largeDisplay: this.largeDisplay });// this event used in changing the right-margin in app content on toggle 
  }
  sideBarToggleUpdate(val: any) {
    this.isSideBar = val;
    this.isSidebarVisible = !this.isSidebarVisible; //this variable is changing the right-margin in header on toggle 
    this.toogleSideBarEvent.emit({ isSidebarVisible: this.isSidebarVisible, largeDisplay: this.largeDisplay });// this event used in changing the right-margin in app content on toggle 
  }

  //methord for getting user image
  getUserImage() {
    if (!this.userImageId) {
      this.userImage = 'assets/images/landing_img/baharat-logo.png';
      return;
    }
    this.getDataService.getUserImage(this.userImageId).subscribe({
      next: (res) => {
        if(res) {
          if (res.success) {
            this.userImage = res.imageConverted;
          } else if (res.defaulImage) {
            this.userImage = res.defaulImage;
          } else if (res.noImage) {
            this.userImage = 'assets/images/landing_img/baharat-logo.png';
          }
        }
      }
    })
  }

  //methord for getting notfications
  getNotifications(): void {

    let purpose: string = 'Verification';
    if (this.userData && (this.userData.panel_type === 'FSSAI Relationship Panel')) {
      this.getDataService.getNotifications(purpose).subscribe({
        next: res => {
          console.log(res);
          this.notifications = res.notifications.filter((a: any) => !a.isRead);
          this.unreadMessageNum = this.notifications.filter(a => !a.isRead).length;
        }
      })
    }
  }

  //methord for fomatting date string to readable string 
  getFormattedDate(date: string): string {
    let daysGone = '';

    const timeDiffrence = (new Date().getTime()) - (new Date(date).getTime());

    daysGone = Math.ceil(timeDiffrence / (1000 * 60 * 60 * 24)).toString();
    return daysGone;
  }

  //methord for updating notifications
  updateNotification(salesId: string, product: string): void {

    //update notifications 
    this._registerService.updateNotifications(salesId, product).subscribe({
      next: res => {
        this.toggelNotification = false;
        this.router.navigate(['/caselist'], { state: { byNotifications: true, product: product } })
        this.getNotifications();
      }
    })
  }
}