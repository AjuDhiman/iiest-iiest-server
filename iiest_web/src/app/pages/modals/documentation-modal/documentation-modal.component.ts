import { Component, EventEmitter, OnInit, Output, ViewChild, ElementRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IconDefinition, faFilePdf, faTrash, faMagnifyingGlass, faEye, faDownload, faFileImage } from '@fortawesome/free-solid-svg-icons';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';
import { MultiSelectComponent } from 'src/app/shared/multi-select/multi-select.component';
import { ConformationModalComponent } from 'src/app/pages/modals/conformation-modal/conformation-modal.component';
import { ViewDocumentComponent } from 'src/app/pages/modals/view-document/view-document.component';
import { otherDocs } from 'src/app/utils/config';

@Component({
  selector: 'app-documentation-modal',
  templateUrl: './documentation-modal.component.html',
  styleUrls: ['./documentation-modal.component.scss']
})
export class DocumentationModalComponent implements OnInit {

  lastSelectedDoc: { name: string, allowedFormats: string[], mutipleDoc: boolean } = { name: '', allowedFormats: [], mutipleDoc: false }; // this var will keep track of prev val of selected doc because we want it to be removed from from group if it deselected
  selectedDoc: { name: string, allowedFormats: string[], mutipleDoc: boolean } = { name: '', allowedFormats: [], mutipleDoc: false };
  shopId: string;
  panelType: string;
  handlerId: string;

  docsArr: any = [];
  otherDocs = otherDocs;
  submitted: boolean = false;
  clearInputCount: number = 1;
  docList: any = []; //list of uploaded docs
  format: string = '';// by the help of this var we wil pass the format of the selectd doc to the backend
  loading: boolean = false; // var for opening and closing loader
  isOtherDoc: boolean = false;

  filteredData: any = [];

  faFilePdf: IconDefinition = faFilePdf;
  faTrash: IconDefinition = faTrash;
  faFileImage: IconDefinition = faFileImage;
  faMagnifyingGlass: IconDefinition = faMagnifyingGlass;
  searchQuery: string = '';

  docFile: File;

  //table vars
  itemsNumber: number = 5;
  pageNumber: number = 1;
  isSearch: boolean = false;
  selectedFilter: string = 'byName';
  isEbill: boolean = false; //var for deciding entering customer id in case of e bill

  //icons
  faEye: IconDefinition = faEye;
  faDownload: IconDefinition = faDownload;

  @Output() reloadData: EventEmitter<void> = new EventEmitter<void>;

  documentsForm: FormGroup = new FormGroup({
    expiery_date: new FormControl(''),
    issue_date: new FormControl('')
  });

  @ViewChild(MultiSelectComponent) multiselect: MultiSelectComponent;

  @ViewChild('uploadInput') uploadInput: ElementRef;

  constructor(public activeModal: NgbActiveModal,
    private _registerService: RegisterService,
    private _getDataService: GetdataService,
    private modalService: NgbModal,
    private _toastrService: ToastrService,
    public formBuilder: FormBuilder) {

  }

  ngOnInit(): void {
    this.getUserProductType();
    this.documentsForm = this.formBuilder.group({
      expiery_date: ['', Validators.required],
      issue_date: ['', Validators.required]
    });
    this.filteredData = this.docList;
  }

  get docForm(): { [key: string]: AbstractControl } {
    return this.documentsForm.controls;
  }

  getSelectedDoc($event: any): void { // methord for dynamically add and remove the form control in documents upload form
    if (this.clearInputCount > 1) {
      this.uploadInput.nativeElement.value = '';
    }
    this.clearInputCount++;
    this.lastSelectedDoc = this.selectedDoc;
    this.selectedDoc = JSON.parse($event.target.value);
    if (this.selectedDoc.name === 'Electricity Bill') {
      this.isEbill = true;
    } else {
      this.isEbill = false
    }

    if (this.selectedDoc.name === 'Others') {
      this.documentsForm.addControl('name', this.formBuilder.control(''));
      this.documentsForm.removeControl('issue_date');
      this.documentsForm.removeControl('expiery_date');
      this.isOtherDoc = true;
    } else if (this.lastSelectedDoc && this.lastSelectedDoc.name === 'Others') {
      this.isOtherDoc = false;
      this.documentsForm.removeControl('name');
      this.documentsForm.addControl('issue_date', this.formBuilder.control(''));
      this.documentsForm.addControl('expiery_date', this.formBuilder.control(''));
    }

    if (this.isEbill) {
      this.documentsForm.addControl('customer_id', this.formBuilder.control(''));
    } else {
      this.documentsForm.removeControl('customer_id');
    }

    this.documentsForm.addControl(this.changeNameFormat(this.selectedDoc.name.toString()), this.formBuilder.control(''));
    this.documentsForm.removeControl(this.changeNameFormat(this.lastSelectedDoc.name.toString()));
    console.log(this.uploadInput);
  }

  onFileChange($event: any) {

    if (this.selectedDoc.mutipleDoc) {
      this.docFile = $event.target.files;
      $event.target.files.forEach((file: File) => {
        const ext = file.name.toString().split('.').pop();
        if (ext !== 'png' && ext !== 'jpg' && ext !== 'jpeg') {
          this._toastrService.error('All file should be of type .jpg, .png or .jpeg')
        }
      });
      this.format = 'image';
      return;
    }

    this.docFile = $event.target.files[0];
    const ext = this.docFile.name.toString().split('.').pop();

    if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') {
      this.format = 'image';
    } else if (ext === 'pdf') {
      this.format = 'pdf'
    }
  }

  getUserProductType(): void {
    let user: any = this._registerService.LoggedInUserData();
    let parsedUser = JSON.parse(user);
    this.panelType = parsedUser.panel_type;
  }


  //metjord runs on upload
  onUpload(): void {
    this.submitted = false;
    if (this.documentsForm.invalid) {
      return;
    }

    if (this.docList.find((item: any) => item.name === this.selectedDoc.name)) {
      this._toastrService.info(`First delete, then upload`, `${this.selectedDoc.name} already exsists`)
      return;
    }

    this.loading = true;

    let formData = new FormData();

    if (this.isOtherDoc) { // appent specified name in case of other docs
      formData.append('name', this.documentsForm.value.name);
    } else {
      formData.append('name', this.selectedDoc.name);
    }

    if (this.isEbill) {
      const customer_id = this.documentsForm.value.customer_id;
      const extraInfo = JSON.stringify({ customer_id: customer_id });
      formData.append('customer_id', customer_id);
    }

    formData.append('format', this.format);
    formData.append('panelType', this.panelType);
    formData.append('multipleDoc', this.selectedDoc.mutipleDoc.toString());
    formData.append('handlerId', this.handlerId)
    formData.append('otherData', JSON.stringify(this.documentsForm.value))

    if (this.selectedDoc.mutipleDoc) {
      (this.docFile as any).forEach((element: File) => {
        formData.append('document', element);
      });
    } else {
      formData.append('document', this.docFile);
    }

    if (this.shopId) {
      this._registerService.saveFostacDocument(formData).subscribe({
        next: res => {
          if (res) {
            this.loading = false;
            this._toastrService.success(`${this.selectedDoc.name} Uploaded`);
            this.reloadData.emit();
            this.getDocList();
            this.documentsForm.reset();
            this.activeModal.close();
          }
        },
        error: err => {

        }
      });
    }

  }

  //methord for opening doc
  viewDocument(res: any): void { //opens the view doc modal
    const modalRef = this.modalService.open(ViewDocumentComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.doc = res;
  }

  
  //methord runs for confirmation of deleting the docs
  onDocDelete(doc: any) { // this methord opens the confirmation doc if you want to delecte some doc 
    const modalRef = this.modalService.open(ConformationModalComponent, { size: 'md', backdrop: 'static' });
    modalRef.componentInstance.action = `Delete ${doc.name}`;
    let user: any = this._registerService.LoggedInUserData();
    const parsedUser = JSON.parse(user);
    const employeeId = parsedUser.employee_id
    modalRef.componentInstance.confirmationText = employeeId;
    modalRef.componentInstance.actionFunc.subscribe((confirmation: boolean) => {
      this.deleteDoc(confirmation, doc);
    });
  }

  //methord for deleting docs
  deleteDoc(confirmation: boolean, doc: any) { // methord for deleting doc if confirmation comes true from confirmation modal this also creates audit log
    if (confirmation) {
      this.loading = true;
      this._registerService.deleteDoc(this.shopId, doc).subscribe({
        next: res => {
          if (res.success) {
            this._toastrService.success(`${doc.name} Deleted Sucessfully`, 'Deleted');
            this.reloadData.emit();
            this.getDocList();
            this.loading = false;
          }
        }
      })
    }
  }

  //getting list of all docs
  getDocList(): void {
    console.log(this.handlerId);
    this._getDataService.getDocs(this.handlerId).subscribe({
      next: res => {
        this.loading = false;
        this.docList = res.docs;
        console.log(this.docList);
        this.filteredData = this.docList;
      }
    })
  }

  //table methords
  onTableDataChange($event: number): void {
    this.pageNumber = $event;
  }

  onSearchChange() {
    if (this.searchQuery) {
      this.isSearch = true;
    } else {
      this.isSearch = false;
    }
    this.filter();
  }

  onItemNumChange() {

  }

  filter(): void {
    if (this.searchQuery === '') {
      this.filteredData = this.docList;
    } else {
      switch (this.selectedFilter) {
        case 'byName': this.filteredData = this.docList.filter((elem: any) => elem.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
          break;
        case 'byFormat': this.filteredData = this.docList.filter((elem: any) => elem.format.toLowerCase().includes(this.searchQuery.toLowerCase()));
          break;
      }
    }
    // this.filteredData.length ? this.showPagination = true : this.showPagination = false;
  }

  validateFileType(allowedExtensions: string[]) { //coustom validator for validating
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

  changeNameFormat(name: string): string { // this methord replaces " " by "_" in a string
    const updatedString: string = name.split(' ').join('_');
    return updatedString;
  }

  //methord change the view format ofthe date in the table
  getFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    let suffix = "";
    if (day === 1 || day === 21 || day === 31) {
      suffix = "st";
    } else if (day === 2 || day === 22) {
      suffix = "nd";
    } else if (day === 3 || day === 23) {
      suffix = "rd";
    } else {
      suffix = "th";
    }
    return `${day}${suffix} ${month} ${year}`;
  }

  //methord for calculating days left for a doc
  calculateDaysLeft(doc: any): number{
    let daysLeft: number = 0;

    const today = new Date().getTime();
    const expierydate = new Date(doc.expiery_date).getTime();

    //caculating days with the help of micro seconds
    daysLeft = Math.floor((expierydate - today)/(1000 * 60 * 60 * 24));

    //setting days left 0 days remaining are negitive
    if(daysLeft < 0) {
      daysLeft = 0
    }
    return daysLeft;
  }


}
