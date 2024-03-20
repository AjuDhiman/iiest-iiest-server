import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MultiSelectComponent } from 'src/app/shared/multi-select/multi-select.component';
import { foscosDocments } from 'src/app/utils/config';

@Component({
  selector: 'app-documentation-modal',
  templateUrl: './documentation-modal.component.html',
  styleUrls: ['./documentation-modal.component.scss']
})
export class DocumentationModalComponent implements OnInit {

  foscosDocuments = foscosDocments

  selectedDoc: string = '';

  docsArr : string[] = [];

  documentsForm: FormGroup = new FormGroup({});

  @ViewChild(MultiSelectComponent) multiselect: MultiSelectComponent;

  constructor(public activeModal: NgbActiveModal,
    public formBuilder: FormBuilder) {

  }

  ngOnInit(): void {
    this.documentsForm = this.formBuilder.group({});
  }

  onUpload(): void {

  }

  getSelectedDoc($event: any): void{ // methord for dynamically add and remove the form control in documents upload form
    this.selectedDoc = $event.target.value;
  }

  changeNameFormat(name:string): string { // this methord replaces " " by "_" in a string
    const updatedString: string = name.split(' ').join('_');
    return updatedString;
  }

}
