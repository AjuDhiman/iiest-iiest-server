import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GetdataService } from 'src/app/services/getdata.service';

@Component({
  selector: 'app-setting-panel',
  templateUrl: './setting-panel.component.html',
  styleUrls: ['./setting-panel.component.scss']
})
export class SettingPanelComponent implements OnInit {
  submitted:boolean = false;
  userImage:string;
  updateProfileForm:FormGroup = new FormGroup({
    userImage:new FormControl(''),
    userSignature:new FormControl('')
  })

  constructor(private formBuilder:FormBuilder,
    private getDataService:GetdataService){
    
  }

  ngOnInit(): void {
    this.updateProfileForm=this.formBuilder.group({
      userImage:['',[Validators.required,this.validateFileType(['png'])]],
      userSignature:['',[Validators.required,this.validateFileType(['png','jpg'])]]
    })

    this.getUserImage();
  }

  get updateprofileform(): { [key: string]: AbstractControl } {
    return this.updateProfileForm.controls;
  }

  onProfileUpdate(){
    this.submitted = true;
    //return;
    if (this.updateProfileForm.invalid) {
      return;
    }
  }

  getUserImage(){
    let user:any = sessionStorage.getItem('LoggedInUser');
    let parsedUser = JSON.parse(user);
    this.getDataService.getUserImage(parsedUser.employeeImage).subscribe({
      next: (res)=>{
        this.userImage = res.imageConverted;
      }
    })
  }

  validateFileType(allowedExtensions: string[]) {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const file = control.value;
      if (file) {
        const fileExtension = file.split('.').pop()?.toLowerCase();
        if (fileExtension && allowedExtensions.find(item => item === fileExtension)) {
          return null;
        } else {
          return { invalidFileType: true };
        }
      }

      return null;
    };
  }
}
