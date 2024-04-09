import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxLoadingModule } from 'ngx-loading';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrModule } from 'ngx-toastr';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ClipboardModule } from 'ngx-clipboard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ExportAsModule } from 'ngx-export-as';
import { MultiSelectComponent } from './multi-select/multi-select.component';
import { ViewDocumentComponent } from '../pages/modals/view-document/view-document.component';
import { InrAmountPipe } from '../pipes/inr-amount.pipe';



@NgModule({
  declarations: [
    MultiSelectComponent,
    ViewDocumentComponent,
    InrAmountPipe
  ],
  imports: [
    CommonModule,
    //Ngx Modules
    NgxLoadingModule.forRoot({
      primaryColour:'#15a362',
      secondaryColour:'#15a362',
      tertiaryColour:'#15a362'
    }),
    NgxPaginationModule,
    ToastrModule.forRoot({
      closeButton: true,
      timeOut: 5000, // 5 seconds
      progressBar: false,
    }),
    PdfViewerModule,
    ClipboardModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    ExportAsModule
  ],
  exports: [
    NgxLoadingModule,
    NgxPaginationModule,
    ToastrModule,
    PdfViewerModule,
    ClipboardModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    ExportAsModule,
    ViewDocumentComponent,
    MultiSelectComponent,
    InrAmountPipe
  ],
  providers: [
    InrAmountPipe
  ]
})
export class SharedModule { }
