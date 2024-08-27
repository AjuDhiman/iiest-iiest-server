import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';
import { faEye, faPencil, faTrash, faEnvelope, faXmark, faMagnifyingGlass, faFileCsv, faFilePdf, faIndianRupeeSign, faArrowUp, faArrowDown, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { ExportAsService, ExportAsConfig } from 'ngx-export-as';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RecipientComponent } from 'src/app/pages/modals/recipient/recipient.component';
import { ViewFboComponent } from 'src/app/pages/modals/view-fbo/view-fbo.component';
import { Select, Store } from '@ngxs/store';
import { SalesState } from 'src/app/store/state/sales.state';
import { Observable, Subscription } from 'rxjs';
import { GetSales } from 'src/app/store/actions/sales.action';
import { SaleDocModalComponent } from '../../modals/sale-doc-modal/sale-doc-modal.component';
import { ConformationModalComponent } from '../../modals/conformation-modal/conformation-modal.component';
import { ToastrService } from 'ngx-toastr';
import { FbonewComponent } from '../fboproduct/fbonew/fbonew.component';

@Component({
  selector: 'app-fbolist',
  templateUrl: './fbolist.component.html',
  styleUrls: ['./fbolist.component.scss']
})
export class FbolistComponent implements OnInit {
  @Output() isEditRecord = new EventEmitter();

  //Variables
  createdBy: any;
  allFBOEntries: any;
  filteredFBOEntries: any;
  selectedFilter: string = 'byCustomerID';
  searchQuery: string = '';
  filteredData: any;

  pageNumber: number = 1;
  itemsNumber: number = 25;


  selectedSaleId: string // this var will contain sale id of sale of whichj we want to update sale cheque status

  userData: any; // for for getting user data

  activeTab: string = 'Fostac';

  //icons
  faEye: IconDefinition = faEye;
  faPencil: IconDefinition = faPencil;
  faTrash: IconDefinition = faTrash;
  faEnvelope: IconDefinition = faEnvelope;
  faXmark: IconDefinition = faXmark;
  faFileCsv: IconDefinition = faFileCsv;
  faFilePdf: IconDefinition = faFilePdf;
  faArrowUp: IconDefinition = faArrowUp;
  faArrowDown: IconDefinition = faArrowDown;
  faIndianRupeeSign: IconDefinition = faIndianRupeeSign;
  faMagnifyingGlass: IconDefinition = faMagnifyingGlass;


  //Booleans
  isModal: boolean = false;
  loading: boolean = true; //loader
  //var in case of using this list as invoice list
  isInvoiceList: boolean = false;
  isVerifier: boolean = false;
  isSearch: boolean = false;

  //var in case showing fbolist in case list
  isShowingInCaseList: boolean = false;

  isMoreAvilable: boolean = true;

  constructor(private getDataService: GetdataService,
    private registerService: RegisterService,
    private exportAsService: ExportAsService,
    private store: Store,
    private _toastrService: ToastrService,
    private modalService: NgbModal) { }

  ngOnInit(): void {
    this.loading = true;
    this.intailize() //do initial configurations
    this.fetchAllFboData();
  }

  fetchAllFboData(): void {

    this.loading = true
    this.getDataService.getSalesList().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.salesInfo) {
         
          this.allFBOEntries = res.salesInfo.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((elem: any, index: number) => ({ ...elem, serialNumber: index + 1, saleApprovel: this.getSalesStatus(elem) }));
          this.filteredFBOEntries = this.allFBOEntries.filter((item: any) => {
            if (item.product_name.includes(this.activeTab)) {
              return item;
            }
          });
          // if (this.isVerifier) { // filter pending in case of verifer
          //   this.filteredFBOEntries = this.filteredFBOEntries.filter((entry: any) => entry.checkStatus === 'Pending');
          // }
          this.filter();
          this.loading = false;
        }
      },
      error: (err) => {
        let errorObj = err;
        if (errorObj.userError) {
          this.registerService.signout();
        }
      }
    })
  }

  //metord for filter according to search
  filter(): void {
    if (!this.searchQuery) {
      this.filteredData = this.filteredFBOEntries;
    } else {
      switch (this.selectedFilter) {
        // case 'generalSearch': this.filteredData = this.filteredFBOEntries.filter((elem: any) => elem.fboInfo.owner_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
        //   break;
        case 'byOwner': this.filteredData = this.filteredFBOEntries.filter((elem: any) => elem.fboInfo && elem.fboInfo.owner_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
          break;
        case 'byLocation': this.filteredData = this.filteredFBOEntries.filter((elem: any) => (elem.fboInfo) && (elem.fboInfo.district.toLowerCase().includes(this.searchQuery.toLowerCase()) || elem.fboInfo.state.toLowerCase().includes(this.searchQuery.toLowerCase())));
          break;
        case 'byFboName': this.filteredData = this.filteredFBOEntries.filter((elem: any) => (elem.fboInfo) && elem.fboInfo.fbo_name && elem.fboInfo.fbo_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
          break;
        case 'byCustomerID': this.filteredData = this.filteredFBOEntries.filter((elem: any) => (elem.fboInfo) && elem.fboInfo.customer_id.includes(this.searchQuery))
          break;
        case 'byStatus': this.filteredData = this.filteredFBOEntries.filter((elem: any) => elem.saleApprovel && elem.saleApprovel.toLowerCase().includes(this.searchQuery))
          break;
        case 'byProduct': this.filteredData = this.filteredFBOEntries.filter((elem: any) => {
          if (elem.fboInfo.product_name.find((product: string) => product.toLowerCase().includes(this.searchQuery))) {
            return true;
          } else {
            return false;
          }
        });
          break;
      }
    }
  }

  //this methord filters the data acoording to text written in search box
  onSearchChange(): void {
    this.pageNumber = 1;
    this.isSearch = true;
    this.filter();
  }

  //methord run when soe one goes on anoter paeg of the table
  onTableDataChange(event: any) {
    this.pageNumber = event;
    this.filter();
  }

  //methord runs when no of records shown is chaged in the table
  onItemNumChange() {
    this.pageNumber = 1;
  }

  //Edit Mode Emitter to Parent component fbo
  editRecord(res: any): void {
    var data = {
      isEditMode: true,
      Record: res
    }
    this.isEditRecord.emit(data);
  }

  //methord deletes the fbo sale record
  deleteFBO(fbo: any): void {
    const loggedInUserData: any = this.registerService.LoggedInUserData();
    const parsedData = JSON.parse(loggedInUserData);
    const deletedBy = parsedData.employee_id;
    this.registerService.deleteFbo(fbo._id, deletedBy).subscribe({
      next: (res) => {
        if (res.success) {
          const index = this.allFBOEntries.findIndex((entry: any) => entry._id === fbo._id);
          if (index !== -1) {
            this.allFBOEntries.splice(index, 1);
            this.filter();
          }
        }
      },
      error: (err) => {
        let errorObj = err;
        if (errorObj.userError) {
          this.registerService.signout();
        }
      }
    });
  }

  //Export To CSV
  exportToCsv(): void {
    const options: ExportAsConfig = {
      type: 'csv',
      elementIdOrContent: 'data-to-export',
    };

    this.exportAsService.save(options, 'table_data').subscribe(() => {
    });
  }

  //open form for entering recp details for verifier 
  recipient(res: any, serviceType: string) {
    if (this.isVerifier) {
      if (res !== '' && serviceType === 'Fostac') {
        const modalRef = this.modalService.open(RecipientComponent, { size: 'xl', backdrop: 'static' });
        modalRef.componentInstance.fboData = res;
        modalRef.componentInstance.serviceType = serviceType;
        modalRef.componentInstance.isVerifier = this.isVerifier;
      } else {
        const modalRef = this.modalService.open(RecipientComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.fboData = res;
        modalRef.componentInstance.serviceType = serviceType;
        modalRef.componentInstance.isVerifier = this.isVerifier;
      }
    }

  }

  //upload shop identification documents
  uploadSaleDoc(res: any, serviceType: string) { //func for uploading sale doc by opening sale doc modal
    const modalRef = this.modalService.open(SaleDocModalComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.fboData = res;
    modalRef.componentInstance.serviceType = serviceType;
    // modalRef.componentInstance.isVerifier = this.isVerifier;
  }


  //View FBO Details
  viewFboDetails($event: Event, res: any) {
    $event.stopPropagation();
    const modalRef = this.modalService.open(ViewFboComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.fboData = res;
    modalRef.componentInstance.isVerifier = this.isVerifier;
    modalRef.componentInstance.product = this.activeTab;
  }


  //change the filltered data in case of tab(product) change
  toogleTabs(tab: string) {
    this.activeTab = tab;
    this.pageNumber = 1;

    this.filteredFBOEntries = this.allFBOEntries.filter((item: any) => {
      if (item.product_name.includes(tab)) {
        return item;
      }
    });

    if (this.isVerifier) { // filter pending in case of verifer
      this.filteredFBOEntries = this.filteredFBOEntries.filter((entry: any) => entry.checkStatus === 'Pending');
    }

    this.filter();

  }

  //methord change the view format ofthe sales date in the table
  getFormattedSalesDate(dateString: string): string {
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

  // Method to calculate the processing amount for each row
  calculateProcessingAmount(employee: any): number {
    let processingAmount = 0;

    if (this.activeTab === 'Fostac') {
      processingAmount = employee.fostacInfo.fostac_processing_amount * employee.fostacInfo.recipient_no;
    } else if (this.activeTab === 'Foscos') {
      let watertest = 0;
      if (employee.foscosInfo.water_test_fee != 0) {
        watertest = employee.foscosInfo.water_test_fee - 1200;
      }
      processingAmount = (employee.foscosInfo.foscos_processing_amount * employee.foscosInfo.shops_no) + watertest;
    } else if (this.activeTab === 'HRA') {
      processingAmount = employee.hraInfo.hra_processing_amount * employee.hraInfo.shops_no;
    }
    else if (this.activeTab === 'Medical') {
      processingAmount = employee.medicalInfo.medical_processing_amount * employee.medicalInfo.recipient_no;
    }
    else if (this.activeTab === 'Water Test Report') {
      processingAmount = employee.waterTestInfo.water_test_processing_amount;
    }
    else if (this.activeTab === 'Khadya Paaln') {
      processingAmount = employee.khadyaPaalnInfo.khadya_paaln_processing_amount;
    }

    return processingAmount;
  }

  //calculate foscos processing amount
  calculateFoscosProcessingAmount(employee: any): number { //methord for calculating total foscos processing amount with water test fee excluding it'st water test fees
    let processingAmount = 0;


    if (employee.product_name) {
      // Calculate processing amount based on the product name
      employee.product_name.forEach((product: any) => {
        if (product == "Foscos") {
          let watertest = 0;
          if (employee.foscosInfo.water_test_fee != 0) {
            watertest = employee.foscosInfo.water_test_fee - 1200;
          }

          processingAmount += (employee.foscosInfo.foscos_processing_amount * employee.foscosInfo.shops_no) + watertest;
        }
      });
    }

    return processingAmount;
  }

  //methord for setting sale status for user(either sales man or verifier) by checking some conditions
  getSalesStatus(sale: any): string {
    if (this.isVerifier) {
      return sale.checkStatus
    } else {

      if ((!sale.cheque_data || sale.cheque_data.status === 'Approved') && sale.fboInfo.isBasicDocUploaded) {
        return 'Approved'
      } else {
        return 'Pending'
      }
    }
  }

  //methord for opeining confirmation modal in case approving cheque
  approveCheque($event: Event, saleId: string, sale: any): void { //methord for approving cheque in only avilable to director
    $event.stopPropagation()
    this.selectedSaleId = saleId;
    const modalRef = this.modalService.open(ConformationModalComponent, { size: 'md', backdrop: 'static' });
    modalRef.componentInstance.action = 'Approve Cheque';
    modalRef.componentInstance.confirmationText = sale.cheque_data.cheque_number;
    modalRef.componentInstance.actionFunc.subscribe((confirmation: boolean) => {
      this.connformationFunc(confirmation);
    });
  }

  //methord run ater you confirm the approval of cheque for sending the invoice
  connformationFunc = (confirmation: boolean) => { //this func will reun after confirmation comes from confirmation modal in case like cheque approval
    if (confirmation) {
      this.loading = true;
      this.registerService.updateChequeApproval(this.selectedSaleId).subscribe({
        next: res => {
          this.loading = false;
          location.reload();
        },
        error: err => {
          this.loading = false;
        }
      })
    }
  }

  //method for initializing the basic deatils about what to show according to user, route etc.
  intailize() {
    let user: any = this.registerService.LoggedInUserData(); //getting user(user of the panel) data
    let parsedUser = JSON.parse(user); //parsing the user josn
    this.userData = parsedUser;

    //set configuration for verifier in case user designation is lies in the roles of verifier
    if (parsedUser.panel_type === 'FSSAI Relationship Panel') {
      this.isVerifier = true;
    }

    //set condigurations in case using this list as invoice list
    const state = window.history.state; //getting state of the window
    if (state && state.isInvoiceList) {
      this.isInvoiceList = true;
    }
  }

  //only avilable to verifier for reselling from pendig fostac list 
  doSale(fbo: any): void {
    const modalRef = this.modalService.open(FbonewComponent, { size: 'xl', backdrop: 'static' });
    modalRef.componentInstance.isCalledAsChild = true;
    modalRef.componentInstance.fboForm.patchValue({
      boInfo: fbo.fboInfo.boInfo._id,
      fbo_name: fbo.fboInfo.fbo_name,
      owner_name: fbo.fboInfo.owner_name,
      business_entity: fbo.fboInfo.boInfo.business_entity,
      business_category: fbo.fboInfo.boInfo.business_category,// form control added by chandan for business_Owner
      business_ownership_type: fbo.fboInfo.boInfo.business_ownership_type, // form control added for business_Owner
      manager_name: fbo.fboInfo.boInfo.manager_name,
      owner_contact: fbo.fboInfo.owner_contact,
      email: fbo.fboInfo.boInfo.email,
      state: fbo.fboInfo.state,
      district: fbo.fboInfo.district,
      village: fbo.fboInfo.village,
      tehsil: fbo.fboInfo.tehsil,
      address: fbo.fboInfo.address,
      pincode: fbo.fboInfo.pincode,
      business_type: fbo.fboInfo.business_type,
    });

    if (fbo.fboInfo.business_type === 'b2b') {//patch gst number in case of gst businesstype = b2b
      modalRef.componentInstance.fboForm.patchValue({ gst_number: fbo.fboInfo.gst_number });
    }

    modalRef.componentInstance.existingFboId = fbo.fboInfo.customer_id;

  }

}
