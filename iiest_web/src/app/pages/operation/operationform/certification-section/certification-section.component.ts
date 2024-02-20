import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IconDefinition, faCircleCheck, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConformationModalComponent } from 'src/app/pages/modals/conformation-modal/conformation-modal.component';
import { RegisterService } from 'src/app/services/register.service';

@Component({
  selector: 'app-certification-section',
  templateUrl: './certification-section.component.html',
  styleUrls: ['./certification-section.component.scss']
})
export class CertificationSectionComponent implements OnInit {

  @Input() candidateID: string = '';

  @Input() projectType: string = '';
  
  @Input() attendanceStatus: boolean = false;

  ticketClosed: boolean = false;

  resultText: string = 'On-Going';

  resultTextClass: string = 'text-warning';
  
  isUploadVisible : boolean = false;

  isBtnDisble: boolean = false;

  resultIcon: IconDefinition = faCircleExclamation;

  connformationFunc = (confirmation:boolean) => {
    if(confirmation){
      this.setCertificateResult(this.certificationform['ticket_status'].value);
    }
  }

  //icons
  faCircleCheck = faCircleCheck;
  faCircleExclamation = faCircleExclamation;

  ceritificationForm: FormGroup = new FormGroup({
    ticket_status: new FormControl(''),
  });

  constructor(private formBulilder: FormBuilder,
    private modalService: NgbModal,
    private _registerService: RegisterService) {

  }

  ngOnInit(): void {
    this.ceritificationForm = this.formBulilder.group({
      ticket_status: ['', Validators.required],
    });
  }

  get certificationform(): { [key: string]: AbstractControl } {
    return this.ceritificationForm.controls;
  }

  onTicketStatusChange($event:any){
    if($event.target.value === 'dilivered'){
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
    this.ticketClosed = true;
    if (this.ceritificationForm.invalid) {
      return;
    }

    if(this.certificationform['ticket_status'].value !== 'dilivered') {
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
      case 'dilivered':
        this.resultText = 'Ticket Dilivered';
        this.resultTextClass = 'text-success';
        this.resultIcon = faCircleCheck;
        break;
    }
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

}
