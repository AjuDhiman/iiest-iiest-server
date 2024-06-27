import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { faIndianRupeeSign, faFile, faDownload } from '@fortawesome/free-solid-svg-icons';
import { fboRecipient, fboShop } from 'src/app/utils/registerinterface';
import { GetdataService } from 'src/app/services/getdata.service';
import { ViewDocumentComponent } from 'src/app/pages/modals/view-document/view-document.component';

@Component({
  selector: 'app-view-fbo',
  templateUrl: './view-fbo.component.html',
  styleUrls: ['./view-fbo.component.scss']
})
export class ViewFboComponent implements OnInit {
  @Input() public fboData: any;
  @Input() public isVerifier: boolean = false;
  fulladdress: string;
  recipientData: fboRecipient;
  shopDetails: fboShop;
  isfostac: boolean = false;
  faIndianRupeeSign = faIndianRupeeSign;
  faFile = faFile;
  faDownload = faDownload;
  showInvoice: boolean = false;
  isShowInvoice: boolean;
  invoice: string = '';
  remainingTime: string = '';
  invoiceArr: any = [];
  newPortalReleaseDate:  "2024-06-10T18:30:00.000Z";
  basicDocs: string[] = ['Manager Photo', 'Shop Photo', 'Manager Aadhar']; //this array contains name of 3 basic docs that only should be shown in view fbo
  docList: any = []; //list of all docs to show
  constructor(public activeModal: NgbActiveModal,
    private getDataServices: GetdataService,
    private ngbModal: NgbModal
  ) {
  }

  ngOnInit(): void {
    this.isfostac = true ? this.fboData.product_name.includes('Fostac Training') : this.isfostac = false;
    //this.fulladdress =  "Village: "+ this.fboData.village+", Post-Office: "+ this.fboData.address+", Tehsil: "+ this.fboData.tehsil+", District: "+ this.fboData.district+", State: "+ this.fboData.state+", Pincode: "+ this.fboData.pincode+", "+ "India";
    this.fulladdress = (this.fboData.fboInfo.village?(this.fboData.fboInfo.village + ", "):'') + (this.fboData.fboInfo.address?(this.fboData.fboInfo.address + ", "):'') + (this.fboData.fboInfo.tehsil?(this.fboData.fboInfo.tehsil + ", "):'')   + this.fboData.fboInfo.district + ", " + this.fboData.fboInfo.state + ", Pincode: " + this.fboData.fboInfo.pincode + ", " + "India";

    this.fulladdress = this.formatAddress(this.fulladdress);

    if (this.fboData.foscosInfo) {
      this.calculateRemaningDays();
    }

    this.isShowInvoice = this.comparedates(this.fboData.createdAt);
    this.getInvoice();

    this.docList = this.fboData.docs[0].documents.filter((doc: any) => this.basicDocs.includes(doc.name))
  }

  // This function is used for showing invoice after 31st March'2024
  comparedates(date: Date): boolean {

    const date1 = new Date(date.toString());
    const date2 = new Date("2024-06-10T18:30:00.000Z");

    if (date1 > date2) {
      return true;
    } else {
      return false;
    }
  }

  closeModal() {
    this.activeModal.close();
  }

  getInvoice() {
    if (this.isShowInvoice) {
      this.invoiceArr = [];
      console.log(this.fboData.invoiceId);
      this.fboData.invoiceId.forEach((invoice: string) => {
        this.getDataServices.getInvoice(invoice).subscribe({
          next: (res) => {
            console.log('conversion', res);
            this.invoice = res.invoiceConverted;
            this.invoiceArr.push(this.invoice);
          },
          error(err) {
            let errorObj = err.error;
            if (errorObj.userError) {

            } else if (errorObj.randomErr) {

            } else if (errorObj.oldInvoiceErr) {

            }
          },
        })
      });
    }
  }

  closeInvoiceWindow() {
    this.showInvoice = false;
  }

  //this methord is for calculating remaning days for the foscos license
  calculateRemaningDays() {
    let today = new Date().getTime();

    let startDate = new Date(this.fboData.createdAt);

    let lastDate = new Date(startDate.getFullYear() + Number(this.fboData.foscosInfo.license_duration), startDate.getMonth(), startDate.getDate()).getTime();

    console.log(lastDate);

    let remainingDays: number = Math.floor((lastDate - today) / (1000 * 60 * 60 * 24));

    let remainingYear: number = Math.floor(remainingDays / 365);

    remainingDays = remainingDays % 365;

    for (let year: number = 0; year < remainingYear; year++) {
      if (new Date(remainingYear + year, 1, 29).getDate() === 29) {
        remainingDays--;
      }
    }

    let remainingMonths: number = Math.floor(remainingDays / 30.5);

    remainingDays = remainingDays % 12;

    this.remainingTime = `${remainingYear} Years ${remainingMonths} Months ${remainingDays} Days`
  }

  formatAddress(address: string): string {
    let arr: Array<string> = address.toString().split('');

    if (arr[0] == ',') {
      arr.shift();
    }

    for (let i: number = 0; i < arr.length; i++) {

    }

    const updateAddress: string = arr.join("");

    return updateAddress;
  }

  viewInvoice(): void {
    const modalRef = this.ngbModal.open(ViewDocumentComponent, { size: 'xl', backdrop: 'static' });
    modalRef.componentInstance.doc = {
      name: `Invoice of ${this.fboData.fboInfo.fbo_name}`,
      format: 'pdf',
      src: this.invoiceArr,
      multipleDoc: true
    }
    console.log(this.invoiceArr);
  }

  viewDocument(name: string, res: any, format: string, isMultiDoc: boolean): void { // methord for calling viewdoc component for a particucar doc

    let obj = {
      name: name,
      src: isMultiDoc ? res : [res.toString()], // we will put single src in array because our component needs array of src for showing docs
      format: format,
      multipleDoc: isMultiDoc
    }
    const modalRef = this.ngbModal.open(ViewDocumentComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.doc = obj;
  }
}