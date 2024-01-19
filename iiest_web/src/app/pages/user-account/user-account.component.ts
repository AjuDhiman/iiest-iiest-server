import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';

@Component({
  selector: 'app-user-account',
  templateUrl: './user-account.component.html',
  styleUrls: ['./user-account.component.scss']
})
export class UserAccountComponent {
  submitted:boolean = false;
  userImage:string = '../../../assets/logo-side.png';
  userSign:string;
  selectedImage:string = '';
  selectedSign:string = '';
  imageObj: any;
  signObj: any;
  updateProfileForm:FormGroup = new FormGroup({
    userImage:new FormControl(''),
    userSign:new FormControl('')
  })

  constructor(private formBuilder:FormBuilder,
    private getDataService:GetdataService,
    private registerService:RegisterService,
    private toastrService:ToastrService){
    
  }

  ngOnInit(): void {
    this.updateProfileForm=this.formBuilder.group({
      userImage:['',[this.validateFileType(['png', 'jpg','jpeg'])]],
      userSign:['',[this.validateFileType(['png'])]]
    })

    this.getUserImage();
    this.getUserSign();
  }

  get updateprofileform(): { [key: string]: AbstractControl } {
    return this.updateProfileForm.controls;
  }

  onProfileUpdate(){
    this.submitted = true;
    console.log(this.updateProfileForm)
    //return;
    if (this.updateProfileForm.invalid) {
      return;
    }

    const formData = new FormData();

    formData.append('userImage', this.imageObj);
    formData.append('userSign', this.signObj);

    const filesSelect: any = formData

    this.registerService.editEmployeeFiles(filesSelect).subscribe({
      next: (res)=>{
        if(res.success){
          this.registerService.replaceToken(res);
          location.reload();
          this.toastrService.success('', 'Record Edited Successfully');
        }
      },
      error: (err)=>{
        let errorObj = err.error
        if(errorObj.editImageErr){
          this.toastrService.error('', 'Something went wrong with image. Please try again');
        }else if(errorObj.editSignErr){
          this.toastrService.error('', 'Something went wrong with signature. Please try again');
        }
      }
    })

  }

  getUserImage(){
    let user:any = this.registerService.LoggedInUserData();
    let parsedUser = JSON.parse(user);
    this.getDataService.getUserImage(parsedUser.employeeImage).subscribe({
      next: (res)=>{
        this.userImage = res.imageConverted;
      }
    })
  }

  getUserSign(){
    let user:any = this.registerService.LoggedInUserData();
    let parsedUser = JSON.parse(user);
    this.getDataService.getUserSign(parsedUser.signatureImage).subscribe({
      next: (res)=>{
        this.userSign = res.signatureConverted;
      }
    })
  }

  changeImage($event:any){
    let image = $event.target.files[0];

    if(image){
      let reader:FileReader = new FileReader()
      reader.onload = (e: any) => {
        // Set the image source to the base64 data URL
        this.selectedImage = e.target.result;
      };
      // Read the selected image as a data URL
      reader.readAsDataURL(image);
      this.imageObj = image;
    }
  }

  changeSign($event:any){
    let image = $event.target.files[0];
    if(image){
      let reader:FileReader = new FileReader()
      reader.onload = (e: any) => {
        // Set the image source to the base64 data URL
        this.selectedSign = e.target.result;
      };
      // Read the selected image as a data URL
      reader.readAsDataURL(image);
      this.signObj = image;
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
