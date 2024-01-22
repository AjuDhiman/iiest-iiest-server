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
  recipientInfo:any;

  operationForm:FormGroup=new FormGroup({
    recipient_name:new FormControl(''),
    fbo_name:new FormControl(''),
    owner_name:new FormControl(''),
    father_name:new FormControl(''),
    dob:new FormControl(''),
    address:new FormControl(''),
    recipient_contact_no: new FormControl(''),
    email:new FormControl(''),
    aadhar_no:new FormControl(''),
    pancard_no:new FormControl(''),
    fostac_total:new FormControl(''),
    sales_person:new FormControl(''),
    officer_name: new FormControl(''),
    username:new FormControl(''),
    password:new FormControl('')
  })

  constructor(private _utilityService:UtilitiesService, 
              private getDataService: GetdataService,
              private formBuilder:FormBuilder){
  }

  ngOnInit(): void {

    this.candidateId=this._utilityService.getOperationRecpId();
    console.log(this.candidateId);
    this.getDataService.getMoreCaseInfo(this.candidateId).subscribe({
      next: (res)=>{
        console.log(res);
        this.operationForm.patchValue({recipient_name:res.populatedInfo.name});
        this.operationForm.patchValue({fbo_name:res.populatedInfo.salesInfo.fboInfo.fbo_name});
        this.operationForm.patchValue({owner_name:res.populatedInfo.salesInfo.fboInfo.owner_name});
        this.operationForm.patchValue({recipient_contact_no:res.populatedInfo.phoneNo});
        this.operationForm.patchValue({aadhar_no:res.populatedInfo.aadharNo});
        this.operationForm.patchValue({fostac_total:res.populatedInfo.salesInfo.fostacInfo.fostac_total});
        this.operationForm.patchValue({sales_date:this.getFormatedDate(res.populatedInfo.salesInfo.createdAt)});
        this.operationForm.patchValue({sales_person:res.populatedInfo.salesInfo.employeeInfo.employee_name});
      }
    })

    this.operationForm=this.formBuilder.group({
      recipient_name:['',Validators.required],
      fbo_name:['',Validators.required],
      owner_name:['',Validators.required],
      father_name:['',Validators.required],
      dob:['',Validators.required],
      address:['', Validators.required],
      recipient_contact_no:['',[Validators.required,Validators.pattern(/^[0-9]{10}$/)]],
      email: ['',[Validators.required,Validators.email]],
      aadhar_no:['',Validators.required],
      pancard_no:[''],
      fostac_total:['',Validators.required],
      sales_date:['',Validators.required],
      sales_person:['',Validators.required],
      username:['',Validators.required],
      password:['',Validators.required]
    });

  }

  get operationform(): { [key: string]: AbstractControl } {
    return this.operationForm.controls;
  }


  
  getFormatedDate(date: string): string {
    const originalDate = new Date(date);
    const year = originalDate.getFullYear();
    const month = String(originalDate.getMonth() + 1).padStart(2, '0');
    const day = String(originalDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate
  }


  onSubmit(){
     this.submitted=true;
     console.log(this.operationForm);
  }
}
