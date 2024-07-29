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

  //vars
  submitted:boolean = false;
  //default employee image and signture
  userImage:string = '../../../assets/logo-side.png';
  userSign:string;

  selectedImage:string = '';
  selectedSign:string = '';

  //image and sign file vars
  imageObj: any;
  signObj: any;

  //loading vafr
  loading:boolean = false;

  //var for storing file names
  imageName: string;
  signName: string;

  //user form
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
    //setting form vaildation
    this.updateProfileForm=this.formBuilder.group({
      userImage:['',[this.validateFileType(['png', 'jpg','jpeg'])]],
      userSign:['',[this.validateFileType(['png'])]]
    })

    //get user image and siganture
    this.getUserImage();
    this.getUserSign();
  }

  get updateprofileform(): { [key: string]: AbstractControl } {
    return this.updateProfileForm.controls;
  }

  //submit func for changing image and siganture form
  async onProfileUpdate(){
    this.submitted = true;
    //return;
    if (this.updateProfileForm.invalid || (!this.imageName && !this.signName)) {
      return;
    }
    this.loading = true;

    //upload image and signature of employee to s3 bucket in case image or sign change
    if(this.imageName){
      await this.uploadEmpImage();
    }

    if(this.signName) {
      await this.uploadEmpSignature();
    }

    const filesSelect: {userImage: string, userSignature: string} = {userImage: this.imageName, userSignature: this.signName};
 
    this.registerService.editEmployeeFiles(filesSelect).subscribe({
      next: (res)=>{
        this.loading = false;
        if(res.success){
          this.registerService.replaceToken(res);
          location.reload();
          this.toastrService.success('', 'Record Edited Successfully');
        }
      },
      error: (err)=>{
        this.loading = false;
        let errorObj = err.error
        if(errorObj.editImageErr){
          this.toastrService.error('', 'Something went wrong with image. Please try again');
        }else if(errorObj.editSignErr){
          this.toastrService.error('', 'Something went wrong with signature. Please try again');
        }
      }
    })

  }

  //getting user image
  getUserImage(){
    let user:any = this.registerService.LoggedInUserData();
    let parsedUser = JSON.parse(user);
    this.getDataService.getUserImage(parsedUser.employeeImage).subscribe({
      next: (res)=>{
        if(res.imageConverted){
          this.userImage = res.imageConverted;
        }
      }
    })
  }

   //getting user sign
  getUserSign(){
    let user:any = this.registerService.LoggedInUserData();
    let parsedUser = JSON.parse(user);
    this.getDataService.getUserSign(parsedUser.signatureImage).subscribe({
      next: (res)=>{
        this.userSign = res.signatureConverted;
        console.log(res);
      }
    })
  }

  //set configuration on image select
  changeImage($event:any){
    let image = $event.target.files[0];
    const fileExt = $event.target.files[0].name;
    const fileExtension = fileExt.split('.').pop()?.toLowerCase();

    if(image){
      let reader:FileReader = new FileReader()
      reader.onload = (e: any) => {
        // Set the image source to the base64 data URL
        if(fileExtension == "png" || fileExtension == "jpg" || fileExtension == "jpeg") {
          this.selectedImage = e.target.result;
          this.imageName = `employeeImage${new Date().getTime()}.${fileExtension}`;
        } else {
          alert("Only .png, .jpg, .jpeg are allowed");
        }
      };
      // Read the selected image as a data URL
      reader.readAsDataURL(image);
      this.imageObj = image;
    }
  }

   //set configuration on sign select
  changeSign($event:any){
    let image = $event.target.files[0];
    if(image){
      let reader:FileReader = new FileReader()
      reader.onload = (e: any) => {
        // Set the image source to the base64 data URL
        this.selectedSign = e.target.result;
        this.signName = `empSignature${new Date().getTime()}.png`;
      };
      // Read the selected image as a data URL
      reader.readAsDataURL(image);
      this.signObj = image;
    }
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

    //methord for uploading e,mployee signature
    uploadEmpSignature(): Promise<any> {
      return new Promise((resolve, reject) => {
        this.getDataService.getEmployeeDocUploadURL(this.signName, this.signObj.type).subscribe({
          next: res => {
            this.registerService.uplaodDocstoS3(res.uploadUrl, this.signObj).subscribe({
              next: res => {
                resolve(res);
                // this.form.patchValue({'empSignature': this.empSignature});
                // this.toastrService.success('Done')
              },
              error: err => {
                this.loading = false;
                reject(err);
                this.toastrService.error('Signature Uploading Problem')
              }
            });
          }
        })
      })
    }
  
     //methord for uploading e,mployee image
     uploadEmpImage(): Promise<any> {
      return new Promise((resolve, reject) => {
        this.getDataService.getEmployeeDocUploadURL(this.imageName, this.imageObj.type).subscribe({
          next: res => {
            this.registerService.uplaodDocstoS3(res.uploadUrl, this.imageObj).subscribe({
              next: res => {
                // this.form.patchValue({'employeeImage': this.empImage});
                resolve(res);
                // this.toastrService.success('Done')
              },
              error: err => {
                this.loading = false;
                reject(err);
                this.toastrService.error('Image Uploading Problem')
              }
            });
          }
        })
      })
    }
}
