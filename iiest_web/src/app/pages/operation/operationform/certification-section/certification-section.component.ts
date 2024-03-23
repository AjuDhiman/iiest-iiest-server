import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IconDefinition, faCircleCheck, faCircleExclamation, faFile, faFilePdf, faDownload } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ConformationModalComponent } from 'src/app/pages/modals/conformation-modal/conformation-modal.component';
import { ViewDocumentComponent } from 'src/app/pages/modals/view-document/view-document.component';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';
import { days, months } from 'src/app/utils/config';

@Component({
  selector: 'app-certification-section',
  templateUrl: './certification-section.component.html',
  styleUrls: ['./certification-section.component.scss']
})
export class CertificationSectionComponent implements OnInit, OnChanges {

  //input variables
  @Input() candidateID: string = '';
  @Input() projectType: string = '';
  @Input() attendanceStatus: boolean = false;
  @Input() attenSecResult: string = '';

  //output event emitters
  @Output() refreshAuditLog: EventEmitter<void> = new EventEmitter<void>;
  @Output() emitDocuments: EventEmitter<Array<{name:string, src: string, format: string}>> = new EventEmitter<Array<{name:string, src: string, format: string}>>
  //result related variables and icons
  resultText: string = 'On-Going';
  resultTextClass: string = 'bg-warning';
  resultIcon: IconDefinition = faCircleExclamation;
  ticketClosingDate: string = '';

  formHeading: string = '';

  //booleans
  isBtnDisble: boolean = false;
  ticketClosed: boolean = false;
  isUploadVisible: boolean = false;
  submitted: boolean = false;

  // certifcate relatred variables
  certificate: any; // variable for extracting cwertificate file while uploading
  src: string = ''; // src of the certificate coming from the backend

  //icons
  faFilePdf: IconDefinition = faFilePdf;
  faDownload: IconDefinition = faDownload;

  //we are passing this methord to conformation modal this methord will run after conformation modal submission
  connformationFunc = (confirmation: boolean) => {
    if (confirmation) {
      this.registerTicketDelivery(this.certificationform['ticket_status'].value);
      this.setCertificateResult(this.certificationform['ticket_status'].value);
    }
  }

  //icons
  faCircleCheck = faCircleCheck;
  faCircleExclamation = faCircleExclamation;

  //certification form
  ceritificationForm: FormGroup = new FormGroup({
    ticket_status: new FormControl(''),
    certificate: new FormControl('')
  });

  constructor(private formBulilder: FormBuilder,
    private modalService: NgbModal,
    private _registerService: RegisterService,
    private _toastrService: ToastrService,
    private _getDataService: GetdataService,
    private http: HttpClient) {

  }

  ngOnInit(): void {

    //setting validation for certification form
    this.ceritificationForm = this.formBulilder.group({
      ticket_status: [''],
      certificate: []
    });

    this.getTicketDiliverydata();
    this.setFormHeading();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes['attenSecResult']) {
      this.setCertificateResult(this.ceritificationForm.value.ticket_status);
    }
  }

  get certificationform(): { [key: string]: AbstractControl } {
    return this.ceritificationForm.controls;
  }

  //this methord will get the the certification info from backend if this ticket is already closrd
  getTicketDiliverydata(): void {
    this._getDataService.getTicketDeliveryData(this.candidateID).subscribe({
      next: res => {
        if (res) {
          console.log(res);
          this.ceritificationForm.patchValue({ ticket_status: res.data.ticketStatus })
          this.ticketClosed = true;
          this.isUploadVisible = true;
          this.src = res.data.certificate;
          this.isBtnDisble = true;
          if (res.data.ticketStatus === 'delivered') {
            this.isUploadVisible = true;
            this.src = res.data.certificate;
            this.emitDocuments.emit([{
              name: 'Fostac Cerificate',
              src: this.src,
              format:'pdf'
            }])
          } else {
            this.isUploadVisible = false;
          }
          this.ticketClosingDate = this.getFormatedDate(res.data.createdAt);
          this.setCertificateResult(res.data.ticketStatus);;
        }
      }
    })
  }

  //this methord assigns the file to certificate var in case of file upload
  onFileSelected(event: any): void {
    this.certificate = event.target.files[0];
    console.log(this.certificate);
  }

  //this methord handles the submission of the certification form
  onTicketClose(): void {
    this.submitted = true;
    if (this.ceritificationForm.invalid) {
      return;
    }

    if (this.certificationform['ticket_status'].value === 'delivered') {
      this.registerTicketDelivery(this.certificationform['ticket_status'].value);
    }
    else {
      this.ifNotDilivered(this.certificationform['ticket_status'].value);
    }
  }

  //this methord will handle the boolean logics for our component on the basis of ticket status
  onTicketStatusChange($event: any): void {
    if ($event.target.value === 'delivered') {
      this.isUploadVisible = true;
      if (this.attendanceStatus) {
        this.isBtnDisble = false;
      } else {
        this.isBtnDisble = true;
      }
    } else {
      this.isUploadVisible = false;
      this.isBtnDisble = false;
    }
  }

  // this methord sets the result of certification section
  setCertificateResult(ticketStatus: string): void {
    console.log(this.attenSecResult, ticketStatus);
    if (this.attenSecResult) {
      if (this.attenSecResult !== 'Trained') {
        this.resultText = `${this.attenSecResult}`;
        this.resultTextClass = 'bg-danger';
        this.resultIcon = faCircleExclamation;
        this.isBtnDisble = true;
      } else {
        switch (ticketStatus) {
          case '':
            this.resultText = 'On-Going';
            this.resultTextClass = 'bg-warning';
            this.resultIcon = faCircleExclamation;
            break;
          case 'cancle':
            this.resultText = `Canceld on ${this.ticketClosingDate}`;
            this.resultTextClass = 'bg-danger';
            this.resultIcon = faCircleExclamation;
            break;
          case 'refund':
            this.resultText = `Refunded on ${this.ticketClosingDate}`;
            this.resultTextClass = 'bg-danger';
            this.resultIcon = faCircleExclamation;
            break;
          case 'reject':
            this.resultText = `Rejected on ${this.ticketClosingDate}`;
            this.resultTextClass = 'bg-danger';
            this.resultIcon = faCircleExclamation;
            break;
          case 'delivered':
            this.resultText = `Ticket Delivered on ${this.ticketClosingDate}`;
            this.resultTextClass = 'bg-success';
            this.resultIcon = faCircleCheck;
            break;
        }
      }
    }
  }

  //this methord shows the conformation window in case other than delivered
  ifNotDilivered(action: string): void {
    const modalRef = this.modalService.open(ConformationModalComponent, { size: 'md', backdrop: 'static' });
    modalRef.componentInstance.action = action;
    let user: any = this._registerService.LoggedInUserData();
    const parsedUser = JSON.parse(user);
    const employeeId = parsedUser.employee_id
    modalRef.componentInstance.confirmationText = employeeId;
    modalRef.componentInstance.actionFunc = this.connformationFunc
  }

  //this methord uses the register service for posting form data to backend
  registerTicketDelivery(ticketStatus: string): void {

    const formData = new FormData();
    console.log(this.certificate);
    formData.append('ticket_status', this.certificationform['ticket_status'].value);
    formData.append('certificate', this.certificate);

    this._registerService.closeTicket(this.candidateID, formData).subscribe({
      next: res => {
        console.log(res);
        this._toastrService.success('Ticket closed');
        this.ticketClosed = true;
        this.ticketClosingDate = res.addTicket.createdAt;
        this.setCertificateResult(this.certificationform['ticket_status'].value);
      }
    });

  }

  //this methord formats the date
  getFormatedDate(date: string): string {
    const originalDate = new Date(date);
    const year = originalDate.getFullYear();
    let formattedDate;
    if (Math.floor((new Date().getTime() - originalDate.getTime()) / (24 * 60 * 60 * 1000)) < 7) {
      formattedDate = days[originalDate.getDay()];
    } else {
      const month = months[originalDate.getMonth()];
      const day = String(originalDate.getDate()).padStart(2, '0');
      formattedDate = `${day}-${month}-${year}`;
    }
    return formattedDate;
  }

  setFormHeading(): void {
    switch(this.projectType) {
      case 'Fostac': 
        this.formHeading = 'Certification';
        break;
      case 'Foscos': 
        this.formHeading = 'Licensing';
        break;
      default: 
        this.formHeading = '';
    }
  }


}
