import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FbonewComponent } from 'src/app/pages/sales/fboproduct/fbonew/fbonew.component';
import { FbolistComponent } from 'src/app/pages/sales/fbolist/fbolist.component';
import { FoscosComponent } from 'src/app/pages/sales/fboproduct/foscos/foscos.component';
import { FostacComponent } from 'src/app/pages/sales/fboproduct/fostac/fostac.component';
import { HygieneAuditComponent } from 'src/app/pages/sales/fboproduct/hygiene-audit/hygiene-audit.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { RecipientComponent } from 'src/app/pages/modals/recipient/recipient.component';
import { RecipientListComponent } from 'src/app/pages/modals/recipient/recipient-list/recipient-list.component';
import { ViewFboComponent } from 'src/app/pages/modals/view-fbo/view-fbo.component';



@NgModule({
  declarations: [
    FbonewComponent,
    FoscosComponent,
    FostacComponent,
    HygieneAuditComponent,
    FbolistComponent,
    RecipientComponent,
    RecipientListComponent,
    ViewFboComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    FbonewComponent,
    FoscosComponent,
    FostacComponent,
    HygieneAuditComponent,
    FbolistComponent,
    RecipientComponent,
    RecipientListComponent,
    ViewFboComponent
  ]
})
export class SalesModule { }
