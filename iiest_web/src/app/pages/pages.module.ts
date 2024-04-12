import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesModule } from 'src/app/pages/sales/sales.module';
import { OperationModule } from 'src/app/pages/operation/operation.module';
import { HRModule } from 'src/app/pages/HR/hr.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { GeneralModule } from 'src/app/pages/general/general.module';
import { OnboardModalComponent } from './onboard-modal/onboard-modal.component';



@NgModule({
  declarations: [
  
    OnboardModalComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    GeneralModule,
    SalesModule,
    OperationModule,
    HRModule
  ],
  exports: [
    SalesModule,
    OperationModule
  ]
})
export class PagesModule { }
