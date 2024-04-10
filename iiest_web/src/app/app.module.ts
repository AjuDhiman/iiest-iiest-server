import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http'
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { DatePipe, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AuthInterceptor} from './interceptors/auth.interceptor';
//services
import {GetdataService} from './services/getdata.service'
//Toastr
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
import { CaseListComponent } from './pages/operation/case-list/case-list.component';
import { ConformationModalComponent } from './pages/modals/conformation-modal/conformation-modal.component';
import { BatchListComponent } from './pages/Training/batch-list/batch-list.component';
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';
import { PagesModule } from './pages/pages.module';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    EditrecordComponent,
    CaseListComponent,
    BatchListComponent,
    ConformationModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    QrCodeModule,
    BsDatepickerModule.forRoot(),
    BrowserAnimationsModule,
    QrCodeModule,
    FileSaverModule,
    //ngxs Modlues
    NgxsModule.forRoot([EmployeeState, SalesState]),
    NgxsLoggerPluginModule.forRoot(),
    NgxsReduxDevtoolsPluginModule.forRoot(),
    NgSelectModule,
    CoreModule,
    SharedModule,
    PagesModule
  ],
  providers: [
    DatePipe,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi :true},
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    GetdataService ,
    Papa,
],
  bootstrap: [AppComponent]
})
export class AppModule { }
