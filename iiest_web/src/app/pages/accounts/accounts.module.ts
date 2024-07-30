import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceListComponent } from './invoice-list/invoice-list.component';
import { SharedModule } from 'src/app/shared/shared.module';



@NgModule({
  declarations: [
    InvoiceListComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    InvoiceListComponent
  ]
})
export class AccountsModule { }
