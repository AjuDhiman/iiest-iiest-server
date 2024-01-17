import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RegisterService } from 'src/app/services/register.service';
import { Router } from '@angular/router';
import { fbo_roles, empRegister_roles } from 'src/app/utils/config';
import { GetdataService } from 'src/app/services/getdata.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  userData: any;
  fboRoles = fbo_roles;
  employeeRoles = empRegister_roles;
  userImage: string = '';
  userImageId: string;
  @Input() sideBarToggle:boolean;
  @Input() isSidebarVisible: boolean;
  @Input() largeDisplay: boolean;
  @Output() sideBarToggleUpdate = new EventEmitter();
  constructor(private registerService: RegisterService,
    private getDataService: GetdataService,
    private router:Router){
  }

  ngOnInit(): void{
    this.getUserData();
    console.log(fbo_roles);
    console.log(empRegister_roles);
    this.getUserImage();
    // this.getUserImage();
  }

  toggelStyle: object = {
    'position': 'absolute',
    'z-index': 1021,
    'inset': '160px auto auto',
    'margin': '0px; transform: translate3d(0.666667px, 28px, 0px)'
  }

toggelShow:boolean= false;
toggleClass(event:any){
  this.toggelShow = !this.toggelShow ;
  event.target.classList.toggle('show');
}
getUserData(){
  const rawUserData: any = this.registerService.LoggedInUserData()
  this.userData = JSON.parse(rawUserData);
}
sideBarToggleValue(){
  this.sideBarToggleUpdate.emit(false);
  this.toggelShow = false;
}
getUserImage(){
  const rawUserData: any = this.registerService.LoggedInUserData();
  const parsedData: any = JSON.parse(rawUserData);
  console.log(parsedData)
  this.getDataService.getUserImage(parsedData.employeeImage).subscribe({
    next: (res)=>{
      this.userImage = res.imageConverted;
    }
  })
}

closeDropMenu(){
  this.toggelShow=false;
}

navigateToEmployment(type: string) {
  this.router.navigate(['/employment', type]);
}
}
