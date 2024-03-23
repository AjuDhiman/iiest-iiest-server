import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IconDefinition, faFilePdf, faTrash, faMagnifyingGlass, faEye, faDownload } from '@fortawesome/free-solid-svg-icons';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';
import { MultiSelectComponent } from 'src/app/shared/multi-select/multi-select.component';
import { ConformationModalComponent } from '../conformation-modal/conformation-modal.component';
import { ViewDocumentComponent } from '../view-document/view-document.component';

@Component({
  selector: 'app-documentation-modal',
  templateUrl: './documentation-modal.component.html',
  styleUrls: ['./documentation-modal.component.scss']
})
export class DocumentationModalComponent implements OnInit {

  lastSelectedDoc: {name: string, allowedFormats: string[], mutipleDoc: boolean} = {name:'',allowedFormats:[] , mutipleDoc: false}; // this var will keep track of prev val of selected doc because we want it to be removed from from group if it deselected

  selectedDoc: {name: string, allowedFormats: string[], mutipleDoc: boolean} = {name:'',allowedFormats:[] , mutipleDoc: false};

  shopId: string;

  docsNameArr : string[] = [];

  docsArr: any = [];

  submitted: boolean = false;

  docList: any = [];

  format: string = '';// by the hrlp of this var we wil pass the format of the selectd doc to the backend

  loading: boolean = false;

  filteredData: any = []; 

  faFilePdf: IconDefinition = faFilePdf;
  faTrash: IconDefinition = faTrash;
  faMagnifyingGlass: IconDefinition = faMagnifyingGlass;
  searchQuery: string = '';

  docFile: File;

  //table vars
  itemsNumber: number = 5;
  pageNumber: number = 1;
  isSearch: boolean = false;
  selectedFilter: string = 'byName';

  faEye: IconDefinition = faEye;
  faDownload: IconDefinition = faDownload;

  @Output() reloadData: EventEmitter<void> = new EventEmitter<void>;

  documentsForm: FormGroup = new FormGroup({
  });

  @ViewChild(MultiSelectComponent) multiselect: MultiSelectComponent;

  constructor(public activeModal: NgbActiveModal,
    private _registerService: RegisterService,
    private _getDataService: GetdataService,
    private modalService: NgbModal,
    private _toastrService: ToastrService,
    public formBuilder: FormBuilder) {

  }

  ngOnInit(): void {
    this.documentsForm = this.formBuilder.group({
    });
    this.filteredData = this.docList;
  }

  get docForm(): { [key: string]: AbstractControl } {
    return this.documentsForm.controls;
  }

  onUpload(): void {
    this.submitted = false;
    if(this.documentsForm.invalid) {
      return;
    }

    if(this.docList.find((item: any) => item.name === this.selectedDoc.name)) {
      this._toastrService.info(`First delete, then upload`, `${this.selectedDoc.name} already exsists`)
      return;
    }

    this.loading = true;

    let formData = new FormData();

    console.log(this.docsArr.find((item: any) => item.name.toString() == this.selectedDoc));

    formData.append('name', this.selectedDoc.name);
    console.log(this.format);
    formData.append('format', this.format);
    formData.append('multipleDoc', this.selectedDoc.mutipleDoc.toString());

    if(this.selectedDoc.mutipleDoc) {
      (this.docFile as any).forEach((element: File) => {
        formData.append('document', element);
      });
    } else {
      formData.append('document', this.docFile);
    }

    if(this.shopId){
      this._registerService.saveDocument(this.shopId, formData).subscribe({
        next: res => {
          if(res) {
            this._toastrService.success(`${this.selectedDoc.name} Uploaded`);
            this.reloadData.emit();
            this.getDocList();
            this.loading = false;
          }
        }
      });
    }
   
  }

  getSelectedDoc($event: any): void{ // methord for dynamically add and remove the form control in documents upload form
    this.lastSelectedDoc = this.selectedDoc;
    this.selectedDoc = JSON.parse($event.target.value);
    this.documentsForm.addControl(this.changeNameFormat(this.selectedDoc.name.toString()), this.formBuilder.control(''));
    this.documentsForm.removeControl(this.changeNameFormat(this.lastSelectedDoc.name.toString()));
  }

  onFileUpload($event: any) {
    if(this.selectedDoc.mutipleDoc){
      this.docFile = $event.target.files;
      return;
    }

    this.docFile = $event.target.files[0];
    const ext = this.docFile.name.toString().split('.').pop();
    console.log(ext);

    if(ext === 'png' || ext === 'jpg' || ext === 'jpeg') {
      this.format = 'image';
    } else if (ext === 'pdf') {
      this.format = 'pdf'
    }

    console.log(this.format);
  }

  changeNameFormat(name:string): string { // this methord replaces " " by "_" in a string
    const updatedString: string = name.split(' ').join('_');
    return updatedString;
  }

  //table methord
  onTableDataChange($event: number): void {
    this.pageNumber = $event;
  }

  onSearchChange(){
    if(this.searchQuery) {
      this.isSearch = true;
    } else {
      this.isSearch = false;
    }
    this.filter();
  }

  onItemNumChange() {
  
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

  onDocDelete(doc:any){ // this func deletes the doc from doc list
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

  deleteDoc(confirmation: boolean, doc: any){
    if(confirmation){
      this.loading = true;
      this._registerService.deleteDoc(this.shopId,doc).subscribe({
        next: res => {
          if(res.success) {
            this._toastrService.success(`${doc.name} Deleted Sucessfully`, 'Deleted');
            this.reloadData.emit();
            this.getDocList();
            this.loading=false;
          }
        }
      })
    }
  }

  viewDocument(res: any): void {
    const modalRef = this.modalService.open(ViewDocumentComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.doc = res;
  }

  getDocList():void {
    this._getDataService.getDocs(this.shopId).subscribe({
      next: res => {
        this.docList=res.docs;
        console.log(this.docList);
        this.filteredData=this.docList;
      }
    })
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

}
