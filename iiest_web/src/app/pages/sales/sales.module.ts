import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FbonewComponent } from './fboproduct/fbonew/fbonew.component';
import { FbolistComponent } from './fbolist/fbolist.component';
import { FoscosComponent } from './fboproduct/foscos/foscos.component';
import { FostacComponent } from './fboproduct/fostac/fostac.component';
import { HygieneAuditComponent } from './fboproduct/hygiene-audit/hygiene-audit.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { RecipientComponent } from '../modals/recipient/recipient.component';
import { RecipientListComponent } from '../modals/recipient/recipient-list/recipient-list.component';
import { ViewFboComponent } from '../modals/view-fbo/view-fbo.component';



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
