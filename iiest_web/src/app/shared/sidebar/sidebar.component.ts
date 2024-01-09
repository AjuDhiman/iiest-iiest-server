import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RegisterService } from 'src/app/services/register.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  userData: any;
  @Input() sideBarToggle:boolean;
  @Input() isSidebarVisible: boolean;
  @Input() largeDisplay: boolean;
  @Output() sideBarToggleUpdate = new EventEmitter();
  constructor(private registerService: RegisterService){
  }

  ngOnInit(): void{
    this.getUserData();
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

closeDropMenu(){
  this.toggelShow=false;
}
}
