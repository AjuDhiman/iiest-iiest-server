import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesModule } from './sales/sales.module';
import { OperationModule } from './operation/operation.module';
import { HRModule } from './HR/hr.module';
import { SharedModule } from '../shared/shared.module';
import { GeneralModule } from './general/general.module';



@NgModule({
  declarations: [
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
