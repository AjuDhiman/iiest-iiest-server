import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignupComponent } from './signup/signup.component';
import { EmployeelistComponent } from './employeelist/employeelist.component';
import { ViewEmployeeComponent } from '../modals/view-employee/view-employee.component';
import { EmploymentComponent } from '../modals/employment/employment.component';
import { SharedModule } from 'src/app/shared/shared.module';



@NgModule({
  declarations: [
    SignupComponent,
    EmployeelistComponent,
    ViewEmployeeComponent,
    EmploymentComponent,
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    SignupComponent,
    EmployeelistComponent,
    ViewEmployeeComponent,
    EmploymentComponent,
  ]
})
export class HRModule { }
