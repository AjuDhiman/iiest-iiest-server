import { Component, OnInit, Input, Output, EventEmitter, ViewChild, HostListener } from '@angular/core';
import { RegisterService } from 'src/app/services/register.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { GetdataService } from 'src/app/services/getdata.service';

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
  userImage: string = '../../assets/logo-side.png';
  userImageId: string;
  isSidebarVisible = false;
  largeDisplay: boolean = false;
  notifications: Array<{ image: string, description: string, time: string|Date }> = [{
    image: 'assets/images/profiles/profile-1.png',
    description: 'Amy shared a file with you. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    time: '2 hours ago'
  }, {
    image: 'assets/images/profiles/profile-1.png',
    description: 'You have a new invoice. Proin venenatis interdum est.',
    time: ' 1 day ago'
  }, {
    image: 'assets/images/profiles/profile-1.png',
    description: 'Your report is ready. Proin venenatis interdum est.',
    time: '3 days ago'
  }, {
    image: 'assets/images/profiles/profile-2.png',
    description: 'James sent you a new message.',
    time: '7 days ago'
  }];
  toggelStyle: object = {
    'position': 'fixed',
    'inset': '0px 0px auto auto',
    'margin': '0px; transform: translate3d(0.666667px, 28px, 0px)'
  }
  public getScreenWidth: any;

  @Input() item: boolean;
  @Input() userdata: any;
  @Input() isSideBar: boolean;
  @Output() toogleSideBarEvent = new EventEmitter<any>();
  //the purpose of this sidebar is to close drop menu of functions in sidebar component by falsing toggleshow var in sidebar component
  @ViewChild(SidebarComponent) sideBar: SidebarComponent; 
  
 
  blockMsg: boolean = true;
  empName: any;
  constructor(private _registerService: RegisterService,
  private getDataService: GetdataService) {
    let isLoggedIn = this._registerService.isLoggedIn();
    if (isLoggedIn) {
      let loggedInUserData: any = this._registerService.LoggedInUserData();
      loggedInUserData = JSON.parse(loggedInUserData);
      this.userdata = loggedInUserData.employee_name;
      this.empName = loggedInUserData.employee_name;
      this.userImageId = loggedInUserData.employeeImage
      this.getUserImage();
    }
    if (this.width >= 1920) {
      this.isSideBar = true;
      this.isSidebarVisible = true;
      this.toogleSideBarEvent.emit({isSidebarVisible: true, largeDisplay: false});
    }
    else if (this.width >= 1200) {
      this.largeDisplay = true;
      this.isSidebarVisible = false;
      this.toogleSideBarEvent.emit({isSidebarVisible: false, largeDisplay: false});
    }
    else{
      this.toogleSideBarEvent.emit({isSidebarVisible: false, largeDisplay: true});
    }
  }
  ngOnInit() { 
    console.log(this.isSidebarVisible);
    this.getUserImage();
   }

//Window size
  onWindowResize(event: any) {
    this.width = event.target.innerWidth;
    this.sideBar.toggelShow = false; // on window resize deop menu will close in sidebar component
    if(this.width >= 1920){
      this.isSideBar = true;
      this.isSidebarVisible = true;
      this.toogleSideBarEvent.emit({isSidebarVisible: true, largeDisplay: true})
    }
    else if (this.width >= 1200) {
      this.largeDisplay = true;
      this.isSidebarVisible = false;
      this.toogleSideBarEvent.emit({isSidebarVisible: false, largeDisplay: true});
    }
    else {
      this.isSideBar = false;
      this.isSidebarVisible = false;
      this.largeDisplay = false;
      this.toogleSideBarEvent.emit({isSidebarVisible: false, largeDisplay: false})
    }
  }
  toggleClass = (event: any) => {
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;
    if ((!targetElement.closest('.app-user-dropdown'))) {
      this.toggelShow = false;
    }
  }

  logout() {
    this._registerService.signout();
  }

  sideBarToggle(event: any) {
    this.sideBar.toggelShow = false;
    this.toggelNotification = false; // we want notifications and show to be closed on 
    this.toggelShow = false;
    this.isSideBar = !this.isSideBar;
    this.isSidebarVisible = !this.isSidebarVisible; //this variable is changing the right-margin in header on toggle 
    this.toogleSideBarEvent.emit({isSidebarVisible: this.isSidebarVisible, largeDisplay: this.largeDisplay});// this event used in changing the right-margin in app content on toggle 
  }
  sideBarToggleUpdate(val: any) {
    this.isSideBar = val;
    this.isSidebarVisible = !this.isSidebarVisible; //this variable is changing the right-margin in header on toggle 
    this.toogleSideBarEvent.emit({isSidebarVisible: this.isSidebarVisible, largeDisplay: this.largeDisplay});// this event used in changing the right-margin in app content on toggle 
  }

  getUserImage(){
    this.getDataService.getUserImage(this.userImageId).subscribe({
      next: (res)=>{
        if(res.success){
          this.userImage = res.imageConverted;
        }else if(res.defaulImage){
          this.userImage = res.defaulImage;
        }else if(res.noImage){
          this.userImage = '../../assets/logo-side.png';
        }
      }
    })
  }
}