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
      address:this.fboData.fboInfo.address,
      pincode: this.fboData.fboInfo.pincode,
    });

  }

  submitted: boolean = false;
  aadharFile: File;
  shopPhotoFile: File;
  managerPhotoFile: File;
  loading: boolean;
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

    this.uploadDoc('Manager Photo', 'Image', false, this.fboData.fboInfo.customer_id, this.managerPhotoFile);
    this.uploadDoc('Shop Photo', 'Image', false, this.fboData.fboInfo.customer_id, this.shopPhotoFile);
    this.uploadDoc('Manager Aadhar', 'Image', true, this.fboData.fboInfo.customer_id, this.aadharFile);

  }

  setFormValidation() {
    this.docForm = this.formBuilder.group({
      managerName: ['', Validators.required],
      address: ['', Validators.required],
      pincode: ['', Validators.required],
      shopPhoto: ['', Validators.required],
      managerPhoto: ['', Validators.required],
      managerAadhar: ['', Validators.required]
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
    formData.append('format', format);
    formData.append('panelType', 'Fostac');
    formData.append('multipleDoc', isMultiDoc.toString());
    formData.append('handlerId', handlerId);
    if (isMultiDoc) {
      document.forEach((file: any) => {
        formData.append('document', file);
      })
    } else {
      formData.append('document', document);
    }

    if (this.serviceType == 'Fostac') {
      this._registerService.saveFostacDocument(formData).subscribe({
        next: res => {
          this._toastrService.success('', `${name} Added Successfully.`);
        }
      });
    } else if (this.serviceType == 'Foscos') {
      this._registerService.saveFoscosDocument(formData).subscribe({
        next: res => {
          this._toastrService.success('', `${name} Added Successfully.`);
        }
      });
    }
    else if (this.serviceType == 'HRA') {
      this._registerService.saveHraDocument(formData).subscribe({
        next: res => {
          this._toastrService.success('', `${name} Added Successfully.`);
        }
      });
    }


    this.activeModal.close();

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
      src: isMultiDoc?res:[res.toString()], // we will put single src in array because our component needs array of src for showing docs
      format: format,
      multipleDoc: isMultiDoc
    }
    const modalRef = this.modalService.open(ViewDocumentComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.doc = obj;
  }
}
