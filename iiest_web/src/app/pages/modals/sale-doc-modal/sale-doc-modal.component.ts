import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IconDefinition, faFile } from '@fortawesome/free-solid-svg-icons';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { RegisterService } from 'src/app/services/register.service';
import { ViewDocumentComponent } from '../view-document/view-document.component';

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

    //return if foc form is invalid or still in loading process of previous hit so multiple hit problem wil be solved
    if (this.docForm.invalid || this.loading) {
      return;
    }

    this.loading = true;

    //upoad all docs one by one we are waiting on doc to uplpad before uploading another one. 
    await this.uploadDoc('Manager Photo', 'Image', false, this.fboData.fboInfo.customer_id, this.managerPhotoFile);
    await this.uploadDoc('Shop Photo', 'Image', false, this.fboData.fboInfo.customer_id, this.shopPhotoFile);
    await this.uploadDoc('Manager Aadhar', 'Image', true, this.fboData.fboInfo.customer_id, this.aadharFile);

    this.activeModal.close()
    //update basic doc upload for the fbo in case all there basic doc uploaed
      this._registerService.updateFboBasicDocStatus(this.fboData.fboInfo._id).subscribe({
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
      managerPhoto: ['',[ Validators.required,this.validateFileType(['png', 'jpg', 'jpeg'])]],
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
            break;
          case 'shopPhoto':
            this.shopPhotoFile = file;
            break;
          case 'aadharPhoto':
            this.aadharFile = $event.target.files;
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
    let docs = this.fboData.docs[0].documents;

    console.log(docs);

    this.managerPhotoObj = docs.find((doc: any) => doc.name === 'Manager Photo');
    this.managerAadharObj = docs.find((doc: any) => doc.name === 'Manager Aadhar');
    this.shopPhotoObj = docs.find((doc: any) => doc.name === 'Shop Photo');
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
}
