import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { faCircleCheck, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConformationModalComponent } from 'src/app/pages/modals/conformation-modal/conformation-modal.component';

@Component({
  selector: 'app-documentation-section',
  templateUrl: './documentation-section.component.html',
  styleUrls: ['./documentation-section.component.scss']
})
export class DocumentationSectionComponent implements OnInit {

  filedStatus: boolean = false;

  @Input() verifiedStatus: boolean = false;

  // icons
  faCircleCheck = faCircleCheck;
  faCircleExclamation = faCircleExclamation;

  //Filing Reactive form 
  filingForm: FormGroup = new FormGroup({
    tentative_training_date: new FormControl(''),
    fostac_training_date: new FormControl(''),
    roll_no: new FormControl(''),
  })

  constructor(private modalService: NgbModal){

  }

  ngOnInit(): void {
    
  }

  onFile(){

  }

  //View Employee Details
  onCancle(res: any): void {
    const modalRef = this.modalService.open(ConformationModalComponent, { size: 'lg', backdrop: 'static' });
    // modalRef.componentInstance.employee = res;
  }
}
