import { AfterViewInit, ChangeDetectorRef, Component, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IconDefinition, faEye, faFile, faFileCsv, faMagnifyingGlass, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExportAsConfig, ExportAsService } from 'ngx-export-as';
import { ToastrService } from 'ngx-toastr';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';
import { stateName, processAmnt, Months, months } from 'src/app/utils/config';
import { pincodeData } from 'src/app/utils/registerinterface';
import { ViewDocumentComponent } from '../../modals/view-document/view-document.component';
import { ApprovesaleModalComponent } from '../approvesale-modal/approvesale-modal.component';
import { ViewCoworkSaleComponent } from '../view-cowork-sale/view-cowork-sale.component';
import { MultiSelectComponent } from 'src/app/shared/multi-select/multi-select.component';


@Component({
  selector: 'app-create-invoice',
  templateUrl: './create-invoice.component.html',
  styleUrls: ['./create-invoice.component.scss']
})
export class CreateInvoiceComponent implements OnInit, AfterViewInit {

  //vars
  submitted: boolean = false;

  //loading vars
  loading: boolean = false;

  //state and ditrict related vars
  states: string[] = stateName;
  distrcts: string[] = [];
  pincodes: number[] = [];
  districtAndPincodes: any = [];

  //boolean of decidingif other pincode exsists or not
  isOtherPincode: boolean = false;

  isFormVisible: boolean = false;


  products: string[] = [
    'FVO',
    'MAO',
    'ROC',
    'Cabin',
    'Flexi Seat',
    'Confrence Room',
    'Meeting Room',
    'Others'
  ];
  invoiceTypes: string[] = [
    'Customer',
    'Tax',
    'Service'
  ];


  @ViewChild(MultiSelectComponent) multiSelect !: MultiSelectComponent;

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
    gst_amount: new FormControl(''),
    security: new FormControl('')
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
  totalPendingAmt: number = 0;
  totalTDSAmt: number = 0;
  totalGstAmt: number = 0;
  totalAmt: number = 0;

  //var related to month wise multi selevct filter
  allMonths: string[] = Months;
  disabledMonths: string[] = [];
  selectedMonths: string[] = [];
  monthsData: any = [];

  userData: any = {};



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
    private ngbModal: NgbModal,
    private cdr: ChangeDetectorRef
  ) {

  }


  //life cycle hooks
  ngOnInit(): void {
    const userdata: any = this._registerService.LoggedInUserData();
    this.userData = JSON.parse(userdata);
    this.setformValidation();

    //geting invoice list
    this.getCoworkInvoiceList();

    this.getDisabledMonths();
  }

  ngAfterViewInit(): void {
    this.selectedMonths = [Months[new Date().getMonth()]];
    this.multiSelect.selected = this.selectedMonths;
    this.multiSelect.isDisplayEmpty = false;
    this.multiSelect.all.forEach(option => {
      if (option.value === Months[new Date().getMonth()]) {
        option.checked = true;
      }
    })
    this.filterMonthWise();
    this.cdr.detectChanges();
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

    const formValue = this.invoiceForm.value;

    //setting other pincode to pin code in case of other pincode
    if (this.isOtherPincode) {
      formValue.pincode = formValue.other_pincode;
    }

    this._registerService.createInvoice(formValue).subscribe({
      next: res => {
        console.log(res);
        this.loading = false;
        this._toastrService.success('Invoice Created Successfully');
        this.submitted = false;
        this.invoiceForm.reset();
        this.isOtherPincode = false;
        this.invoiceForm.removeControl('other_pincode')
        this.isGstNoVisible = true;
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
      contact_no: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
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
      gst_amount: ['', Validators.required],
      security: ['', Validators.required]
    })
    
  }

  //methord run on state selection and fetch districts according to it
  onStateSelect() {
    let state = this.invoiceform['state'].value;

    //re configuring districs and pincodes
    this.distrcts = [];
    this.pincodes = [];
    this.isOtherPincode = false;
    this.invoiceForm.removeControl('other_pincode');
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
    this.isOtherPincode = false;
    this.invoiceForm.removeControl('other_pincode');
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

  //method runs on pincode changes
  onPincodeChanges(): void {
    const pincode: any = this.invoiceform['pincode'].value;

    if (pincode === 'others') {
      this.isOtherPincode = true;
      this.invoiceForm.addControl('other_pincode', new FormControl('', Validators.required));
    } else {
      this.isOtherPincode = false;
      this.invoiceForm.removeControl('other_pincode');
    }
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

    const totalAmount = (processAmnt * qty) + gstAmount;

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
      case 'Others':
        ext = 'OTH'
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
  //methord for getting invoice list
  getCoworkInvoiceList(): void {
    this.loading = true;
    this._getDataService.getCoworkInvoiceList().subscribe({
      next: res => {
        this.loading = false;
        this.invoiceList = res.invoiceList.map((invoice: any) => {
          return {
            ...invoice,
            invoice_date_converted: this.getFormattedDate(invoice.invoice_date),
            gst: invoice.invoice_type === 'Customer' ? (this.calculateGST('gst', invoice.processing_amount) * Number(invoice.qty)) : 0,
            sgst: ((invoice.invoice_type === 'Tax') && invoice.state === 'Delhi') ? (this.calculateGST('sgst', invoice.processing_amount) * Number(invoice.qty)) : 0,
            cgst: ((invoice.invoice_type === 'Tax') && invoice.state === 'Delhi') ? (this.calculateGST('cgst', invoice.processing_amount) * Number(invoice.qty)) : 0,
            igst: ((invoice.invoice_type === 'Tax') && invoice.state !== 'Delhi') ? (this.calculateGST('igst', invoice.processing_amount) * Number(invoice.qty)) : 0,
            income_amount: (invoice.processing_amount * invoice.qty)
          }
        }).sort((a: any, b: any) => {
          if (a.invoice_code) {
            if (a.invoice_code === 'Performa') {
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
      this.filteredData = this.monthsData;
    } else {
      switch (this.selectedFilter) {
        // case 'generalSearch': this.filteredData = this.filteredFBOEntries.filter((elem: any) => elem.fboInfo.owner_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
        //   break;
        case 'byBusinessName': this.filteredData = this.monthsData.filter((elem: any) => elem.business_name && elem.business_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
          break;
        case 'byInvoiceCode': this.filteredData = this.monthsData.filter((elem: any) => elem.invoice_code && elem.invoice_code.toLowerCase().includes(this.searchQuery.toLowerCase()));
          break;
        case 'byGstNum': this.filteredData = this.monthsData.filter((elem: any) => elem.gst_number && elem.gst_number.toLowerCase().includes(this.searchQuery.toLowerCase()));
          break;
        case 'byProduct': this.filteredData = this.monthsData.filter((elem: any) => elem.product && elem.product.toLowerCase().includes(this.searchQuery.toLowerCase()));
          break;
        case 'byPlaceOfSupply': this.filteredData = this.monthsData.filter((elem: any) => elem.state && elem.state.toLowerCase().includes(this.searchQuery));
          break;
        case 'byInvoiceDate': this.filteredData = this.monthsData.filter((elem: any) => elem.invoice_date && elem.invoice_date.toLowerCase().includes(this.searchQuery));
          break;
      }
    }

    this.aggregateResults();


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
    this.pageNumber = $event;
  }

  //fillter the records on the basis of invoice type
  filterByInvoiceType(): void {
    this.pageNumber = 1;
    if (this.activeTab === 'Tax') {
      this.caseData = this.invoiceList.filter((invoice: any) => invoice.invoice_type === 'Tax');
    } else if (this.activeTab === 'Customer') {
      this.caseData = this.invoiceList.filter((invoice: any) => invoice.invoice_type === 'Customer');
    } else if (this.activeTab === 'Service') {
      this.caseData = this.invoiceList.filter((invoice: any) => invoice.invoice_type === 'Service');
    }

    this.filteredData = this.caseData;

    this.filterMonthWise();
    // this.filter()
  }


  //methord for viewing invoice
  viewInvoice(invoice: any): void {
    this.loading = true;
    this._getDataService.getCoworkInvoice(invoice.invoice_src).subscribe({
      next: res => {
        this.loading = false;
        const modalRef = this.ngbModal.open(ViewDocumentComponent, { size: 'xl', backdrop: 'static' });
        modalRef.componentInstance.doc = {
          name: `Invoice of ${invoice.business_name}`,
          format: 'pdf',
          src: [res.invoiceConverted],
          multipleDoc: true
        }
      },
      error: err => {
        this.loading = false;
      }
    })
  }

  //methord for Approvinf invoice
  approveSale(invoice: any): void {
    if (invoice.isAmountReceived) {
      this._toastrService.info('Already Approved')
      return
    }
    this.loading = true;
    this._getDataService.getCoworkInvoice(invoice.invoice_src).subscribe({
      next: res => {
        this.loading = false;
        const modalRef = this.ngbModal.open(ApprovesaleModalComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.saleInfo = invoice;
        modalRef.componentInstance.refreshCoworkInvoiceList = this.getCoworkInvoiceList;
      },
      error: err => {
        this.loading = false;
      }
    })
  }

  //methord for viewing details
  viewDetail(Invoice: any): void {
    const modalRef = this.ngbModal.open(ViewCoworkSaleComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.data = Invoice;
  }

  //methord for filtering data only for selected months
  getSelectedMonths($event: any): void {
    this.selectedMonths = $event;
    this.filterMonthWise();
  }

  //methord for getting disabled months
  getDisabledMonths(): void {
    const today = new Date();
    const currentMonthIndex = today.getMonth();

    //adding months after current months in diabled months array
    this.disabledMonths = Months.slice(currentMonthIndex + 1);
    console.log(this.disabledMonths);
  }

  //methord for filtering data selected month wise
  filterMonthWise(): void {

    //array of months with first three letter of each month only
    const monthsToFilter = this.selectedMonths.map((month) => month.slice(0, 3));
    this.monthsData = this.caseData.filter((data: any) => {
      let find = false;

      for (let i = 0; i <= monthsToFilter.length; i++) {
        if (data.invoice_date_converted.includes(monthsToFilter[i])) {
          find = true;
          break;
        }
      }
      return find;
    })

    // this.filteredData = this.monthsData;
    this.filter();
  }

  //methord for closing muti select on 
  onBodyTab() {
    this.multiSelect.isdropped = false;
  }

  //methord for aggreagting results 
  aggregateResults(): void {
    //setting total aggregation to 0
    this.totalProcessingAmt = 0;
    this.totalReceivedAmt = 0;
    this.totalPendingAmt = 0;
    this.totalGstAmt = 0;
    this.totalTDSAmt = 0;
    this.totalAmt = 0;

    //aggregating totals
    this.filteredData.forEach((data: any) => {

      if (data.isAmountReceived) {
        //total processing amout = processing amount * total qty if payment recevied 
        this.totalProcessingAmt += Number(data.income_amount);

        this.totalReceivedAmt += data.receivingAmount;

        //total gst = sgst + igst + cgst + gst
        this.totalGstAmt = this.totalGstAmt + ((Number(data.gst) + Number(data.igst) + Number(data.sgst) + Number(data.cgst)));
      } else {
        //total pending amount is amount the sum of all incomes amount of those whose payment is not recived
        this.totalPendingAmt += Number(data.income_amount);
      }

      //total mount = total processing maont + gst
      this.totalAmt += Number(data.total_amount);


    });

    //total tds amount = total procesing amount - total recivings
    this.totalTDSAmt = this.totalProcessingAmt - this.totalReceivedAmt;
  }

}
