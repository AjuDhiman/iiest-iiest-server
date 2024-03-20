import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { faCircleCheck, faCircleExclamation,faFileArrowUp } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DocumentationModalComponent } from 'src/app/pages/modals/documentation-modal/documentation-modal.component';
import { foscosDocments } from 'src/app/utils/config';

@Component({
  selector: 'app-documentation-section',
  templateUrl: './documentation-section.component.html',
  styleUrls: ['./documentation-section.component.scss']
})
export class DocumentationSectionComponent implements OnInit {

  filedStatus: boolean = false;

  filed: boolean = false;

  selectedDocs: string[] = [];

  @Input() verifiedStatus: boolean = false;

  // icons
  faCircleCheck = faCircleCheck;
  faCircleExclamation = faCircleExclamation;
  faFileArrowUp = faFileArrowUp;

  foscosDocuments: string[] = foscosDocments;


  //Filing Reactive form 
  filingForm: FormGroup = new FormGroup({
    username: new FormControl(''),
    password: new FormControl(''),
    payment_amount: new FormControl(''),
    payment_recipt: new FormControl(''),
    payment_date: new FormControl('')
  });

  constructor(private formBuilder: FormBuilder,
    private ngbModal: NgbModal){

  }

  ngOnInit(): void {
    this.filingForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      payment_amount: ['', Validators.required],
      payment_receipt: ['', Validators.required],
      payment_date: ['', Validators.required],
    });
  }

  get filingform(): {[key: string] : AbstractControl} {
    return this.filingForm.controls;
  }

  onFile(){

  }

  openDocumentationModal() {
    const modalRef = this.ngbModal.open(DocumentationModalComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.docsArr = this.selectedDocs;
  }

  getSelectedDocs($event: string[]): void{ 
    this.selectedDocs = $event;
    // for(let i = 0; i < this.selectedDocs.length; i++) {
    //   this.documentsForm.addControl(this.changeNameFormat(this.selectedDocs[i]), this.formBuilder.control(''));
    // }
    // this.documentsForm.removeControl(this.changeNameFormat(this.multiselect.popedElement.toString()));
    // console.log(this.documentsForm.value);
  }

}
