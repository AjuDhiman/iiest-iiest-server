import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IconDefinition, faFile, faFileCsv, faMagnifyingGlass, faShare, faPlusCircle, faFileCirclePlus, faArrowRotateForward } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExportAsConfig, ExportAsService } from 'ngx-export-as';
import { GetdataService } from 'src/app/services/getdata.service';
import { ViewDocumentComponent } from '../../modals/view-document/view-document.component';
import { RegisterService } from 'src/app/services/register.service';
import { ToastrService } from 'ngx-toastr';
import { ConformationModalComponent } from '../../modals/conformation-modal/conformation-modal.component';
import { Months } from 'src/app/utils/config';
import { MultiSelectComponent } from 'src/app/shared/multi-select/multi-select.component';
import { Select, Store } from '@ngxs/store';
import { GSTListState } from 'src/app/store/state/gstlist.state';
import { Observable, Subscription } from 'rxjs';
import { GetGSTList, SetGSTListLoadedFalse } from 'src/app/store/actions/gstlist.action';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss']
})
export class InvoiceListComponent implements OnInit, AfterViewInit, OnDestroy {

  //data related vars
  invoiceList: any = [];
  caseData: any = [];

  //variables
  activeTab: string = 'tax'; //var for configuring tab

   //store related vars
   @Select(GSTListState.GetGSTList) gstList$: Observable<any>;
   @Select(GSTListState.GSTListLoaded) gstListLoaded$: Observable<boolean>
   gstListLoadedSub: Subscription;


  //table related vars
  itemsNumber: number = 25;
  searchQuery: string = '';
  selectedFilter: string = 'byInvoiceCode';
  filteredData: any;
  pageNumber: number = 1;
  isSearch: boolean = false;

  //vars for showing total Aggregation
  totalProcessingAmt: number = 0;
  totalGstAmt: number = 0;
  totalAmt: number = 0;


  //loader var
  loading: boolean = false;


  //icons
  faMagnifyingGlass: IconDefinition = faMagnifyingGlass;
  faFile: IconDefinition = faFile;
  faFileCsv: IconDefinition = faFileCsv;
  faShare: IconDefinition = faShare;
  faPlusCircle: IconDefinition = faPlusCircle;
  faFileCirclePlus: IconDefinition = faFileCirclePlus;
  faArrowRotateForward: IconDefinition = faArrowRotateForward;

  // motnth wise data related vars
  allMonths: string[] = Months;
  disabledMonths: string[] = [];
  selectedMonths: string[] = [];
  monthsData: any = [];


  @ViewChild(MultiSelectComponent) multiSelect !: MultiSelectComponent;



  //constructor
  constructor(private _getDataService: GetdataService,
    private _registerService: RegisterService,
    private exportAsService: ExportAsService,
    private _toastrService: ToastrService,
    private modalService: NgbModal,
    private ngbModal: NgbModal,
    private cdr: ChangeDetectorRef,
    private store: Store
  ) {

  }

  //lifecycle hooks
  ngOnInit(): void {
    this.getInvoiceList();
    this.getDisabledMonths();
  }


  ngAfterViewInit(): void {
    this.selectedMonths = [Months[new Date().getMonth()]];
    this.multiSelect.selected = this.selectedMonths;
    this.multiSelect.isDisplayEmpty = false;
    this.multiSelect.all.forEach(option => {
      if(option.value === Months[new Date().getMonth()]) {
        option.checked = true;
      }
    })
    this.filterMonthWise();
    this.cdr.detectChanges();
  }

  //methords
  toogleTabs(tab: string) {
    this.activeTab = tab;
    this.filterByBusinessType();
  }

  //methoord alters the list accorduing to search query
  onSearchChange(): void {
    this.pageNumber = 1;
    this.isSearch = true;

    this.filter();
  }

  //methord runs on item number changes
  onItemNumChange(): void {
    this.pageNumber = 1
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
        case 'byInvoiceCode': this.filteredData = this.monthsData.filter((elem: any) => elem.code && elem.code.toLowerCase().includes(this.searchQuery.toLowerCase()));
          break;
        case 'byGstNum': this.filteredData = this.monthsData.filter((elem: any) => elem.gst_number && elem.gst_number.toLowerCase().includes(this.searchQuery.toLowerCase()));
          break;
        case 'byProduct': this.filteredData = this.monthsData.filter((elem: any) => elem.product && elem.product.includes(this.searchQuery));
          break;
        case 'byPlaceOfSupply': this.filteredData = this.monthsData.filter((elem: any) => elem.state && elem.state.toLowerCase().includes(this.searchQuery));
          break;
        case 'byInvoiceDate': this.filteredData = this.monthsData.filter((elem: any) => elem.invoice_date && elem.invoice_date.toLowerCase().includes(this.searchQuery));
          break;
      }
    }

    //setting total aggregation to 0
    this.totalProcessingAmt = 0;
    this.totalGstAmt = 0;
    this.totalAmt = 0;

    this.filteredData.forEach((data: any) => {
      this.totalProcessingAmt += Number(data.processing_amount);
      this.totalGstAmt = this.totalGstAmt + (Number(data.gst) + Number(data.igst) + Number(data.sgst) + Number(data.cgst));
      this.totalAmt += Number((+data.processing_amount + data.gst + data.cgst + data.sgst + data.igst));
    });
    
  }

  //methord for getting invoice list by the invoice list service and converting it to according to our need by performind diffrent operations
  getInvoiceList(): void {
    this.gstListLoadedSub = this.gstListLoaded$.subscribe(listLoaded => {
      if (!listLoaded) {
        this.store.dispatch(new GetGSTList());
      }
    })
    this.loading = true;
    this.gstList$.subscribe({
      next: res => {
        if(res.length){
          this.invoiceList = res.map((entry: any) => {
            return {
              ...entry,
              invoice_date: this.getFormattedDate(entry.createdAt),
              gst: entry.business_type === 'b2c' ? this.calculateGST('gst', entry.processing_amount) : 0,
              sgst: ((entry.business_type === 'b2b') && entry.state === 'Delhi') ? this.calculateGST('sgst', entry.processing_amount) : 0,
              cgst: ((entry.business_type === 'b2b') && entry.state === 'Delhi') ? this.calculateGST('cgst', entry.processing_amount) : 0,
              igst: ((entry.business_type === 'b2b') && entry.state !== 'Delhi') ? this.calculateGST('igst', entry.processing_amount) : 0,
            }
          }).sort((a: any, b: any) => {
            if (a.code) {
              const codeA = a.code;
              const codeB = b.code;
  
              const codeArrA = codeA.split('/');
              const codeArrB = codeB.split('/');
  
              const codeNumA = codeArrA[codeArrA.length - 1];
              const codeNumB = codeArrB[codeArrB.length - 1];
  
              return (codeNumB - codeNumA);
            } else {
              return 0;
            }
  
          });
          this.loading = false;
          this.filterByBusinessType();
        }
      }
    });
    // this._getDataService.getInvoiceList().subscribe({
    //   next: res => {

    //     this.invoiceList = res.invoiceList.map((entry: any) => {
    //       return {
    //         ...entry,
    //         invoice_date: this.getFormattedDate(entry.createdAt),
    //         gst: entry.business_type === 'b2c' ? this.calculateGST('gst', entry.processing_amount) : 0,
    //         sgst: ((entry.business_type === 'b2b') && entry.state === 'Delhi') ? this.calculateGST('sgst', entry.processing_amount) : 0,
    //         cgst: ((entry.business_type === 'b2b') && entry.state === 'Delhi') ? this.calculateGST('cgst', entry.processing_amount) : 0,
    //         igst: ((entry.business_type === 'b2b') && entry.state !== 'Delhi') ? this.calculateGST('igst', entry.processing_amount) : 0,
    //       }
    //     }).sort((a: any, b: any) => {
    //       if (a.code) {
    //         const codeA = a.code;
    //         const codeB = b.code;

    //         const codeArrA = codeA.split('/');
    //         const codeArrB = codeB.split('/');

    //         const codeNumA = codeArrA[codeArrA.length - 1];
    //         const codeNumB = codeArrB[codeArrB.length - 1];

    //         return (codeNumB - codeNumA);
    //       } else {
    //         return 0;
    //       }

    //     });
    //     this.loading = false;
    //     this.filterByBusinessType();

    //   }
    // });


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

  //methord for calculating amount according to gst, sgst, cgst or igst
  calculateGST(type: string, processing_amount: number): number {
    let gstAmount: number = 0;
    if (type === 'igst' || type === 'gst') {
      //getting 18% of processing amount
      gstAmount = Math.round(processing_amount * (18 / 100));
    }
    else if (type === 'sgst' || type === 'cgst') {
      //getting 9% of processing amount
      gstAmount = Math.round(processing_amount * (9 / 100));
    }
    return gstAmount;
  }

  //fillter the records on the basis of business type b2b or b2c or rather i say active tab basis
  filterByBusinessType(): void {
    this.pageNumber = 1;
    if (this.activeTab === 'tax') {
      this.caseData = this.invoiceList.filter((invoice: any) => invoice.business_type === 'b2b');
    } else if (this.activeTab === 'customer') {
      this.caseData = this.invoiceList.filter((invoice: any) => invoice.business_type === 'b2c');
    }

    this.filteredData = this.caseData;
    this.filterMonthWise();
  }

  //this methord sets the initia configuration of the componets
  initialize(): void {
    this.getInvoiceList();
    this.filterByBusinessType();
  }

  //methord runs on page change in table 
  onTableDataChange($event: number) {
    this.pageNumber = $event;
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

  //methord for viewing invoice
  viewInvoice(invoice: any): void {
    //while loading we can't re request for opening the invoice
    if (this.loading) {
      return
    }
    this.loading = true;
    this._getDataService.getInvoice(invoice.src).subscribe({
      next: res => {
        this.loading = false;
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

  //methord for recreating invoice
  reCreateInvoice(saleId: string, product: string, invoiceSrc: string, invoiceCode: string) {
    // we dont want to call this func again while loading
    if (this.loading) {
      return
    }

    //confirmation modal:- confirm before recreating invoice
    const modalRef = this.modalService.open(ConformationModalComponent, { size: 'md', backdrop: 'static' });
    modalRef.componentInstance.action = 'Recreate Invoice';
    modalRef.componentInstance.confirmationText = invoiceCode;
    modalRef.componentInstance.actionFunc.subscribe((confirmation: boolean) => {
      if (confirmation) {
        this.loading = true;
        this._registerService.recreateInvoice(saleId, product, invoiceSrc, invoiceCode).subscribe({
          next: res => {
            console.log(res);
            this.loading = false;
            this._toastrService.success('Invoice Recreated Success fully')
          },
          error: err => {
            this.loading = false;
            console.log(err);
          }
        })
      }
    })

  }

  //methord for resending invoice
  reSendInvoice(src: string, email: string) {
    // we dont want to call this func again while loading
    if (this.loading) {
      return
    }

    //confirmation modal:- confirm before resending
    const modalRef = this.modalService.open(ConformationModalComponent, { size: 'md', backdrop: 'static' });
    modalRef.componentInstance.action = 'Resend Invoice';
    modalRef.componentInstance.confirmationText = email;
    modalRef.componentInstance.actionFunc.subscribe((confirmation: boolean) => {
      if (confirmation) {
        this.loading = true;
        this._registerService.reSenndInvoice(src, email).subscribe({
          next: res => {
            console.log(res);
            this.loading = false;
            this._toastrService.success('Invoice Send Successfully');
          },
          error: err => {
            this.loading = false;
          }
        })
      }
    });

  }

  //methords for making name small 
  makeSmall(name: string, length: number): string {
    const subName =  name.substring(0, length);
    return (subName + '...');
  }

   //methord for filtering data only for selected months
   getSelectedMonths($event: any): void {
    this.selectedMonths = $event;
    console.log(this.selectedMonths);
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

      for(let i = 0; i <= monthsToFilter.length; i++) {
        if(data.invoice_date.includes(monthsToFilter[i])){
          find = true;
          break;
        }
      }
      return find;
    })

    // this.filteredData = this.monthsData;
    this.filter();
  }

  onBodyTab() {
    this.multiSelect.isdropped = false;
  }

  refresh(): void {
    this.filteredData = [];
    this.caseData = [];
    this.invoiceList = [];
    this.totalAmt = 0;
    this.totalGstAmt = 0;
    this.totalProcessingAmt = 0;
    this.store.dispatch(new SetGSTListLoadedFalse());
    this.loading = true;
  }


  ngOnDestroy(): void {
    this.gstListLoadedSub.unsubscribe();
  }

}
