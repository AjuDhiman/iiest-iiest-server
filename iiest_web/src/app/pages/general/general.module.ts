import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingpageComponent } from 'src/app/pages/landingpage/landingpage.component';
import { UserAccountComponent } from 'src/app/pages/user-account/user-account.component';
import { SettingPanelComponent } from 'src/app/shared/setting-panel/setting-panel.component';
import { LmsComponent } from 'src/app/pages/lms/lms.component';
import { CalendarComponent } from 'src/app/pages/lms/calendar/calendar.component';
import { MainPageComponent } from 'src/app/pages/main-page/main-page.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ContactusformComponent } from 'src/app/pages/landingpage/contactusform/contactusform.component';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { homeModule } from 'src/app/pages/general/modules/home.module';



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
