import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { OperationformModule } from 'src/app/pages/operation/modules/operationform.module';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    OperationformModule,
  ],
  exports: [
    OperationformModule
  ]
})
export class OperationModule { }
