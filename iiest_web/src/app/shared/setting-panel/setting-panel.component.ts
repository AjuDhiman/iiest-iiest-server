import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-setting-panel',
  templateUrl: './setting-panel.component.html',
  styleUrls: ['./setting-panel.component.scss']
})
export class SettingPanelComponent implements OnInit {
  submitted:boolean = false;
  updateProfileForm:FormGroup = new FormGroup({
    userImage:new FormControl(''),
    userSignature:new FormControl('')
  })

  constructor(private formBuilder:FormBuilder){
    
  }

  ngOnInit(): void {
    this.updateProfileForm=this.formBuilder.group({
      userImage:['',[Validators.required,this.validateFileType(['png'])]],
      userSignature:['',[Validators.required,this.validateFileType(['png','jpg'])]]
    })
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

  validateFileType(allowedExtensions: string[]) {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const file = control.value;
      console.log(file);
      if (file) {
        const fileExtension = file.split('.').pop()?.toLowerCase();
        console.log(fileExtension)
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
