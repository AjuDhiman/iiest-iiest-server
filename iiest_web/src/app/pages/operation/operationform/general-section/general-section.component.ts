import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-general-section',
  templateUrl: './general-section.component.html',
  styleUrls: ['./general-section.component.scss']
})
export class GeneralSectionComponent implements OnInit{
  generalForm: FormGroup = new FormGroup({
    other_case: new FormControl(''),
    officer_note: new FormControl(''),
  });

  constructor(private formBuilder:FormBuilder){

  }

  ngOnInit(): void{
    this.generalForm = this.formBuilder.group({
      other_case: [''],
      officer_note: ['']
    });
  }

  get generalform(): { [key: string]: AbstractControl } {
    return this.generalForm.controls;
  }
}
