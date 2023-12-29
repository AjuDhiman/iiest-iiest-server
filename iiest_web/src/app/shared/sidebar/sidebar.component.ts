import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() userData:any;
  @Input() sideBarToggle:boolean;
  @Input() isSidebarVisible: boolean;
  @Input() largeDisplay: boolean;
  @Output() sideBarToggleUpdate = new EventEmitter();
  constructor(private router :Router){

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
sideBarToggleValue(){
  this.sideBarToggleUpdate.emit(false);
  this.toggelShow = false;
}

closeDropMenu(){
  this.toggelShow=false;
}
}
