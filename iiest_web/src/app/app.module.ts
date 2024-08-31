import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http'
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { AppComponent } from 'src/app/app.component';
import { LoginComponent } from 'src/app/pages/login/login.component';
import { DatePipe, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AuthInterceptor} from 'src/app/interceptors/auth.interceptor';
//services
import {GetdataService} from 'src/app/services/getdata.service'
//Toastr
//ngxs Modules
import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { EmployeeState } from 'src/app/store/state/employee.state';
import { SalesState } from 'src/app/store/state/sales.state';
import { EditrecordComponent } from 'src/app/pages/editrecord/editrecord.component';
import { QrCodeModule } from 'ng-qrcode';
import { Papa } from 'ngx-papaparse';
import { FileSaverModule } from 'ngx-filesaver';
import { NgSelectModule } from '@ng-select/ng-select';
import { CaseListComponent } from 'src/app/pages/operation/case-list/case-list.component';
import { ConformationModalComponent } from './pages/modals/conformation-modal/conformation-modal.component';
import { BatchListComponent } from 'src/app/pages/Training/batch-list/batch-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { CoreModule } from 'src/app/core/core.module';
import { PagesModule } from 'src/app/pages/pages.module';
import { ShopState } from './store/state/shop.state';
import { BosState } from './store/state/bo.state';
import { GSTListState } from './store/state/gstlist.state';

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
    NgxsModule.forRoot([EmployeeState, SalesState, ShopState, BosState, GSTListState]),
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
