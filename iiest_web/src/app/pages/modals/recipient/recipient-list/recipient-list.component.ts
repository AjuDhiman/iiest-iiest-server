import { Component, Input } from '@angular/core';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faFile } from '@fortawesome/free-solid-svg-icons';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';

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
  @Input() recipientData:any;
  faFile: IconDefinition = faFile;

  constructor(public activeModal: NgbActiveModal,
    private _registerService: RegisterService,
    private getDataServices: GetdataService,
    private _toastrService: ToastrService) {

  }

  onTableDataChange(event: any) {
    this.pageNumber = event;
    // this.filter();
  }

  uploadEbill($event: any, shopId: string){
    let file = $event.target.files[0];
    if(file.type !== 'image/jpeg' && file.type !== 'image/jpg') {
      this._toastrService.error('file type should be jpeg or jpg', 'Invalid file type');
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

  uploadOwnerPhoto($event: any, shopId: string){
    let file = $event.target.files[0];
    if(file.type !== 'image/jpeg' && file.type !== 'image/jpg') {
      this._toastrService.error('file type should be jpeg or jpg', 'Invalid file type');
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

  uploadShopPhoto($event: any, shopId: string){
    let file = $event.target.files[0];
    if(file.type !== 'image/jpeg' && file.type !== 'image/jpg') {
      this._toastrService.error('file type should be jpeg or jpg', 'Invalid file type');
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
}
