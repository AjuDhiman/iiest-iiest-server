import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { clientType, licenceType, paymentMode, serviceNames, waterTestFee } from 'src/app/utils/config';

@Component({
  selector: 'app-foscos',
  templateUrl: './foscos.component.html',
  styleUrls: ['./foscos.component.scss']
})
export class FoscosComponent implements OnInit {
  @Input() formGroupName: string;
  @Input() submitted: boolean;
  @Input() customSale: boolean;
  @Output() foscosTotal = new EventEmitter<number>();
  @Output() foscosFixedCharge = new EventEmitter<number>();
  @Output() foscosGSTAmount = new EventEmitter<number>();
  waterTestFee = waterTestFee;
  // clientType = clientType;
  clientType = ['General Client', 'Corporate Client'];
  paymentMode = paymentMode;
  licenceType = licenceType;
  serviceNames = serviceNames;
  minValue: number = 1;
  isReadOnly: boolean = true;
  foscosTotalAmnt: number;
  foscos_training: FormGroup;
  fixedCharge: number;
  fixedChargeWithDuration: number;
  totalFixedCharge: number;
  processAmnt: number;
  waterTestAmnt: number;
  foscos_processAmnt: number;
  constructor(private rootFormGroup: FormGroupDirective) { }
  ngOnInit(): void {
    this.foscos_training = this.rootFormGroup.control.get(this.formGroupName) as FormGroup;
    this.foscos_training.patchValue({ 'shops_no': this.minValue });
  }
 

  onServiceChange($event: any) {
    let serviceType = $event.target.value;
    let licenceCat = this.foscos_training.value.license_category;
    let duration = this.foscos_training.value.license_duration;
    // let clientType = this.foscos_training.value.foscos_client_type;
    let clientType = 'General Client';
    // let shopsCount = this.foscos_training.value.shops_no;
    let shopsCount: any = 1; //we used static shop count because we changed our requirement of client type
    let waterTestAmnt = this.foscos_training.value.water_test_fee;
    if (licenceCat != '') {
      this.getProcessAmnt(serviceType, licenceCat);
    }
    if (licenceCat !== '' && duration !== '') {
      this.getProcessAmnt(serviceType, licenceCat);
      this.totalFixedCharge = this.fixedChargeIntoDuration(serviceType, licenceCat, duration);
    }
    if ((licenceCat !== '' && duration !== '' && clientType !== '' && shopsCount !== '') || waterTestAmnt !== '') {
      let totalAmnt = this.GSTandTotalAmnt(shopsCount);
      this.foscosTotalAmnt = totalAmnt + this.totalFixedCharge;
      this.foscosTotalAmount(this.foscosTotalAmnt);
      
      if (waterTestAmnt) {
          let foscosAmntWithWaterFee = this.foscosTotalAmnt + Number(waterTestAmnt)
          this.foscosTotalAmount(foscosAmntWithWaterFee);
      }
    }
  }

  onlicenceCategory($event: any) {
    let serviceType = this.foscos_training.value.foscos_service_name;
    let licenceCat = $event.target.value;
    let duration = this.foscos_training.value.license_duration;
    // let clientType = this.foscos_training.value.foscos_client_type;
    // let shopsCount = this.foscos_training.value.shops_no;
    let clientType = 'General Client';
    let shopsCount: any = 1;
    let waterTestAmnt = this.foscos_training.value.water_test_fee;
    if (serviceType != '') {
      this.getProcessAmnt(serviceType, licenceCat);
    }
    if (serviceType !== '' && duration !== '') {
      this.getProcessAmnt(serviceType, licenceCat);
      this.totalFixedCharge = this.fixedChargeIntoDuration(serviceType, licenceCat, duration);
    }
    if ((licenceCat !== '' && duration !== '' && clientType !== '' && shopsCount !== '') || waterTestAmnt !== '') {
      let totalAmnt = this.GSTandTotalAmnt(shopsCount);
      this.foscosTotalAmnt = totalAmnt + this.totalFixedCharge;
      this.foscosTotalAmount(this.foscosTotalAmnt);
      
      if (waterTestAmnt) {
          let foscosAmntWithWaterFee = this.foscosTotalAmnt + Number(waterTestAmnt)
          this.foscosTotalAmount(foscosAmntWithWaterFee);
      }
    }

  }

  onlicenceDuration($event: any) {
    let serviceType = this.foscos_training.value.foscos_service_name;
    let licenceCat = this.foscos_training.value.license_category;
    let duration = Number($event.target.value);
    let clientType = 'General Client'
    let shopsCount: any = 1
    let waterTestAmnt = this.foscos_training.value.water_test_fee;
    if (serviceType !== '' && licenceCat !== '') {
      this.totalFixedCharge = this.fixedChargeIntoDuration(serviceType, licenceCat, duration);
    }
    if ((licenceCat !== '' && serviceType !== '' && clientType !== '' && shopsCount !== '') || waterTestAmnt !== '') {
      let totalAmnt = this.GSTandTotalAmnt(shopsCount);
      this.foscosTotalAmnt = totalAmnt + this.totalFixedCharge;
      this.foscosTotalAmount(this.foscosTotalAmnt);
      
      if (waterTestAmnt) {
          let foscosAmntWithWaterFee = this.foscosTotalAmnt + Number(waterTestAmnt)
          this.foscosTotalAmount(foscosAmntWithWaterFee);
      }
    }
    if(this.customSale){
      let govtChargeWithDuration = this.foscos_training.value.foscos_govtFee * this.foscos_training.value.license_duration;
      let processAmtWithGST = Number(this.foscos_training.value.foscos_processing_amount) * 1.18;

      this.foscosTotalAmnt = processAmtWithGST+govtChargeWithDuration;
      this.foscosTotalAmount(this.foscosTotalAmnt);

    }
  }


  patchProcessingAmnt(amnt: number) {
    this.foscos_training.patchValue({ 'foscos_processing_amount': amnt });
  }

  processAmountChange(){
    //const fpa = this.foscos_training.value.foscos_processing_amount + this.fixedCharge;
    this.GSTandTotalAmnt(1)
    
  }

  getProcessAmnt(serviceType: string, licenceCat: string) {
    if(!this.customSale){
      if (serviceType === 'Registration') {
        //Registraion + Newlicence
        if (licenceCat === 'New Licence') {
          this.processAmnt = 1700;
          this.patchProcessingAmnt(this.processAmnt);       
        }
        //Registraion + Renewal
        if (licenceCat === 'Renewal') {
          this.processAmnt = 1300;
          this.patchProcessingAmnt(this.processAmnt);
        }
        //Registraion + modified
        if (licenceCat === 'Modified') {
          this.processAmnt = 1500;
          this.patchProcessingAmnt(this.processAmnt);
        }
      }
      if (serviceType === 'State') {
        //State + Newlicence
        if (licenceCat === 'New Licence') {
          this.processAmnt = 3000;
          this.patchProcessingAmnt(this.processAmnt);
        }
        //State + Renewal
        if (licenceCat === 'Renewal') {
          this.processAmnt = 2000;
          this.patchProcessingAmnt(this.processAmnt);
        }
        //State + modified
        if (licenceCat === 'Modified') {
          this.processAmnt = 2500;
          this.patchProcessingAmnt(this.processAmnt);
        }
      }
    }
  }

  fixedChargeIntoDuration(serviceType: string, licenceCat: string, duration: number) {
    if(!this.customSale){
      if (serviceType === 'Registration') {
        this.fixedCharge = 100;
        if (licenceCat == 'New Licence' || licenceCat === 'Renewal') {
          this.fixedChargeWithDuration = this.fixedCharge * duration;
        }
        if (licenceCat === 'Modified') {
          this.fixedChargeWithDuration = this.fixedCharge;
        }
        this.foscosFixedCharge.emit(this.fixedChargeWithDuration);
      }
      if (serviceType === 'State') {
        if (licenceCat == 'New Licence' || licenceCat === 'Renewal') {
          this.fixedCharge = 2000;
          this.fixedChargeWithDuration = this.fixedCharge * duration;

        }
        if (licenceCat === 'Modified') {
          this.fixedCharge = 1000;
          this.fixedChargeWithDuration = this.fixedCharge;
        }
        this.foscosFixedCharge.emit(this.fixedChargeWithDuration);
      }
    }else{
      if (serviceType === 'Registration') {
        this.fixedCharge = this.foscos_training.value.foscos_govtFee;
        if (licenceCat == 'New Licence' || licenceCat === 'Renewal') {
          this.fixedChargeWithDuration = this.fixedCharge * duration;
        }
        if (licenceCat === 'Modified') {
          this.fixedChargeWithDuration = this.fixedCharge;
        }
        this.foscosFixedCharge.emit(this.fixedChargeWithDuration);
      }
      if (serviceType === 'State') {
        if (licenceCat == 'New Licence' || licenceCat === 'Renewal') {
         
          this.fixedChargeWithDuration = this.fixedCharge * duration;

        }
        if (licenceCat === 'Modified') {
         this.fixedChargeWithDuration = this.fixedCharge;
        }
        this.foscosFixedCharge.emit(this.fixedChargeWithDuration);
      }
    }

   
    return this.fixedChargeWithDuration;
  }

  govtFeeCharge($event: any){
    this.fixedCharge = $event.target.value;
    this.GSTandTotalAmnt(1);
  }

 
  //Water Test fee Function add the water Test fee to GST Calculation function.
  waterTestAdd($event: any) {
    this.waterTestAmnt = Number($event.target.value);
    let totalAmntwithWaterFee;
    if(!this.customSale){
    totalAmntwithWaterFee = this.GSTandTotalAmnt(1) + this.totalFixedCharge + this.waterTestAmnt;// shops no. are static because our client type requirement is changed
    }else{
      totalAmntwithWaterFee = this.GSTandTotalAmnt(1) + this.waterTestAmnt;
    }
    this.foscosTotalAmount(totalAmntwithWaterFee);
  }

  // GST Calculation on Processing Amount and No. of Shops basis.
  GSTandTotalAmnt(param: number) {
    this.foscos_processAmnt = this.foscos_training.value.foscos_processing_amount * param;
    let govtCharge = this.foscos_training.value.foscos_govtFee * this.foscos_training.value.license_duration;
    //console.log('Govt Charge----',govtCharge);
    
    let GST_amount = this.foscos_processAmnt * 18 / 100;
    // Add govtCharge to GST_amount if customSale is true
    if (this.customSale) {
      GST_amount += govtCharge;
    }
    this.foscosGSTAmount.emit(GST_amount)
    this.foscosTotalAmnt = Number(GST_amount) + this.foscos_processAmnt;
    this.foscosTotalAmount(this.foscosTotalAmnt);
    return this.foscosTotalAmnt;
  }

  //Set Foscos Total and Emit Foscos Total to Parent Component FBO. 
  foscosTotalAmount(amnt: number) {
    this.foscos_training.patchValue({ 'foscos_total': amnt });
    this.foscosTotal.emit(amnt);
  }

  
  resetForms() {
    this.foscos_training.reset({
      'foscos_service_name': '',
      'license_category':'',
      'license_duration':'',
      'foscos_processing_amount': '',
      'foscos_govtFee':'',
      'foscos_client_type': '', 
      'water_test_fee':'',
      'foscos_total': ''
    }); // Resetting the form values
    // Additionally, you might want to mark the form as pristine and untouched
    let amnt=0;
    this.foscosTotalAmount(amnt);
    this.foscos_training.markAsPristine();
    this.foscos_training.markAsUntouched();
  }
}
