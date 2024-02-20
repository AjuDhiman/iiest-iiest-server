import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { faCircleCheck, faCircleExclamation,faFileArrowUp } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-documentation-section',
  templateUrl: './documentation-section.component.html',
  styleUrls: ['./documentation-section.component.scss']
})
export class DocumentationSectionComponent implements OnInit {

  filedStatus: boolean = false;

  filed: boolean = false;

  @Input() verifiedStatus: boolean = false;

  // icons
  faCircleCheck = faCircleCheck;
  faCircleExclamation = faCircleExclamation;
  faFileArrowUp = faFileArrowUp;


  //Filing Reactive form 
  filingForm: FormGroup = new FormGroup({
    tentative_training_date: new FormControl(''),
    fostac_training_date: new FormControl(''),
    roll_no: new FormControl(''),
  })

  constructor(){

  }

  ngOnInit(): void {
    
  }

  get filingform(): {[key: string] : AbstractControl} {
    return this.filingForm.controls;
  }

  onFile(){

  }
}
