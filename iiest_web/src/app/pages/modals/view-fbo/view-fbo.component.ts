import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { faIndianRupeeSign, faFile, faDownload, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { fboRecipient, fboShop } from 'src/app/utils/registerinterface';
import { GetdataService } from 'src/app/services/getdata.service';
import { ViewDocumentComponent } from 'src/app/pages/modals/view-document/view-document.component';
import { RegisterService } from 'src/app/services/register.service';

@Component({
  selector: 'app-view-fbo',
  templateUrl: './view-fbo.component.html',
  styleUrls: ['./view-fbo.component.scss']
})
export class ViewFboComponent implements OnInit {

  //defining input variables
  @Input() public fboData: any; //this var contains whole sale Data
  @Input() public isVerifier: boolean = false; //this var will decide that the user is verifier or not
  @Input() public product: string = '';

  //user related variables
  userData: any;

  //shop related variables
  fulladdress: string;
  recipientData: fboRecipient;
  shopDetails: fboShop;

  //invoice related variables
  invoice: string = '';
  invoiceArr: any = [];

  //digital invoices will be shown after this date
  newPortalReleaseDate: "2024-06-10T18:30:00.000Z";

  //var for containing remaining time of a product like total time left for renewal of license
  remainingTime: string = '';

  //Documents Related Variables
  basicDocs: string[] = ['Manager Photo', 'Shop Photo', 'Manager Aadhar']; //this array contains name of 3 basic docs that only should be shown in view fbo
  docList: any = []; //list of all docs to show


  //Booleans
  isfostac: boolean = false;
  showInvoice: boolean = false;
  isShowInvoice: boolean;


  //icon
  faIndianRupeeSign: IconDefinition = faIndianRupeeSign;
  faFile: IconDefinition = faFile;
  faDownload: IconDefinition = faDownload;

  //product related vars
  productTotalAmt: number = 0;

  //boolean for specifing it for whole sale detail or a particular sale detail
  isForWholeSale: boolean = false;


  constructor(public activeModal: NgbActiveModal,
    private getDataServices: GetdataService,
    private _registerService: RegisterService,
    private ngbModal: NgbModal
  ) {
  }

  ngOnInit(): void {
    this.isfostac = true ? this.fboData.product_name.includes('Fostac Training') : this.isfostac = false;

    //generating full address by aggregating state, address, district and pincode
    this.fulladdress = (this.fboData.fboInfo.village ? (this.fboData.fboInfo.village + ", ") : '') + (this.fboData.fboInfo.address ? (this.fboData.fboInfo.address + ", ") : '') + (this.fboData.fboInfo.tehsil ? (this.fboData.fboInfo.tehsil + ", ") : '') + this.fboData.fboInfo.district + ", " + this.fboData.fboInfo.state + ", Pincode: " + this.fboData.fboInfo.pincode + ", " + "India";

    //formt the address
    this.fulladdress = this.formatAddress(this.fulladdress);

    if (this.fboData.foscosInfo) {
      this.calculateRemaningDays();
    }

    //calculate total product amount
    if (!this.isForWholeSale) {
      this.getProductTotalAmount();
    }

    //deciding to show invoice or not
    this.isShowInvoice = this.comparedates(this.fboData.createdAt);
    this.getInvoice();

    //getting doclist
    if (!this.isForWholeSale) {
      let basicDocs = this.basicDocs;
      this.getDataServices.getDocs(this.fboData.fboInfo.customer_id).subscribe({
        next: res => {
          this.docList = res.docs.filter((doc: any) => {
            if(basicDocs.includes(doc.name)){
              //removing doc name from basic docsso we will get all docs distintively
              basicDocs = basicDocs.filter(a => a !== doc.name);
              return true;
            } else {
              return false;
            }
          });
        }
      });
      // this.docList = this.fboData.docs[0].documents.filter((doc: any) => this.basicDocs.includes(doc.name));
    }
    let user: any = this._registerService.LoggedInUserData();
    let parsedUser = JSON.parse(user);
    this.userData = parsedUser;
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

  //methord for closing this modal
  closeModal() {
    this.activeModal.close();
  }

  //get invoice Array
  getInvoice() {
    if (this.isShowInvoice) {
      this.invoiceArr = [];
      this.fboData.invoiceId.forEach((invoice: { src: string, id: string }) => {
        this.getDataServices.getInvoice(invoice.src).subscribe({
          next: (res) => {
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

  //methord closes the modal
  closeInvoiceWindow() {
    this.showInvoice = false;
  }

  //this methord is for calculating remaning days for the foscos license
  calculateRemaningDays() {
    let today = new Date().getTime();

    let startDate = new Date(this.fboData.createdAt);

    let lastDate = new Date(startDate.getFullYear() + Number(this.fboData.foscosInfo.license_duration), startDate.getMonth(), startDate.getDate()).getTime();

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

  //methord for formatting address under development
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

  //Methord opens view invoice modal
  viewInvoice(): void {
    const modalRef = this.ngbModal.open(ViewDocumentComponent, { size: 'xl', backdrop: 'static' });
    modalRef.componentInstance.doc = {
      name: `Invoice of ${this.fboData.fboInfo.fbo_name}`,
      format: 'pdf',
      src: this.invoiceArr,
      multipleDoc: true
    }
  }

  //methord opens view document modal in case of shop identification documents
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

  sendInvoiceManually(): void {

  }

  //methord for getting total amount according to the particular product of the sale
  getProductTotalAmount(): void {

    //getting totl amount on the basis of product
    switch (this.product) {
      case 'Fostac':
        this.productTotalAmt = this.fboData.fostacInfo.fostac_total;
        break;
      case 'Foscos':
        this.productTotalAmt = this.fboData.foscosInfo.foscos_total;
        break;
      case 'HRA':
        this.productTotalAmt = this.fboData.hraInfo.hra_total;
        break;
      case 'Medical':
        this.productTotalAmt = this.fboData.medicalInfo.medical_total;
        break;
      case 'Water Test Report':
        this.productTotalAmt = this.fboData.waterTestInfo.water_test_total;
        break;
    }
  }
}