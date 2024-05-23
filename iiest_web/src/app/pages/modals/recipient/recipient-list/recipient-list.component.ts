import { Component, Input } from '@angular/core';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faFile } from '@fortawesome/free-solid-svg-icons';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';
import { ViewDocumentComponent } from '../../../modals/view-document/view-document.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-recipient-list',
  templateUrl: './recipient-list.component.html',
  styleUrls: ['./recipient-list.component.scss']
})
export class RecipientListComponent {
  @Input() serviceType: string = '';
  @Input() showPagination: boolean = false;
  pageNumber: number = 1;
  @Input() isfostac: boolean = false;
  @Input() isfoscos: boolean = false;
  @Input() shopData: any;
  @Input() recipientData: any;
  faFile: IconDefinition = faFile;

  constructor(public activeModal: NgbActiveModal,
    private _registerService: RegisterService,
    private getDataServices: GetdataService,
    private _toastrService: ToastrService,
    private modalService: NgbModal,) {

  }

  onTableDataChange(event: any) {
    this.pageNumber = event;
    // this.filter();
  }

  uploadEbill($event: any, shopId: string) {
    const file = $event.target.files[0];
    if (file.type !== 'image/jpeg' && file.type !== 'image/jpg' && file.type !== 'image/png') {
      this._toastrService.error('file type should be jpeg, jpg or png', 'Invalid file type');
      return;
    }
    let formData: FormData = new FormData();
    formData.append('eBill', file);
    this._registerService.uploadEbill(shopId, formData).subscribe({
      next: res => {
        this.activeModal.close();
        this._toastrService.success('Ebill Uploaded')
      }
    })
  }

  uploadOwnerPhoto($event: any, shopId: string) {
    const file = $event.target.files[0];
    if (file.type !== 'image/jpeg' && file.type !== 'image/jpg' && file.type !== 'image/png') {
      this._toastrService.error('file type should be jpeg, jpg or png', 'Invalid file type');
      return;
    }
    let formData: FormData = new FormData();
    formData.append('ownerPhoto', file);
    this._registerService.uploadOwnerPhoto(shopId, formData).subscribe({
      next: res => {
        this.activeModal.close();
        this._toastrService.success('Owner photo Uploaded')
      }
    })
  }

  uploadShopPhoto($event: any, shopId: string) {
    const file = $event.target.files[0];
    if (file.type !== 'image/jpeg' && file.type !== 'image/jpg' && file.type !== 'image/png') {
      this._toastrService.error('file type should be jpeg, jpg or png', 'Invalid file type');
      return;
    }
    let formData: FormData = new FormData();
    formData.append('shopPhoto', file);
    this._registerService.uploadShopPhoto(shopId, formData).subscribe({
      next: res => {
        this.activeModal.close();
        this._toastrService.success('shopPhoto Uploaded')
      }
    })
  }

  uploadAadharphoto($event: any, shopId: string) {
    const files = $event.target.files;
    const formData: FormData = new FormData();

    files.forEach((file: File) => {
      if (file.type !== 'image/jpeg' && file.type !== 'image/jpg' && file.type !== 'image/png') {
        this._toastrService.error('file type should be jpeg, jpg or png', 'Invalid file type');
        return;
      }
      formData.append('aadharPhoto', file);
    });

    this._registerService.uploadAadharPhoto(shopId, formData).subscribe({
      next: res => {
        this.activeModal.close();
        this._toastrService.success('Aadhar Uploaded')
      }
    })
  }

  uploadFostacCertificate($event: any, shopId: string) {
    const file = $event.target.files[0];
    if (file.type !== 'image/jpeg' && file.type !== 'image/jpg' && file.type !== 'image/png' && file.type !== 'application/pdf') {
      this._toastrService.error('file type should be jpeg, jpg, png or pdf', 'Invalid file type');
      return;
    }
    let formData: FormData = new FormData();
    formData.append('fostacCertificate', file);
    this._registerService.uploadFostacCertificate(shopId, formData).subscribe({
      next: res => {
        this.activeModal.close();
        this._toastrService.success('fostacCertificate Uploaded')
      }
    })
  }

  uploadFoscosLicense($event: any, shopId: string) {
    const file = $event.target.files[0];
    if (file.type !== 'image/jpeg' && file.type !== 'image/jpg' && file.type !== 'image/png' && file.type !== 'application/pdf') {
      this._toastrService.error('file type should be jpeg, jpg, png or pdf', 'Invalid file type');
      return;
    }
    let formData: FormData = new FormData();
    formData.append('foscosLicense', file);
    this._registerService.uploadFoscosLicense(shopId, formData).subscribe({
      next: res => {
        this.activeModal.close();
        this._toastrService.success('foscosLicense Uploaded')
      }
    })
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
