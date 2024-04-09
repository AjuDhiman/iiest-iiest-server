import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingpageComponent } from '../landingpage/landingpage.component';
import { UserAccountComponent } from '../user-account/user-account.component';
import { SettingPanelComponent } from 'src/app/shared/setting-panel/setting-panel.component';
import { LmsComponent } from '../lms/lms.component';
import { CalendarComponent } from '../lms/calendar/calendar.component';
import { MainPageComponent } from '../main-page/main-page.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ContactusformComponent } from '../landingpage/contactusform/contactusform.component';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { homeModule } from './modules/home.module';



@NgModule({
  declarations: [
    LandingpageComponent,
    UserAccountComponent,
    SettingPanelComponent,
    LmsComponent,
    CalendarComponent,
    MainPageComponent,
    ContactusformComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    homeModule,
    AppRoutingModule
  ],
  exports: [
    LandingpageComponent,
    UserAccountComponent,
    SettingPanelComponent,
    LmsComponent,
    CalendarComponent,
    MainPageComponent
  ]
})
export class GeneralModule { }
