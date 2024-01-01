import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { waterTestFee, clientType, paymentMode, licenceType, serviceNames } from '../../../utils/config';
@Component({
  selector: 'app-foscos',
  templateUrl: './foscos.component.html',
  styleUrls: ['./foscos.component.scss']
})
export class FoscosComponent implements OnInit {
  @Input() formGroupName: string;
  @Input() submitted: boolean;
  @Output() foscosTotal = new EventEmitter<number>();
  waterTestFee = waterTestFee;
  clientType = clientType;
  paymentMode = paymentMode;
  licenceType = licenceType;
  serviceNames = serviceNames;
  minValue: number = 1;
  isReadOnly: boolean = false;
  foscosTotalAmnt: number;
  foscos_training: FormGroup;
  fixedCharge: number;
  fixedChargeWithDuration: number;
  totalFixedCharge: number;
  processAmnt: number;
  waterTestAmnt: number;
  constructor(private rootFormGroup: FormGroupDirective) { }
  ngOnInit(): void {
    console.log(this.formGroupName);
    this.foscos_training = this.rootFormGroup.control.get(this.formGroupName) as FormGroup;
  }

  onServiceChange($event: any) {
    let serviceType = $event.target.value;
    let licenceCat = this.foscos_training.value.license_category;
    let duration = this.foscos_training.value.license_duration;
    let clientType = this.foscos_training.value.foscos_client_type;
    let shopsCount = this.foscos_training.value.shops_no;
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
        alert()
          let foscosAmntWithWaterFee = this.foscosTotalAmnt + Number(waterTestAmnt)
          this.foscosTotalAmount(foscosAmntWithWaterFee);
      }
    }
  }

  onlicenceCategory($event: any) {
    let serviceType = this.foscos_training.value.foscos_service_name;
    let licenceCat = $event.target.value;
    let duration = this.foscos_training.value.license_duration;
    let clientType = this.foscos_training.value.foscos_client_type;
    let shopsCount = this.foscos_training.value.shops_no;
    let waterTestAmnt = this.foscos_training.value.water_test_fee;
    if (serviceType != '') {
      this.getProcessAmnt(serviceType, licenceCat);
    }
    if (serviceType !== '' && duration !== '') {
      this.getProcessAmnt(serviceType, licenceCat);
      this.totalFixedCharge = this.fixedChargeIntoDuration(serviceType, licenceCat, duration);
      console.log(this.totalFixedCharge);
    }
    if ((licenceCat !== '' && duration !== '' && clientType !== '' && shopsCount !== '') || waterTestAmnt !== '') {
      let totalAmnt = this.GSTandTotalAmnt(shopsCount);
      this.foscosTotalAmnt = totalAmnt + this.totalFixedCharge;
      this.foscosTotalAmount(this.foscosTotalAmnt);
      
      if (waterTestAmnt) {
        alert()
          let foscosAmntWithWaterFee = this.foscosTotalAmnt + Number(waterTestAmnt)
          this.foscosTotalAmount(foscosAmntWithWaterFee);
      }
    }

  }

  onlicenceDuration($event: any) {
    let serviceType = this.foscos_training.value.foscos_service_name;
    let licenceCat = this.foscos_training.value.license_category;
    let duration = Number($event.target.value);
    let clientType = this.foscos_training.value.foscos_client_type;
    let shopsCount = this.foscos_training.value.shops_no;
    let waterTestAmnt = this.foscos_training.value.water_test_fee;
    console.log(typeof ($event.target.value))
    if (serviceType !== '' && licenceCat !== '') {
      this.totalFixedCharge = this.fixedChargeIntoDuration(serviceType, licenceCat, duration);
      console.log(this.totalFixedCharge);
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
  }


  patchProcessingAmnt(amnt: number) {
    this.foscos_training.patchValue({ 'foscos_processing_amount': amnt });
  }

  getProcessAmnt(serviceType: string, licenceCat: string) {
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

  fixedChargeIntoDuration(serviceType: string, licenceCat: string, duration: number) {
    console.log(serviceType, licenceCat, duration);
    if (serviceType === 'Registration') {
      this.fixedCharge = 100;
      if (licenceCat == 'New Licence' || licenceCat === 'Renewal') {
        this.fixedChargeWithDuration = this.fixedCharge * duration;
      }
      if (licenceCat === 'Modified') {
        this.fixedChargeWithDuration = this.fixedCharge;
      }
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
    }
    return this.fixedChargeWithDuration;
  }

  //Client Type function for GST calculation on basis of Client.
  clienttypeFun($event: any) {
    let waterTestAmnt = Number(this.foscos_training.value.water_test_fee);
    if ($event.target.value === 'General Client') {
      this.isReadOnly = true;
      this.minValue = 1;
      let TotalAmnt = this.GSTandTotalAmnt(this.minValue) + this.totalFixedCharge + waterTestAmnt;
      this.foscos_training.patchValue({ 'shops_no': this.minValue });
      this.foscosTotalAmount(TotalAmnt);
    } else {
      this.isReadOnly = false;
      this.minValue = 2
      let TotalAmnt = this.GSTandTotalAmnt(this.minValue) + this.totalFixedCharge + waterTestAmnt;
      this.foscos_training.patchValue({ 'shops_no': this.minValue });
      this.foscosTotalAmount(TotalAmnt);
    }
  }

  //Recipient Count Function passing the recipient no. to GST Calculation function.
  recipientCount($event: any) {
    let val = Number($event.target.value);
    this.GSTandTotalAmnt(val)
  }

  //Water Test fee Function add the water Test fee to GST Calculation function.
  waterTestAdd($event: any) {
    this.waterTestAmnt = Number($event.target.value);
    let totalAmntwithWaterFee = this.foscosTotalAmnt + this.waterTestAmnt;
    this.foscosTotalAmount(totalAmntwithWaterFee);
  }

  // GST Calculation on Processing Amount and No. of Shops basis.
  GSTandTotalAmnt(param: number) {
    let foscos_processAmnt = this.foscos_training.value.foscos_processing_amount * param
    let GST_amount = foscos_processAmnt * 18 / 100;
    this.foscosTotalAmnt = Number(GST_amount) + foscos_processAmnt;
    this.foscosTotalAmount(this.foscosTotalAmnt);
    console.log(this.foscosTotalAmnt);
    return this.foscosTotalAmnt;
  }

  //Set Foscos Total and Emit Foscos Total to Parent Component FBO. 
  foscosTotalAmount(amnt: number) {
    this.foscos_training.patchValue({ 'foscos_total': amnt });
    this.foscosTotal.emit(amnt);
  }

}
