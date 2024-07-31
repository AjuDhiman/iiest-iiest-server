import { Component, OnInit } from '@angular/core';
import { IconDefinition, faFile, faFileCsv, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExportAsConfig, ExportAsService } from 'ngx-export-as';
import { GetdataService } from 'src/app/services/getdata.service';
import { ViewDocumentComponent } from '../../modals/view-document/view-document.component';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss']
})
export class InvoiceListComponent implements OnInit {

  //data related vars
  invoiceList: any = [];
  caseData:any = [];

  //variables
  activeTab: string = 'tax'; //var for configuring tab


  //table related vars
  itemsNumber: number = 25;
  searchQuery: string = '';
  selectedFilter: string = 'byInvoiceCode';
  filteredData: any;
  pageNumber: number = 1;
  isSearch: boolean = false;


  //loader var
  loading: boolean = false;


  //icons
  faMagnifyingGlass: IconDefinition = faMagnifyingGlass;
  faFile: IconDefinition = faFile;
  faFileCsv: IconDefinition = faFileCsv;


  //constructor
  constructor(private _getDataService: GetdataService,
    private exportAsService: ExportAsService,
    private ngbModal: NgbModal
  ) {

  }

  //lifecycle hooks
  ngOnInit(): void {
    this.getInvoiceList();
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
        case 'byInvoiceCode': this.filteredData = this.caseData.filter((elem: any) => elem.code && elem.code.toLowerCase().includes(this.searchQuery.toLowerCase()));
          break;
        case 'byGstNum': this.filteredData = this.caseData.filter((elem: any) => elem.gst_number && elem.gst_number.toLowerCase().includes(this.searchQuery.toLowerCase()));
          break;
        case 'byProduct': this.filteredData = this.caseData.filter((elem: any) => elem.product && elem.product.includes(this.searchQuery));
          break;
        case 'byPlaceOfSupply': this.filteredData = this.caseData.filter((elem: any) => elem.state && elem.state.toLowerCase().includes(this.searchQuery));
          break;
        case 'byInvoiceDate': this.filteredData = this.caseData.filter((elem: any) => elem.invoice_date && elem.invoice_date.toLowerCase().includes(this.searchQuery));
          break;
      }
    }
  }

  //methord for getting invoice list by the invoice list service and converting it to according to our need by performind diffrent operations
  getInvoiceList(): void {
    this.loading = true;
    this._getDataService.getInvoiceList().subscribe({
      next: res => {
    
        this.invoiceList = res.invoiceList.map((entry: any) => {
          return {
            ...entry,
            invoice_date: this.getFormattedDate(entry.createdAt),
            gst: entry.business_type === 'b2c' ? this.calculateGST('gst', entry.processing_amount) : 0,
            sgst: ((entry.business_type === 'b2b') && entry.state === 'Delhi') ? this.calculateGST('sgst', entry.processing_amount) : 0,
            cgst: ((entry.business_type === 'b2b') && entry.state === 'Delhi') ? this.calculateGST('cgst', entry.processing_amount) : 0,
            igst: ((entry.business_type === 'b2b') && entry.state !== 'Delhi') ? this.calculateGST('igst', entry.processing_amount) : 0,
          }
        });
        console.log(this.invoiceList);
        this.loading = false;
        this.filterByBusinessType();
      }
    });


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
      gstAmount = Math.ceil(processing_amount * (18 / 100));
    }
    else if (type === 'sgst' || type === 'cgst') {
      //getting 9% of processing amount
      gstAmount = Math.ceil(processing_amount * (9 / 100));
    }
    return gstAmount;
  }

  //fillter the records on the basis of business type b2b or b2c or rather i say active tab basis
  filterByBusinessType(): void {
    if (this.activeTab === 'tax') {
      this.caseData = this.invoiceList.filter((invoice: any) => invoice.business_type === 'b2b');
    } else if (this.activeTab === 'customer') {
      this.caseData = this.invoiceList.filter((invoice: any) => invoice.business_type === 'b2c');
    }
    
    this.filteredData = this.caseData;
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
    this._getDataService.getInvoice(invoice.src).subscribe({
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
}
