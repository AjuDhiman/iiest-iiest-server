import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http'
import{ FormsModule, ReactiveFormsModule} from '@angular/forms'
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
import { SignupComponent } from './pages/signup/signup.component';
import { HeaderComponent } from './shared/header/header.component';
import { MultiSelectComponent } from './shared/multi-select/multi-select.component';
import { HomeComponent } from './pages/home/home.component';
import { EmployeelistComponent } from './pages/employeelist/employeelist.component';
import { DatePipe } from '@angular/common';
import { LandingpageComponent } from './pages/landingpage/landingpage.component';
import { ContactusformComponent } from './pages/contactusform/contactusform.component';
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
import { FbolistComponent } from './pages/fbolist/fbolist.component';
import { EditrecordComponent } from './pages/editrecord/editrecord.component';
import { QrCodeModule } from 'ng-qrcode';
import { Papa } from 'ngx-papaparse';
import { FileSaverModule } from 'ngx-filesaver';
import { RecipientComponent } from './pages/recipient/recipient.component';
import { ViewFboComponent } from './pages/view-fbo/view-fbo.component';
import { FostacComponent } from './pages/fboproduct/fostac/fostac.component';
import { FoscosComponent } from './pages/fboproduct/foscos/foscos.component';
import { FbonewComponent } from './pages/fboproduct/fbonew/fbonew.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { HighchartsComponent } from './pages/highcharts/highcharts.component';
import { EmploymentComponent } from './pages/employment/employment.component';
import { ViewEmployeeComponent } from './pages/view-employee/view-employee.component';
import { UserAccountComponent } from './pages/user-account/user-account.component';
import { HygieneAuditComponent } from './pages/fboproduct/hygiene-audit/hygiene-audit.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { CaseListComponent } from './pages/operation/case-list/case-list.component';
import { OperationformComponent } from './pages/operation/operationform/operationform.component';
import { DepartmentListComponent } from './pages/department-list/department-list.component';
import { EnrollmentSectionComponent } from './pages/operation/operationform/enrollment-section/enrollment-section.component';
import { GeneralSectionComponent } from './pages/operation/operationform/general-section/general-section.component';
import { VerificationSectionComponent } from './pages/operation/operationform/verification-section/verification-section.component';
import { NgxLoadingModule } from 'ngx-loading';
import { StatCardsComponent } from './pages/home/stat-cards/stat-cards.component';
import { ClipboardModule } from 'ngx-clipboard';
import { AttendanceSectionComponent } from './pages/operation/operationform/attendance-section/attendance-section.component';
import { FbolistprodwiseComponent } from './pages/fbolistprodwise/fbolistprodwise.component';

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
    FbolistprodwiseComponent
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
    NgxsModule.forRoot([EmployeeState]),
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
