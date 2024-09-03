import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { IconDefinition, faFile } from '@fortawesome/free-solid-svg-icons';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { RegisterService } from 'src/app/services/register.service';
import { ViewDocumentComponent } from '../view-document/view-document.component';
import { GetdataService } from 'src/app/services/getdata.service';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-sale-doc-modal',
  templateUrl: './sale-doc-modal.component.html',
  styleUrls: ['./sale-doc-modal.component.scss']
})
export class SaleDocModalComponent implements OnInit {

  //var keeps track that form is sumbitted or not
  submitted: boolean = false;
  serviceType: string;

  //var contains all the data about fbo to show
  fboData: any;

  //variables contains data related to images or files if exsists snd comming from backend
  managerPhotoObj: any;
  shopPhotoObj: any;
  managerAadharObj: any;

  //var for saving names of the docs
  aadhar: string[] = [];
  managerPhoto: string = '';
  shopPhoto: string = '';

  //var that will containg generated file name and save it in documents schema
  docObjects: { name: string, format: string, isMultiDoc: boolean, src: string[] }[] = [];

  //var for storing files
  aadharFile: File;
  shopPhotoFile: File;
  managerPhotoFile: File;

  // var for deciding loader 
  loading: boolean = false;

  //fa icons
  faFile: IconDefinition = faFile;

  //logic form
  docForm: FormGroup = new FormGroup({
    managerName: new FormControl(''),
    address: new FormControl(''),
    pincode: new FormControl(''),
    shopPhoto: new FormControl(''),
    managerPhoto: new FormControl(''),
    managerAadhar: new FormControl('')
  });

  get docform(): { [key: string]: AbstractControl } {
    return this.docForm.controls;
  }

  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private _registerService: RegisterService,
    private _toastrService: ToastrService,
    private _getdataService: GetdataService,
    private _utilServives: UtilitiesService,
    private modalService: NgbModal
  ) {

  }

  ngOnInit(): void {
    this.setFormValidation();
    this.docForm.patchValue({
      managerName: this.fboData.fboInfo.boInfo.manager_name,
      address: this.fboData.fboInfo.address,
      pincode: this.fboData.fboInfo.pincode,
    });

  }

  //metord runs on submit button hit
  async onSubmit() {

    this.submitted = true;
    //return if foc form is invalid or still in loading process of previous hit so multiple hit problem wil be solved
    if (this.docForm.invalid || this.loading) {
      return;
    }

    this.loading = true;

    //upoad all docs one by one we are waiting on doc to uplpad before uploading another one. 
    // await this.uploadDoc('Manager Photo', 'Image', false, this.fboData.fboInfo.customer_id, this.managerPhotoFile);
    // await this.uploadDoc('Shop Photo', 'Image', false, this.fboData.fboInfo.customer_id, this.shopPhotoFile);
    // await this.uploadDoc('Manager Aadhar', 'Image', true, this.fboData.fboInfo.customer_id, this.aadharFile);
    await this.uploadShopImage();
    await this.uploadManagerAddharFront();
    await this.uploadManagerImage();
    if (this.aadhar[1]) {
      await this.uploadManagerAddharBack();
    }
    // await this.uploadManagerImage();

    this.activeModal.close()
    //update basic doc upload for the fbo in case all there basic doc uploaed

    this._registerService.updateFboBasicDocStatus(this.fboData.fboInfo._id, this.fboData.fboInfo.customer_id, this.docObjects).subscribe({
      next: res => {
        this._toastrService.success('', `Docs Uploaded Successfully.`);
        this.loading = false;
        location.reload();
      },
      error: err => {
        this.loading = false;
        this._toastrService.error('', `Docs Uploading Error.`);
      }
    })
  }


  //setting form validation
  setFormValidation() {
    this.docForm = this.formBuilder.group({
      managerName: ['', Validators.required],
      address: ['', Validators.required],
      pincode: ['', Validators.required],
      shopPhoto: ['', [Validators.required, this.validateFileType(['png', 'jpg', 'jpeg'])]],
      managerPhoto: ['', [Validators.required, this.validateFileType(['png', 'jpg', 'jpeg'])]],
      managerAadhar: ['', [Validators.required, this.validateFileType(['png', 'jpg', 'jpeg'])]]
    });

    this.getDocsObjs();
  }

  //get file on file upload
  onImageChangeFromFile($event: any, fileType: string) {
    if ($event.target.files && $event.target.files[0]) {
      let file = $event.target.files[0];
      if (file.type == "image/jpeg" || file.type == "image/jpg" || file.type == "image/png" || file.type == "application/pdf") {
        switch (fileType) {
          case 'managerPhoto':
            this.managerPhotoFile = file;
            this.managerPhoto = `managerphoto${new Date().getTime()}.${this._utilServives.getExtention(this.managerPhotoFile.name)}`;
            break;
          case 'shopPhoto':
            this.shopPhotoFile = file;
            this.shopPhoto = `shopphoto${new Date().getTime()}.${this._utilServives.getExtention(this.shopPhotoFile.name)}`;
            break;
          case 'aadharPhoto':
            this.aadharFile = $event.target.files;
            this.aadhar[0] = `aadharfront${new Date().getTime()}.${this._utilServives.getExtention((this.aadharFile as any)[0].name)}`;
            if ((this.aadharFile as any)[1]) {
              this.aadhar[1] = `aadharback${new Date().getTime()}.${this._utilServives.getExtention((this.aadharFile as any)[1].name)}`;
            }
            break;
        }
      }
    }
  }

  //methord for uploading particular docs 
  uploadDoc(name: string, format: string, isMultiDoc: boolean, handlerId: string, document: any) {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('format', format.toLowerCase());
    formData.append('panelType', 'Fostac');
    formData.append('multipleDoc', isMultiDoc.toString());
    formData.append('handlerId', handlerId);

    if (isMultiDoc) {
      document.forEach((file: any) => {
        formData.append('document', file);
      });
    } else {
      formData.append('document', document);
    }

    let saveDocument: any;

    if (this.serviceType == 'Fostac') {
      saveDocument = this._registerService.saveFostacDocument(formData);
    } else if (this.serviceType == 'Foscos') {
      saveDocument = this._registerService.saveFoscosDocument(formData);
    } else if (this.serviceType == 'HRA' || this.serviceType == 'Medical' || this.serviceType == 'Water Test Report') {
      saveDocument = this._registerService.saveHraDocument(formData);
    }

    return new Promise((resolve, reject) => {
      saveDocument.subscribe({
        next: (res: any) => {
          resolve(res);
        },
        error: (err: any) => {
          reject(err);
        }
      });
    });

  }


  //getting docs to view
  getDocsObjs(): void {
    // let docs = this.fboData.docs[0].documents;

    this._getdataService.getDocs(this.fboData.fboInfo.customer_id).subscribe({
      next: res => {
        let docs = res.docs;
        this.managerPhotoObj = docs.find((doc: any) => doc.name === 'Manager Photo');
        this.managerAadharObj = docs.find((doc: any) => doc.name === 'Manager Aadhar');
        this.shopPhotoObj = docs.find((doc: any) => doc.name === 'Shop Photo');
      }
    })


  }


  //open view document modal
  viewDocument(name: string, res: any, format: string, isMultiDoc: boolean): void { // methord for calling viewdoc component for a particucar doc

    let obj = {
      name: name,
      src: isMultiDoc ? res : [res.toString()], // we will put single src in array because our component needs array of src for showing docs
      format: format,
      multipleDoc: isMultiDoc
    }
    const modalRef = this.modalService.open(ViewDocumentComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.doc = obj;
  }


  //file extention validator
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

  //file num validation
  validateFileNumber(maxFiles: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const files = control.value;
      if (files && files.length > maxFiles) {
        return { invalidFileNumber: true };
      }
      return null;
    };
  }

  //methord for uploading shop image
  uploadShopImage(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._getdataService.getSalesBasicDocUploadURL(this.shopPhoto, this.shopPhotoFile.type).subscribe({
        next: res => {
          this._registerService.uplaodDocstoS3(res.uploadUrl, this.shopPhotoFile).subscribe({
            next: res => {

              this.docObjects.push({ name: 'Shop Photo', format: 'Image', isMultiDoc: false, src: [this.shopPhoto] });
              resolve(res);
              // this._toastrService.success('Done')
            },
            error: err => {
              this.loading = false;
              reject(err);
              this._toastrService.error('Shop Image Uploading Problem')
            }
          });
        }
      })
    })
  }

  //methord for uploading manager aadhar front
  uploadManagerAddharFront(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._getdataService.getSalesBasicDocUploadURL(this.aadhar[0], (this.aadharFile as any)[0].type).subscribe({
        next: res => {
          this._registerService.uplaodDocstoS3(res.uploadUrl, (this.aadharFile as any)[0]).subscribe({
            next: res => {
              if(!this.aadhar[1]){
                this.docObjects.push({ name: 'Manager Aadhar', format: 'Image', isMultiDoc: false, src: this.aadhar });
              }

              resolve(res);
              // this._toastrService.success('Done')
            },
            error: err => {
              this.loading = false;
              reject(err);
              this._toastrService.error('Manager Aadhar Uploading Problem')
            }
          });
        }
      })
    })
  }

  //methord for uploading manager aadhar Back
  uploadManagerAddharBack(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._getdataService.getSalesBasicDocUploadURL(this.aadhar[1], (this.aadharFile as any)[1].type).subscribe({
        next: res => {
          this._registerService.uplaodDocstoS3(res.uploadUrl, (this.aadharFile as any)[1]).subscribe({
            next: res => {
              this.docObjects.push({ name: 'Manager Aadhar', format: 'Image', isMultiDoc: true, src: this.aadhar });
              resolve(res);
              // this._toastrService.success('Done')
            },
            error: err => {
              this.loading = false;
              reject(err);
              this._toastrService.error('Manager Aadhar Uploading Problem')
            }
          });
        }
      })
    })
  }

  //methord for uploading manager image
  uploadManagerImage(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._getdataService.getSalesBasicDocUploadURL(this.managerPhoto, this.managerPhotoFile.type).subscribe({
        next: res => {
          this._registerService.uplaodDocstoS3(res.uploadUrl, this.managerPhotoFile).subscribe({
            next: res => {
              this.docObjects.push({ name: 'Manager Photo', format: 'Image', isMultiDoc: false, src: [this.managerPhoto] });
              resolve(res);
              // this._toastrService.success('Done')
            },
            error: err => {
              this.loading = false;
              reject(err);
              this._toastrService.error('Manager Image Uploading Problem')
            }
          });
        }
      })
    })
  }
}
