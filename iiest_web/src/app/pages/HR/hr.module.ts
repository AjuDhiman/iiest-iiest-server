import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignupComponent } from 'src/app/pages/HR/signup/signup.component';
import { EmployeelistComponent } from 'src/app/pages/HR/employeelist/employeelist.component';
import { ViewEmployeeComponent } from 'src/app/pages/modals/view-employee/view-employee.component';
import { EmploymentComponent } from 'src/app/pages/modals/employment/employment.component';
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
