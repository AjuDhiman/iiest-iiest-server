import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
    username: new FormControl(''),
    password: new FormControl(''),
    payment_amount: new FormControl(''),
    payment_recipt: new FormControl(''),
    payment_date: new FormControl('')
  });

  constructor(private formBuilder: FormBuilder){

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
}
