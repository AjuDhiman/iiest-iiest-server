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

  submitted: boolean = false;
  aadharFile: File;
  shopPhotoFile: File;
  managerPhotoFile: File;
  loading: boolean = false; // var for deciding loader 
  serviceType: string;
  fboData: any;

  managerPhotoObj: any;
  shopPhotoObj: any;
  managerAadharObj: any;

  //fa icons
  faFile: IconDefinition = faFile;

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

  onSubmit() {

    if (this.docForm.invalid || this.loading) {
      return;
    }

    this.loading = true;

    // Call the uploadDoc function for each document and wait for all to finish
    Promise.all([
      this.uploadDoc('Manager Photo', 'Image', false, this.fboData.fboInfo.customer_id, this.managerPhotoFile),
      this.uploadDoc('Shop Photo', 'Image', false, this.fboData.fboInfo.customer_id, this.shopPhotoFile),
      this.uploadDoc('Manager Aadhar', 'Image', true, this.fboData.fboInfo.customer_id, this.aadharFile)
    ]).then(() => {
      // This function is called after all documents are uploaded successfully
      
      this.activeModal.close()
      this._registerService.updateFboBasicDocStatus(this.fboData.fboInfo._id).subscribe({
        next: res => {
          this._toastrService.success('', `Docs Uploaded Successfully.`);
          this.loading = false;
          location.reload();
        }
      })
    }).catch(err => {
      // Handle any errors that occurred during the uploads
      console.error('Error uploading documents:', err);
    });

  }

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

  getDocsObjs(): void {
    let docs = this.fboData.docs;

    console.log(docs);

    this.managerPhotoObj = docs.find((doc: any) => doc.name === 'Manager Photo');
    console.log(this.managerPhotoObj);
    this.managerAadharObj = docs.find((doc: any) => doc.name === 'Manager Aadhar');
    this.shopPhotoObj = docs.find((doc: any) => doc.name === 'Shop Photo');
  }

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
