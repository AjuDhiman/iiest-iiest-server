import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { RegisterService } from './services/register.service';
import { HeaderComponent } from './shared/header/header.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})


export class AppComponent implements OnInit {
  title = 'iiest_new';
  showHeader: boolean = true;
  empName: string;
  loggedInUserData: any;
  isToken:boolean;
  isSidebarVisible = false;
  largeDisplay= false;

  @ViewChild(HeaderComponent) header : HeaderComponent;

  constructor(
    private router: Router,
    private activateRoute: ActivatedRoute,
    private _registerService: RegisterService
  ) {
    router.events.subscribe((val) => {
      const route:any = window.location.hash;
      if (val instanceof NavigationEnd) {
        if (val.url == '/' || val.url == '/main' || route == "#about" || route == "#contact") {
          this.showHeader = false;
          this.largeDisplay = false;
        } else {
          this.showHeader = true;
        }
      }
    });
    this.isToken = this._registerService.isLoggedIn();
    if(!this.isToken){
    sessionStorage.setItem('issLoggedIn','false');
  
    sessionStorage.setItem('token','')
    }
  }
  ngOnInit(): void {
    this.loggedInUserData = this._registerService.LoggedInUserData();
    this.loggedInUserData = JSON.parse(this.loggedInUserData)
    if(this.loggedInUserData){
    this.empName = this.loggedInUserData.employee_name;
    }
  }

  onSidebarToggle(obj:any){
    this.isSidebarVisible = obj.isSidebarVisible;
    this.largeDisplay = obj.largeDisplay;
  }

}
