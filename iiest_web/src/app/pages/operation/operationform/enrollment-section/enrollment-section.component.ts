import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-enrollment-section',
  templateUrl: './enrollment-section.component.html',
  styleUrls: ['./enrollment-section.component.scss']
})
export class EnrollmentSectionComponent implements OnInit {
//global variables
enrolled:boolean=false;
isTentTrainingDate:boolean=false;

//icons
faCircleExclamation=faCircleExclamation

enrollmentForm:FormGroup=new FormGroup({
  tentative_training_date:new FormControl(''),
  fostac_training_date:new FormControl(''),
  roll_no:new FormControl('')
})

constructor(private formBuilder:FormBuilder){

}
  
ngOnInit(): void {
  this.enrollmentForm=this.formBuilder.group({
    tentative_training_date:['',Validators.required],
    fostac_training_date:['', Validators.required],
    roll_no:['',Validators.required]
  })
}

get enrollmentform(): { [key: string]: AbstractControl } {
  return this.enrollmentForm.controls;
}

onEnroll(){
  this.enrolled=true;
  if(this.enrollmentForm.invalid){
    return
  }
}
}
