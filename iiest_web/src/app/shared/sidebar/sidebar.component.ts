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
  @Input() largeDisplay:boolean
  @Output() sideBarToggleUpdate = new EventEmitter();
  constructor(private router :Router){

  }

toggelShow:boolean= false;
toggleClass(event:any){
  this.toggelShow = !this.toggelShow ;
    event.target.classList.toggle('show');
}
sideBarToggleValue(){
  this.sideBarToggleUpdate.emit(false);
}


}
