import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IconDefinition, faEye, faFile, faFileCsv, faMagnifyingGlass, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExportAsConfig, ExportAsService } from 'ngx-export-as';
import { ToastrService } from 'ngx-toastr';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';
import { stateName, processAmnt } from 'src/app/utils/config';
import { pincodeData } from 'src/app/utils/registerinterface';
import { ViewDocumentComponent } from '../../modals/view-document/view-document.component';
import { ApprovesaleModalComponent } from '../approvesale-modal/approvesale-modal.component';
import { ViewCoworkSaleComponent } from '../view-cowork-sale/view-cowork-sale.component';


@Component({
  selector: 'app-create-invoice',
  templateUrl: './create-invoice.component.html',
  styleUrls: ['./create-invoice.component.scss']
})
export class CreateInvoiceComponent implements OnInit {

  //vars
  submitted: boolean = false;

  //loading vars
  loading: boolean = false;

  //state and ditrict related vars
  states: string[] = stateName;
  distrcts: string[] = [];
  pincodes: number[] = [];
  districtAndPincodes: any = [];


  products: string[] = [
    'FVO',
    'MAO',
    'ROC',
    'Cabin',
    'Flexi Seat',
    'Confrence Room',
    'Meeting Room'
  ];
  invoiceTypes: string[] = [
    'Customer',
    'Tax',
    'Service'
  ];


  //var for deciding is gst no visible or not
  isGstNoVisible: boolean = false;


  //logical form
  invoiceForm: FormGroup = new FormGroup({
    business_name: new FormControl(''),
    contact_no: new FormControl(''),
    email: new FormControl(''),
    state: new FormControl(''),
    district: new FormControl(''),
    pincode: new FormControl(''),
    address: new FormControl(''),
    product_code: new FormControl(''),
    product: new FormControl(''),
    invoice_type: new FormControl(''),
    behalf_of: new FormControl(''),
    qty: new FormControl(''),
    total_amount: new FormControl(''),
    narration: new FormControl(''),
    processing_amount: new FormControl(''),
    invoice_date: new FormControl(''),
    gst_amount: new FormControl('')
  })

  get invoiceform(): { [key: string]: AbstractControl } {
    return this.invoiceForm.controls;
  }




  //----------------------------------------------------------------------invoice list related vars-----------------------------------------------------------------
  activeTab: string = 'Tax';
  itemsNumber: number = 10;
  isSearch: boolean = false;
  searchQuery: string = '';
  pageNumber: number = 1;
  selectedFilter: string = 'byInvoiceCode';

  invoiceList: any = [];
  filteredData: any = [];
  caseData: any = [];

   //vars for showing total Aggregation
   totalProcessingAmt: number = 0;
   totalReceivedAmt: number = 0;
   totalGstAmt: number = 0;
   totalAmt: number = 0;
 
  

  //icons
  faMagnifyingGlass: IconDefinition = faMagnifyingGlass;
  faFileCsv: IconDefinition = faFileCsv;
  faFile: IconDefinition = faFile;
  faThumbsUp: IconDefinition = faThumbsUp;
  faEye: IconDefinition = faEye;


  //constructor
  constructor(private formBuilder: FormBuilder,
    private _getDataService: GetdataService,
    private _registerService: RegisterService,
    private _toastrService: ToastrService,
    private exportAsService: ExportAsService,
    private ngbModal: NgbModal
  ) {

  }


  //life cycle hooks
  ngOnInit(): void {
    this.setformValidation();

    //geting invoice list
    this.getCoworkInvoiceList();
  }

  //methords

  //onsubmit
  onSubmit(): void {
    this.submitted = true;
    console.log(this.invoiceForm);
    if (this.invoiceForm.invalid || this.loading) {
      return
    }

    this.loading = true;

    this._registerService.createInvoice(this.invoiceForm.value).subscribe({
      next: res => {
        console.log(res);
        this.loading = false;
        this._toastrService.success('Invoice Created Successfully');
        this.submitted = false;
        this.invoiceForm.reset();
        this.getCoworkInvoiceList();
      },
      error: err => {
        this.loading = false;
        console.log(err);
        
      }
    })
  }

  //methord for setting form's validation
  setformValidation(): void {
    this.invoiceForm = this.formBuilder.group({
      business_name: ['', Validators.required],
      contact_no: ['', [Validators.required,   Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      state: ['', [Validators.required]],
      district: ['', [Validators.required]],
      pincode: ['', [Validators.required]],
      address: ['', [Validators.required]],
      product_code: ['', [Validators.required]],
      product: ['', [Validators.required]],
      invoice_type: ['', Validators.required],
      behalf_of: ['', Validators.required],
      qty: ['', Validators.required],
      total_amount: ['', Validators.required],
      narration: ['', Validators.required],
      processing_amount: ['', Validators.required],
      invoice_date: ['', Validators.required],
      gst_amount: ['', Validators.required]
    })
  }

  //methord run on state selection and fetch districts according to it
  onStateSelect() {
    let state = this.invoiceform['state'].value;

    //re configuring districs and pincodes
    this.distrcts = [];
    this.pincodes = [];
    this.invoiceform['district'].setValue('');
    this.invoiceform['pincode'].setValue('');
    this.loading = true;
    this._getDataService.getPincodesData(state).subscribe({
      next: (res) => {
        let pincodesData = res;
        this.districtAndPincodes = res;
        pincodesData.forEach((obj: pincodeData) => {
          if (!this.distrcts.find((item: string) => item.toLowerCase() === obj.District.toLowerCase())) {
            this.distrcts.push(obj.District);
          }
        })
      },
      error: (err) => {
        let errorObj = err.error
        if (errorObj.userError) {
          this._registerService.signout();
        }
      },
      complete: () => {
        this.loading = false;
      }
    }
    )
  }

  //methord fetches pincode on the basis of district select
  onDistrictChange(): void {
    this.pincodes = [];
    this.invoiceform['pincode'].setValue('');
    this.loading = true;
    let pincodeArr: any = [];
    this.districtAndPincodes.forEach((obj: any) => {
      if (obj.District == this.invoiceform['district'].value) {
        pincodeArr.push(obj.Pincode);
      }
    });

    pincodeArr = new Set(pincodeArr);
    this.pincodes = [...pincodeArr];
    this.loading = false;
  }

  //methord for invoicce type change
  onInvoiceTypeChange($event: any): void {
    const type = $event.target.value;

    if (type === 'Tax') {
      this.isGstNoVisible = true;
      this.invoiceForm.addControl('gst_number', new FormControl('', Validators.required));
    } else {
      this.isGstNoVisible = false;
      this.invoiceForm.removeControl('gst_number')
    }

    this.setTotalAmount()
  }

  //methord sets total rocessing amont in the basis of prosessing amount and invoice type
  setTotalAmount(): void {
    const processAmnt: number = this.invoiceform['processing_amount'].value;
    const invoiceType: string = this.invoiceform['invoice_type'].value;
    const qty: number = this.invoiceform['qty'].value;
    console.log(qty);

    let gstAmount = 0;
    if (invoiceType === 'Tax' || invoiceType === 'Customer') {
      gstAmount = Math.round(processAmnt * (18 / 100));
    } else if (invoiceType === 'Service') {
      gstAmount = 0;
    }

    gstAmount = gstAmount * qty;

    const totalAmount = (processAmnt*qty) + gstAmount;

    this.invoiceform['gst_amount'].setValue(gstAmount);
    this.invoiceform['total_amount'].setValue(totalAmount);
  }

  //set invoice code on the basis if product
  setInvoiceCode(): void {
    const product = this.invoiceform['product'].value;

    let ext = '';
    switch (product) {
      case 'FVO':
        ext = 'FVO'
        break;
      case 'MAO':
        ext = 'MAO'
        break;
      case 'ROC':
        ext = 'ROC'
        break;
      case 'Cabin':
        ext = 'CB'
        break;
      case 'Meeting Room':
        ext = 'MR'
        break;
      case 'Flexi Seat':
        ext = 'FS'
        break;
      case 'Confrence Room':
        ext = 'CR'
        break;
    }

    const invoiceCode = `SW/IS-${ext}`;

    this.invoiceform['product_code'].setValue(invoiceCode);
  }


  //methord on qty change

  onQtyChange(): void {
    this.setTotalAmount();
  }

  //**********************************************************methord for getting cowork invoice list**************************************************************
  getCoworkInvoiceList(): void {
    this.loading = true;
    this._getDataService.getCoworkInvoiceList().subscribe({
      next: res => {
        this.loading = false;
        this.invoiceList = res.invoiceList.map((invoice: any) => {
          return {...invoice, 
            invoice_date: this.getFormattedDate(invoice.invoice_date),
            gst: invoice.invoice_type === 'Customer' ? (this.calculateGST('gst', invoice.processing_amount) * Number(invoice.qty)) : 0,
            sgst: ((invoice.invoice_type === 'Tax') && invoice.state === 'Delhi') ? (this.calculateGST('sgst', invoice.processing_amount) * Number(invoice.qty)) : 0,
            cgst: ((invoice.invoice_type === 'Tax') && invoice.state === 'Delhi') ? (this.calculateGST('cgst', invoice.processing_amount) * Number(invoice.qty)) : 0,
            igst: ((invoice.invoice_type === 'Tax') && invoice.state !== 'Delhi') ? (this.calculateGST('igst', invoice.processing_amount) * Number(invoice.qty)) : 0,
            income_amount: invoice.processing_amount*invoice.qty
          }
        }).sort((a: any, b: any) => {
          if(a.invoice_code){
            if(a.invoice_code === 'Performa') {
              return -1;
            }
            const codeA = a.invoice_code;
            const codeB = b.invoice_code;
  
            const codeArrA = codeA.split('/');
            const codeArrB = codeB.split('/');
  
            const codeNumA = codeArrA[codeArrA.length - 1];
            const codeNumB = codeArrB[codeArrB.length - 1];
  
            return (codeNumB - codeNumA);
          } else {
            return 0;
          }
          
        });;
        this.filteredData = this.invoiceList;
        this.filterByInvoiceType();
      }
    });
  }

  //methord for calculating amount according to gst, sgst, cgst or igst
  calculateGST(type: string, processing_amount: number): number {
    let gstAmount: number = 0;
    if (type === 'igst' || type === 'gst') {
      //getting 18% of processing amount
      gstAmount = Math.ceil(processing_amount * (18 / 100));
    }
    else if (type === 'sgst' || type === 'cgst') {
      //getting 9% of processing amount
      gstAmount = Math.ceil(processing_amount * (9 / 100));
    }
    return gstAmount;
  }


  //methord change the view format ofthe invoice date in the table
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

  // cowork invoicelist related methords
  toogleTabs(tab: string) {
    this.activeTab = tab;
    this.filterByInvoiceType();
  }

  //methord for filtering table according to serach query
  onSearchChange() {
    this.pageNumber = 1;
    this.isSearch = true;
    this.filter();
  }

  //methord for item no change
  onItemNumChange() {

  }

   //methord for filltering the invoice list
   filter(): void {
    if (!this.searchQuery) {
      this.filteredData = this.caseData;
    } else {
      switch (this.selectedFilter) {
        // case 'generalSearch': this.filteredData = this.filteredFBOEntries.filter((elem: any) => elem.fboInfo.owner_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
        //   break;
        case 'byBusinessName': this.filteredData = this.caseData.filter((elem: any) => elem.business_name && elem.business_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
          break;
        case 'byInvoiceCode': this.filteredData = this.caseData.filter((elem: any) => elem.invoice_code && elem.invoice_code.toLowerCase().includes(this.searchQuery.toLowerCase()));
          break;
        case 'byGstNum': this.filteredData = this.caseData.filter((elem: any) => elem.gst_number && elem.gst_number.toLowerCase().includes(this.searchQuery.toLowerCase()));
          break;
        case 'byProduct': this.filteredData = this.caseData.filter((elem: any) => elem.product && elem.product.toLowerCase().includes(this.searchQuery.toLowerCase()));
          break;
        case 'byPlaceOfSupply': this.filteredData = this.caseData.filter((elem: any) => elem.state && elem.state.toLowerCase().includes(this.searchQuery));
          break;
        case 'byInvoiceDate': this.filteredData = this.caseData.filter((elem: any) => elem.invoice_date && elem.invoice_date.toLowerCase().includes(this.searchQuery));
          break;
      }
    }

    //setting total aggregation to 0
    this.totalProcessingAmt = 0;
    this.totalReceivedAmt = 0;
    this.totalGstAmt = 0;
    this.totalAmt = 0;

    this.filteredData.forEach((data: any) => {
      this.totalProcessingAmt += Number(data.processing_amount);
      this.totalReceivedAmt += Number(data.receivingAmount);
      this.totalGstAmt = this.totalGstAmt + (Number(data.gst) + Number(data.igst) + Number(data.sgst) + Number(data.cgst));
      this.totalAmt += Number((+data.processing_amount + data.gst + data.cgst + data.sgst + data.igst) );
    });
  }


  //methord for exporting excel
  exportToCsv(): void {
    const options: ExportAsConfig = {
      type: 'csv',
      elementIdOrContent: 'data-to-export',
    };

    this.exportAsService.save(options, 'table_data').subscribe(() => {
    });
  }

  //methord runs on paination cahnges
  onTableDataChange($event: number) {
    this.pageNumber=$event;
  }

   //fillter the records on the basis of invoice type
   filterByInvoiceType(): void {
    if (this.activeTab === 'Tax') {
      this.caseData = this.invoiceList.filter((invoice: any) => invoice.invoice_type === 'Tax');
    } else if (this.activeTab === 'Customer') {
      this.caseData = this.invoiceList.filter((invoice: any) => invoice.invoice_type === 'Customer');
    }  else if (this.activeTab === 'Service') {
      this.caseData = this.invoiceList.filter((invoice: any) => invoice.invoice_type === 'Service');
    } 
    
    this.filteredData = this.caseData;

    this.filter();
  }


  //methord for viewing invoice
  viewInvoice(invoice: any): void {
    this._getDataService.getCoworkInvoice(invoice.invoice_src).subscribe({
      next: res => {
        console.log(res)
        const modalRef = this.ngbModal.open(ViewDocumentComponent, { size: 'xl', backdrop: 'static' });
        modalRef.componentInstance.doc = {
          name: `Invoice of ${invoice.business_name}`,
          format: 'pdf',
          src: res.invoiceConverted,
          multipleDoc: false
        }
      }
    })
  }

   //methord for Approvinf invoice
   approveSale(invoice: any): void {
    if(invoice.isAmountReceived) {
      this._toastrService.info('Already Approved')
      return
    }
    this._getDataService.getCoworkInvoice(invoice.invoice_src).subscribe({
      next: res => {
        console.log(res)
        const modalRef = this.ngbModal.open(ApprovesaleModalComponent, { size: 'xl', backdrop: 'static' });
        modalRef.componentInstance.saleInfo = invoice;
        modalRef.componentInstance.refreshCoworkInvoiceList = this.getCoworkInvoiceList;
      }
    })
  }

  //methord for viewing details
  viewDetail(Invoice: any): void {
    const modalRef = this.ngbModal.open(ViewCoworkSaleComponent, { size: 'xl', backdrop: 'static' });
    modalRef.componentInstance.data = Invoice;
  }


}
