import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CertificationSectionComponent } from '../operationform/certification-section/certification-section.component';
import { OperationformComponent } from '../operationform/operationform.component';
import { VerificationSectionComponent } from '../operationform/verification-section/verification-section.component';
import { EnrollmentSectionComponent } from '../operationform/enrollment-section/enrollment-section.component';
import { AttendanceSectionComponent } from '../operationform/attendance-section/attendance-section.component';
import { DocumentationSectionComponent } from '../operationform/documentation-section/documentation-section.component';
import { SchedulingSectionComponent } from '../operationform/scheduling-section/scheduling-section.component';
import { AuditSectionComponent } from '../operationform/audit-section/audit-section.component';
import { RevertSectionComponent } from '../operationform/revert-section/revert-section.component';
import { GeneralSectionComponent } from '../operationform/general-section/general-section.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { DocumentationModalComponent } from '../../modals/documentation-modal/documentation-modal.component';



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
    SharedModule
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
