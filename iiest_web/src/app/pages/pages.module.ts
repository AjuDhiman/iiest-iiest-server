import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesModule } from 'src/app/pages/sales/sales.module';
import { OperationModule } from 'src/app/pages/operation/operation.module';
import { HRModule } from 'src/app/pages/HR/hr.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { GeneralModule } from 'src/app/pages/general/general.module';
import { OnboardModalComponent } from './onboard-modal/onboard-modal.component';
import { OnboardVerificationComponent } from './onboard-verification/onboard-verification.component';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { RefundPolicyComponent } from './refund-policy/refund-policy.component';
import { SaleDocModalComponent } from './modals/sale-doc-modal/sale-doc-modal.component';



@NgModule({
  declarations: [
    OnboardModalComponent,
    OnboardVerificationComponent,
    TermsAndConditionsComponent,
    PrivacyPolicyComponent,
    RefundPolicyComponent,
    SaleDocModalComponent
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
    OperationModule,
    OnboardVerificationComponent
  ]
})
export class PagesModule { }
