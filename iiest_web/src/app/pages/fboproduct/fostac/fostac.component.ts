import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { clientType, processAmnt, serviceNames } from '../../../utils/config';
@Component({
  selector: 'app-fostac',
  templateUrl: './fostac.component.html',
  styleUrls: ['./fostac.component.scss']
})
export class FostacComponent implements OnInit {
  @Input() formGroupName: string;
  @Input() submitted: boolean;
  @Output() fostacTotal = new EventEmitter<number>();
  serviceNames = serviceNames
  processAmnts = processAmnt;
  clientType = clientType;
  minValue: number = 1;
  isReadOnly: boolean = false;
  fostacTotalAmnt: number;
  fostac_training: FormGroup;
  constructor(private rootFormGroup: FormGroupDirective) { }
  ngOnInit(): void {
    this.fostac_training = this.rootFormGroup.control.get(this.formGroupName) as FormGroup;
  }
  
  // Processing Amount function for Calculating Fostac total amount on basis of Processing Amount.
  processAmount() {
    if (this.fostac_training.value.fostac_client_type != '' && this.fostac_training.value.recipient_no != '' &&
    this.fostac_training.value.fostac_processing_amount != '' && this.fostac_training.value.fostac_service_name !='') {
      this.GSTandTotalAmnt(this.fostac_training.value.recipient_no);
    }
  }

  //Client Type function for GST calculation on basis of Client.
  clienttypeFun($event: any) {
    if ($event.target.value === 'General Client') {
      this.isReadOnly = true;
      this.minValue = 1;
      let TotalAmnt = this.GSTandTotalAmnt(this.minValue)
      this.fostac_training.patchValue({ 'recipient_no': this.minValue });
      this.foctacTotalAmount(TotalAmnt);
    } else {
      this.isReadOnly = false;
      this.minValue = 2
      let TotalAmnt = this.GSTandTotalAmnt(this.minValue)
      this.fostac_training.patchValue({ 'recipient_no': this.minValue });
      this.foctacTotalAmount(TotalAmnt);
    }
  }

  //Recipient Count Function passing the recipient no. to GST Calculation function.
  recipientCount($event: any) {
    let val = Number($event.target.value);
    this.GSTandTotalAmnt(val)
  }

  // GST Calculation on Processing Amount and No.of recipient basis.
  GSTandTotalAmnt(param: number) {
    let fostac_processAmnt = this.fostac_training.value.fostac_processing_amount * param
    let GST_amount = fostac_processAmnt * 18 / 100;
    this.fostacTotalAmnt = Number(GST_amount) + fostac_processAmnt;
    this.foctacTotalAmount(this.fostacTotalAmnt);
    return this.fostacTotalAmnt;
  }

  //Set Fostac Total and Emit Fostac Total to Parent Component FBO. 
  foctacTotalAmount(amnt: number) {
    this.fostac_training.patchValue({ 'fostac_total': amnt });
    this.fostacTotal.emit(amnt);
  }
}
