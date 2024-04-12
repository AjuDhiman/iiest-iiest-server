import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from 'src/app/shared/header/header.component';
import { FooterComponent } from 'src/app/shared/footer/footer.component';
import { SidebarComponent } from 'src/app/shared/sidebar/sidebar.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AppRoutingModule } from 'src/app/app-routing.module';



@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    AppRoutingModule
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    SidebarComponent
  ]
})
export class CoreModule { }
