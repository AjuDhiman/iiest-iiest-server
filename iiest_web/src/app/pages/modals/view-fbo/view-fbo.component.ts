import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { faIndianRupeeSign, faFile, faDownload } from '@fortawesome/free-solid-svg-icons';
import { fboRecipient, fboShop } from 'src/app/utils/registerinterface';
import { GetdataService } from 'src/app/services/getdata.service';

@Component({
  selector: 'app-view-fbo',
  templateUrl: './view-fbo.component.html',
  styleUrls: ['./view-fbo.component.scss']
})
export class ViewFboComponent implements OnInit {
  @Input() public fboData: any;
  fulladdress: string;
  recipientData: fboRecipient;
  shopDetails: fboShop;
  isfostac:boolean= false;
  faIndianRupeeSign = faIndianRupeeSign;
  faFile=faFile;
  faDownload=faDownload;
  showInvoice:boolean=false;
  invoice:string='';
  remainingTime: string = '';
  constructor(public activeModal: NgbActiveModal,
    private getDataServices: GetdataService,
    ) { 
  }

  ngOnInit(): void {
    this.isfostac = true?this.fboData.product_name.includes('Fostac Training') : this.isfostac = false;
   //this.fulladdress =  "Village: "+ this.fboData.village+", Post-Office: "+ this.fboData.address+", Tehsil: "+ this.fboData.tehsil+", District: "+ this.fboData.district+", State: "+ this.fboData.state+", Pincode: "+ this.fboData.pincode+", "+ "India";
   this.fulladdress =  this.fboData.fboInfo.village+", "+ this.fboData.fboInfo.address+", "+ this.fboData.fboInfo.tehsil+", "+ this.fboData.fboInfo.district+", "+ this.fboData.fboInfo.state+", Pincode: "+ this.fboData.fboInfo.pincode+", "+ "India";

   if(this.fboData.foscosInfo){
    this.calculateRemaningDays();
   }

   this.getInvoice();
  }
  closeModal() {
    this.activeModal.close();
  }

  getInvoice() {
    this.getDataServices.getInvoice(this.fboData.invoiceId).subscribe({
      next: (res) => {
        this.invoice = res.invoiceConverted;
      },
      error(err) {
        let errorObj = err.error;
        if(errorObj.userError){
          
        }else if(errorObj.randomErr){

        }else if(errorObj.oldInvoiceErr){
          
        }
      },
    })
  }

  closeInvoiceWindow(){
    this.showInvoice=false;
  }

  //this methord is for calculating remaning days for the foscos license
  calculateRemaningDays(){
    let today = new Date().getTime();

    let startDate = new Date(this.fboData.createdAt);

    let lastDate = new Date(startDate.getFullYear() + Number(this.fboData.foscosInfo.license_duration), startDate.getMonth(), startDate.getDate() ).getTime();

    console.log(lastDate);
   
    let remainingDays: number = Math.floor((lastDate - today)/(1000 * 60 * 60 * 24));

    let remainingYear: number = Math.floor(remainingDays / 365);

    remainingDays = remainingDays % 365;

    for(let year: number = 0; year < remainingYear ; year++) {
      if(new Date(remainingYear + year, 1, 29).getDate() === 29){
        remainingDays--;
      }
    }

    let remainingMonths: number = Math.floor(remainingDays / 30.5);

    remainingDays = remainingDays % 12;

    this.remainingTime = `${remainingYear} Years ${remainingMonths} Months ${remainingDays} Days`
  }

}