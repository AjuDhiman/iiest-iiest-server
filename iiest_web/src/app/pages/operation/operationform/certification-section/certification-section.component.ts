import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
export class CertificationSectionComponent implements OnInit {

  @Input() candidateID: string = '';

  @Input() projectType: string = '';
  
  @Input() attendanceStatus: boolean = false;

  @Output() refreshAuditLog: EventEmitter<void> = new EventEmitter<void>;

  submitted: boolean = false;

  resultText: string = 'On-Going';

  resultTextClass: string = 'text-warning';
  
  isUploadVisible : boolean = false;

  isBtnDisble: boolean = false;

  resultIcon: IconDefinition = faCircleExclamation;

  faFile: IconDefinition = faFile;

  certificate: any;

  ticketClosed: boolean = false;

  ticketClosingDate: string = '';

  src: string = '';

  faFilePdf = faFilePdf;

  faDownload = faDownload;

  connformationFunc = (confirmation:boolean) => {
    if(confirmation){
      this.registerTicketDelivery(this.certificationform['ticket_status'].value);
      this.setCertificateResult(this.certificationform['ticket_status'].value);
    }
  }

  //icons
  faCircleCheck = faCircleCheck;
  faCircleExclamation = faCircleExclamation;

  ceritificationForm: FormGroup = new FormGroup({
    ticket_status: new FormControl(''),
    certificate: new FormControl('')
  });

  constructor(private formBulilder: FormBuilder,
    private modalService: NgbModal,
    private _registerService: RegisterService,
    private _toastrService: ToastrService,
    private _getDataService: GetdataService) {

  }

  ngOnInit(): void {
    this.ceritificationForm = this.formBulilder.group({
      ticket_status: [''],
      certificate: []
    });

    this.getTicketDiliverydata();
  }

  get certificationform(): { [key: string]: AbstractControl } {
    return this.ceritificationForm.controls;
  }

  onTicketStatusChange($event:any){
    if($event.target.value === 'delivered'){
      this.isUploadVisible = true;
      if(this.attendanceStatus){
        this.isBtnDisble = false;
      } else {
        this.isBtnDisble = true;
      }
    } else {
      this.isUploadVisible = false;
      this.isBtnDisble = false;
    }
  }

  onTicketClose(): void {
    this.submitted = true;
    if (this.ceritificationForm.invalid) {
      return;
    }

    if(this.certificationform['ticket_status'].value === 'delivered') {
      this.registerTicketDelivery(this.certificationform['ticket_status'].value);
    }
    else {
      this.ifNotDilivered(this.certificationform['ticket_status'].value);
    }
  }

  setCertificateResult(ticketStatus: string) {
    switch (ticketStatus) {
      case '':
        this.resultText = 'On-Going';
        this.resultTextClass = 'text-warning';
        this.resultIcon = faCircleExclamation;
        break;
      case 'cancle':
        this.resultText = 'Cancled';
        this.resultTextClass = 'text-danger';
        this.resultIcon = faCircleExclamation;
        break;
      case 'refund':
        this.resultText = 'Refund';
        this.resultTextClass = 'text-danger';
        this.resultIcon = faCircleExclamation;
        break;
      case 'delivered':
        this.resultText = 'Ticket Delivered';
        this.resultTextClass = 'text-success';
        this.resultIcon = faCircleCheck;
        break;
    }

    this.resultText += ` on ${this.ticketClosingDate}`;
  }

  ifNotDilivered(action: string) {
    const modalRef = this.modalService.open(ConformationModalComponent, { size: 'md', backdrop: 'static' });
    modalRef.componentInstance.action = action;
    let user: any = this._registerService.LoggedInUserData();
    const parsedUser = JSON.parse(user);
    const employeeId = parsedUser.employee_id
    modalRef.componentInstance.confirmationText = employeeId;
    modalRef.componentInstance.actionFunc = this.connformationFunc
  }

  onFileSelected(event: any) {
    this.certificate = event.target.files[0];
    console.log(this.certificate);
  }

  registerTicketDelivery(ticketStatus: string){

    if( ticketStatus === 'delivered'){
      const formData = new FormData();

      console.log(this.certificate);

      formData.append('ticket_status', this.certificationform['ticket_status'].value);
  
      formData.append('certificate', this.certificate);

      console.log(formData);
  
      this._registerService.uploadCertificate(this.candidateID, formData).subscribe({
        next : res => {
          console.log(res);
          this._toastrService.success('Ticket closed');
          this.setCertificateResult(this.certificationform['ticket_status'].value)
          this.ticketClosed = true;
          this.ticketClosed = res.data.createdAt;
        }
      });
    } else {
      this._registerService.uploadCertificate(this.candidateID, this.ceritificationForm.value).subscribe({
        next : res => {
          console.log(res);
          this._toastrService.success('Ticket closed');
          this.setCertificateResult(this.certificationform['ticket_status'].value)
          this.ticketClosed = true;
          this.ticketClosed = res.data.createdAt;
        }
      });
    }
  } 

  getTicketDiliverydata(){
    this._getDataService.getTicketDeliveryData(this.candidateID).subscribe({
      next: res => {
        if(res){
          console.log(res);
          this.ceritificationForm.patchValue({ticket_status:res.data.ticketStatus })
          this.ticketClosed = true;
          this.isUploadVisible = true;
          this.src = res.data.certificate;
          if(res.data.ticketStatus === 'delivered'){
            this.isUploadVisible = true;
            this.src = res.data.certificate;
          } else {
            this.isUploadVisible = false;
          }
          this.ticketClosingDate = this.getFormatedDate(res.data.createdAt);
          this.setCertificateResult(res.data.ticketStatus);;
        }
      }
    })
  }

  showCertificate() {
    const modalRef = this.modalService.open(ViewDocumentComponent, { size: 'lg', backdrop: 'static' });
  }

  getFormatedDate(date: string): string {
    const originalDate = new Date(date);
    const year = originalDate.getFullYear();
    let formattedDate;
    if(Math.floor((new Date().getTime() - originalDate.getTime())/(24*60*60*1000)) < 7){
      formattedDate = days[originalDate.getDay()];
    } else {
      const month = months[originalDate.getMonth()];
      const day = String(originalDate.getDate()).padStart(2, '0');
      formattedDate = `${day}-${month}-${year}`;
    }  
    return formattedDate;
  }


}
