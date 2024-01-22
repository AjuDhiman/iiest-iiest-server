import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GetdataService } from 'src/app/services/getdata.service';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-operationform',
  templateUrl: './operationform.component.html',
  styleUrls: ['./operationform.component.scss']
})
export class OperationformComponent implements OnInit{
  candidateId:string;
  submitted:boolean=false;

  operationForm:FormGroup=new FormGroup({
    candidate_name:new FormControl(''),
    father_name:new FormControl(''),
    email:new FormControl(''),
    aadhar_no:new FormControl('')
  })

  constructor(private _utilityService:UtilitiesService, 
              private getDataService: GetdataService,
              private formBuilder:FormBuilder){
  }

  ngOnInit(): void {

    this.candidateId=this._utilityService.getOperationRecpId();
    this.getDataService.getMoreCaseInfo(this.candidateId).subscribe({
      next: (res)=>{
        console.log(res.moreInfo);
      }
    })

    this.operationForm=this.formBuilder.group({
      candidate_name:['',Validators.required],
      father_name:['',Validators.required],
      email: ['',[Validators.required,Validators.email]],
      aadhar_no:['',Validators.required],
      pancard:[''],
      username:['',Validators.required],
      password:['',Validators.required]
    })
  }

  get operationform(): { [key: string]: AbstractControl } {
    return this.operationForm.controls;
  }


  onSubmit(){

  }
}
