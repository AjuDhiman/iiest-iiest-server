import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { faIndianRupeeSign } from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-view-fbo',
  templateUrl: './view-fbo.component.html',
  styleUrls: ['./view-fbo.component.scss']
})
export class ViewFboComponent implements OnInit {
  @Input() public fboData: any;
  fulladdress: any;
  recipientData: any;
  shopDetails:any;
  isfostac:boolean= false;
  faIndianRupeeSign = faIndianRupeeSign;
  constructor(public activeModal: NgbActiveModal) { 
  }

  ngOnInit(): void {
   /*  if(this.fboData.fbo_type === 'Fostac Training'){
      this.isfostac == true;
    }else{
      this.isfostac == false;
    } */
    this.isfostac = true?this.fboData.product_name.includes('Fostac Training') : this.isfostac = false;
   //this.fulladdress =  "Village: "+ this.fboData.village+", Post-Office: "+ this.fboData.address+", Tehsil: "+ this.fboData.tehsil+", District: "+ this.fboData.district+", State: "+ this.fboData.state+", Pincode: "+ this.fboData.pincode+", "+ "India";
   this.fulladdress =  this.fboData.fboInfo.village+", "+ this.fboData.fboInfo.address+", "+ this.fboData.fboInfo.tehsil+", "+ this.fboData.fboInfo.district+", "+ this.fboData.fboInfo.state+", Pincode: "+ this.fboData.fboInfo.pincode+", "+ "India";
  }
  closeModal() {
    this.activeModal.close();
  }

}