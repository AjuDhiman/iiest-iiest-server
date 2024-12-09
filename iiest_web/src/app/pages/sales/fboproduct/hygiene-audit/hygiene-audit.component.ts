import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { clientType, processAmnt, serviceNames } from 'src/app/utils/config';

@Component({
  selector: 'app-hygiene-audit',
  templateUrl: './hygiene-audit.component.html',
  styleUrls: ['./hygiene-audit.component.scss']
})
export class HygieneAuditComponent implements OnInit {
  @Input() formGroupName: string;
  @Input() customSale: boolean;
  @Input() submitted: boolean;
  @Output() hygieneTotal = new EventEmitter<number>();
  @Output() hygieneGSTAmount = new EventEmitter<number>();
  processAmnts = processAmnt;
  // clientType = clientType;
  clientType = ['General Client', 'Corporate Client'];
  minValue: number = 1;
  isReadOnly: boolean = true;
  hygieneTotalAmnt:number;

  hygiene_audit: FormGroup;

  constructor(private rootFormGroup: FormGroupDirective) { }

  ngOnInit(): void {
    this.hygiene_audit = this.rootFormGroup.control.get(this.formGroupName) as FormGroup;
    this.GSTandTotalAmnt(this.minValue)
    this.hygiene_audit.patchValue({ 'shops_no': this.minValue });
  }

// Processing Amount function for Calculating Hygiene total amount on basis of Processing Amount.
processAmount() {
  if (this.hygiene_audit.value.hra_client_type != '' && this.hygiene_audit.value.shops_no != '' &&
  this.hygiene_audit.value.hra_processing_amount != '' && this.hygiene_audit.value.hygiene_service_name !='') {
    this.GSTandTotalAmnt(this.hygiene_audit.value.shops_no);
  }
}
//Client Type function for GST calculation on basis of Client.
clienttypeFun($event: any) {
  if ($event.target.value === 'General Client') {
    this.isReadOnly = true;
    this.minValue = 1;
    let TotalAmnt = this.GSTandTotalAmnt(this.minValue)
    this.hygiene_audit.patchValue({ 'shops_no': this.minValue });
    this.hygieneTotalAmount( Number(TotalAmnt));
  } else {
    this.isReadOnly = false;
    this.minValue = 2
    let TotalAmnt = this.GSTandTotalAmnt(this.minValue)
    this.hygiene_audit.patchValue({ 'shops_no': this.minValue });
    this.hygieneTotalAmount( Number(TotalAmnt));
  }
}
//Shops Count Function passing the shops no. to GST Calculation function.
shopsCount($event: any) {
  let val = Number($event.target.value);
  
  this.GSTandTotalAmnt(val)
}
// GST Calculation on Processing Amount and No.of shops basis.
GSTandTotalAmnt(param: number) {
  let hra_processAmnt = this.hygiene_audit.value.hra_processing_amount * param
  let GST_amount = hra_processAmnt * 18 / 100;
  this.hygieneGSTAmount.emit(GST_amount);
  this.hygieneTotalAmnt = Number(GST_amount) + hra_processAmnt;
  this.hygieneTotalAmount(this.hygieneTotalAmnt);
  return this.hygieneTotalAmnt;
}
//Set Hygiene Total and Emit hygiene Total to Parent Component FBO. 
hygieneTotalAmount(amnt: number) {
  this.hygiene_audit.patchValue({ 'hra_total': amnt });
  this.hygieneTotal.emit(amnt);
}
resetForm() {
  this.hygiene_audit.reset({
    'hra_service_name': '',
    'hra_processing_amount': '',
    'hra_client_type': '', 
  });
}

}
