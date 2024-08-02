import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateInvoiceComponent } from './create-invoice/create-invoice.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ApprovesaleModalComponent } from './approvesale-modal/approvesale-modal.component';
import { ViewCoworkSaleComponent } from './view-cowork-sale/view-cowork-sale.component';



@NgModule({
  declarations: [
    CreateInvoiceComponent,
    ApprovesaleModalComponent,
    ViewCoworkSaleComponent
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
