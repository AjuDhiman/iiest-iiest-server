import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateInvoiceComponent } from './create-invoice/create-invoice.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ApprovesaleModalComponent } from './approvesale-modal/approvesale-modal.component';



@NgModule({
  declarations: [
    CreateInvoiceComponent,
    ApprovesaleModalComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    CreateInvoiceComponent
  ]
})
export class CoworksModule { }
