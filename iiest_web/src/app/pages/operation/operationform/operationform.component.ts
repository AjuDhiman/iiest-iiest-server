import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GetdataService } from 'src/app/services/getdata.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { faCircleXmark, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { RegisterService } from 'src/app/services/register.service';

@Component({
  selector: 'app-operationform',
  templateUrl: './operationform.component.html',
  styleUrls: ['./operationform.component.scss']
})
export class OperationformComponent implements OnInit{
  candidateId:string;
  submitted:boolean=false;
  recipientInfo:any;
  faCircleCheck=faCircleCheck;

  verificationForm:FormGroup=new FormGroup({
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

  enrollmentForm:FormGroup=new FormGroup({
    training_date:new FormControl(''),
    roll_no:new FormControl('')
  })

  constructor(private _utilityService:UtilitiesService, 
              private getDataService: GetdataService,
              private registerService:RegisterService,
              private formBuilder:FormBuilder){
  }

  ngOnInit(): void {

    this.candidateId=this._utilityService.getOperationRecpId();
    this.getDataService.getMoreCaseInfo(this.candidateId).subscribe({
      next: (res)=>{
        console.log(res);
        this.verificationForm.patchValue({recipient_name:res.populatedInfo.name});
        this.verificationForm.patchValue({fbo_name:res.populatedInfo.salesInfo.fboInfo.fbo_name});
        this.verificationForm.patchValue({owner_name:res.populatedInfo.salesInfo.fboInfo.owner_name});
        this.verificationForm.patchValue({address:res.populatedInfo.salesInfo.fboInfo.address});
        this.verificationForm.patchValue({recipient_contact_no:res.populatedInfo.phoneNo});
        this.verificationForm.patchValue({aadhar_no:res.populatedInfo.aadharNo});
        this.verificationForm.patchValue({fostac_total:res.populatedInfo.salesInfo.fostacInfo.fostac_total});
        this.verificationForm.patchValue({sales_date:this.getFormatedDate(res.populatedInfo.salesInfo.createdAt)});
        this.verificationForm.patchValue({sales_person:res.populatedInfo.salesInfo.employeeInfo.employee_name});
      }
    })

    this.verificationForm=this.formBuilder.group({
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

    this.enrollmentForm=this.formBuilder.group({
      training_date:['',Validators.required],
      roll_no:['',Validators.required]
    })

  }

  get verificationform(): { [key: string]: AbstractControl } {
    return this.verificationForm.controls;
  }

  get enrollmentform(): { [key: string]: AbstractControl } {
    return this.enrollmentForm.controls;
  }
  
  getFormatedDate(date: string): string {
    const originalDate = new Date(date);
    const year = originalDate.getFullYear();
    const month = String(originalDate.getMonth() + 1).padStart(2, '0');
    const day = String(originalDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate
  }

  onVerify($event:any){
     $event.preventDefault();
     this.submitted=true;
     console.log(this.candidateId)
     if(this.verificationForm.invalid){
      return
     }
     this.registerService.operationBasicForm(this.candidateId, this.verificationForm.value).subscribe({
      next: res => {
        console.log(res);
      }
     })
  }
}
