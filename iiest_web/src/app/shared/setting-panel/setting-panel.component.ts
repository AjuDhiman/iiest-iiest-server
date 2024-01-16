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
      userImage:['',[Validators.required]],
      userSignature:['',[Validators.required]]
    })
  }

  get updateprofileform(): { [key: string]: AbstractControl } {
    return this.updateProfileForm.controls;
  }
}
