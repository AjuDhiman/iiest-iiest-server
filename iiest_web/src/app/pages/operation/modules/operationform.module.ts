import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CertificationSectionComponent } from 'src/app/pages/operation/operationform/certification-section/certification-section.component';
import { OperationformComponent } from 'src/app/pages/operation/operationform/operationform.component';
import { VerificationSectionComponent } from 'src/app/pages/operation/operationform/verification-section/verification-section.component';
import { EnrollmentSectionComponent } from 'src/app/pages/operation/operationform/enrollment-section/enrollment-section.component';
import { AttendanceSectionComponent } from 'src/app/pages/operation/operationform/attendance-section/attendance-section.component';
import { DocumentationSectionComponent } from 'src/app/pages/operation/operationform/documentation-section/documentation-section.component';
import { SchedulingSectionComponent } from 'src/app/pages/operation/operationform/scheduling-section/scheduling-section.component';
import { AuditSectionComponent } from 'src/app/pages/operation/operationform/audit-section/audit-section.component';
import { RevertSectionComponent } from 'src/app/pages/operation/operationform/revert-section/revert-section.component';
import { GeneralSectionComponent } from 'src/app/pages/operation/operationform/general-section/general-section.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { DocumentationModalComponent } from 'src/app/pages/modals/documentation-modal/documentation-modal.component';
import { SalesModule } from '../../sales/sales.module';



@NgModule({
  declarations: [
    OperationformComponent,
    VerificationSectionComponent,
    EnrollmentSectionComponent,
    AttendanceSectionComponent,
    DocumentationSectionComponent,
    RevertSectionComponent,
    SchedulingSectionComponent,
    AuditSectionComponent,
    CertificationSectionComponent,
    GeneralSectionComponent,
    DocumentationModalComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    SalesModule
  ],
  exports: [
    OperationformComponent,
    VerificationSectionComponent,
    EnrollmentSectionComponent,
    AttendanceSectionComponent,
    DocumentationSectionComponent,
    RevertSectionComponent,
    SchedulingSectionComponent,
    AuditSectionComponent,
    CertificationSectionComponent,
    GeneralSectionComponent,
    DocumentationModalComponent
  ]
})
export class OperationformModule { }
