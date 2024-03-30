import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http'
import { FormsModule, ReactiveFormsModule} from '@angular/forms'
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FontAwesomeModule, FaIconLibrary, FaIconComponent } from '@fortawesome/angular-fontawesome';
import { NgxPaginationModule } from 'ngx-pagination';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { FooterComponent } from './shared/footer/footer.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { SettingPanelComponent } from './shared/setting-panel/setting-panel.component';
import { HeaderComponent } from './shared/header/header.component';
import { MultiSelectComponent } from './shared/multi-select/multi-select.component';
import { HomeComponent } from './pages/home/home.component';
import { DatePipe } from '@angular/common';
import { LandingpageComponent } from './pages/landingpage/landingpage.component';
import { AuthInterceptor} from './interceptors/auth.interceptor';
import { ExportAsModule } from 'ngx-export-as';
import { HighchartsChartModule } from 'highcharts-angular';
//services
import {GetdataService} from './services/getdata.service'
//Toastr
import { ToastrModule } from 'ngx-toastr';
//ngxs Modules
import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { EmployeeState } from './store/state/employee.state';
import { SalesState } from './store/state/sales.state';
import { EditrecordComponent } from './pages/editrecord/editrecord.component';
import { QrCodeModule } from 'ng-qrcode';
import { Papa } from 'ngx-papaparse';
import { FileSaverModule } from 'ngx-filesaver';
import { NgSelectModule } from '@ng-select/ng-select';
import { HighchartsComponent } from './pages/highcharts/highcharts.component';
import { UserAccountComponent } from './pages/user-account/user-account.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { CaseListComponent } from './pages/operation/case-list/case-list.component';
import { OperationformComponent } from './pages/operation/operationform/operationform.component';
import { EnrollmentSectionComponent } from './pages/operation/operationform/enrollment-section/enrollment-section.component';
import { GeneralSectionComponent } from './pages/operation/operationform/general-section/general-section.component';
import { VerificationSectionComponent } from './pages/operation/operationform/verification-section/verification-section.component';
import { NgxLoadingModule } from 'ngx-loading';
import { StatCardsComponent } from './pages/home/stat-cards/stat-cards.component';
import { ClipboardModule } from 'ngx-clipboard';
import { AttendanceSectionComponent } from './pages/operation/operationform/attendance-section/attendance-section.component';
import { HighchartDataModalComponent } from './pages/modals/highchart-data-modal/highchart-data-modal.component';
import { ViewFboComponent } from './pages/modals/view-fbo/view-fbo.component';
import { ViewEmployeeComponent } from './pages/modals/view-employee/view-employee.component';
import { RecipientComponent } from './pages/modals/recipient/recipient.component';
import { EmploymentComponent } from './pages/modals/employment/employment.component';
import { DepartmentListComponent } from './pages/modals/department-list/department-list.component';
import { SignupComponent } from './pages/HR/signup/signup.component';
import { EmployeelistComponent } from './pages/HR/employeelist/employeelist.component';
import { FbolistComponent } from './pages/sales/fbolist/fbolist.component';
import { FostacComponent } from './pages/sales/fboproduct/fostac/fostac.component';
import { FoscosComponent } from './pages/sales/fboproduct/foscos/foscos.component';
import { HygieneAuditComponent } from './pages/sales/fboproduct/hygiene-audit/hygiene-audit.component';
import { FbonewComponent } from './pages/sales/fboproduct/fbonew/fbonew.component';
import { ContactusformComponent } from './pages/landingpage/contactusform/contactusform.component';
import { DocumentationSectionComponent } from './pages/operation/operationform/documentation-section/documentation-section.component';
import { RevertSectionComponent } from './pages/operation/operationform/revert-section/revert-section.component';
import { ConformationModalComponent } from './pages/modals/conformation-modal/conformation-modal.component';
import { CertificationSectionComponent } from './pages/operation/operationform/certification-section/certification-section.component';
import { LmsComponent } from './pages/lms/lms.component';
import { CalendarComponent } from './pages/lms/calendar/calendar.component';
import { ViewDocumentComponent } from './pages/modals/view-document/view-document.component';
import { RecipientListComponent } from './pages/modals/recipient/recipient-list/recipient-list.component';
import { StatListsComponent } from './pages/home/stat-lists/stat-lists.component';
import { InrAmountPipe } from './pipes/inr-amount.pipe';
import { BatchListComponent } from './pages/Training/batch-list/batch-list.component';
import { DocumentationModalComponent } from './pages/modals/documentation-modal/documentation-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    FooterComponent,
    SidebarComponent,
    SettingPanelComponent,
    SignupComponent,
    HeaderComponent,
    HomeComponent,
    EmployeelistComponent,
    LandingpageComponent,
    FbolistComponent,
    EditrecordComponent,
    RecipientComponent,
    ViewFboComponent,
    ContactusformComponent,
    MultiSelectComponent,
    FostacComponent,
    FoscosComponent,
    FbonewComponent,
    HighchartsComponent,
    EmploymentComponent,
    ViewEmployeeComponent,
    UserAccountComponent,
    HygieneAuditComponent,
    CaseListComponent,
    OperationformComponent,
    DepartmentListComponent,
    EnrollmentSectionComponent,
    GeneralSectionComponent,
    VerificationSectionComponent,
    StatCardsComponent,
    AttendanceSectionComponent,
    HighchartDataModalComponent,
    DocumentationSectionComponent,
    RevertSectionComponent,
    LmsComponent,
    ConformationModalComponent,
    CalendarComponent,
    CertificationSectionComponent,
    ViewDocumentComponent,
    RecipientListComponent,
    StatListsComponent,
    InrAmountPipe,
    BatchListComponent,
    DocumentationModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    QrCodeModule,
    FormsModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    BrowserAnimationsModule,
    FontAwesomeModule,
    NgxPaginationModule,
    ExportAsModule,
    QrCodeModule,
    FileSaverModule,
    HighchartsChartModule,
    //ngxs Modlues
    NgxsModule.forRoot([EmployeeState, SalesState]),
    NgxsLoggerPluginModule.forRoot(),
    NgxsReduxDevtoolsPluginModule.forRoot(),
    NgxLoadingModule.forRoot({
      primaryColour:'#15a362',
      secondaryColour:'#15a362',
      tertiaryColour:'#15a362'
    }),
    ToastrModule.forRoot({
      closeButton: true,
      timeOut: 5000, // 5 seconds
      progressBar: false,
    }),
    NgSelectModule,
    PdfViewerModule,
    ClipboardModule
  ],
  providers: [
    DatePipe,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi :true},
    GetdataService ,
    Papa,
],
  bootstrap: [AppComponent]
})
export class AppModule { }
