import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { clientType, processAmnt, serviceNames } from 'src/app/utils/config';
@Component({
  selector: 'app-fostac',
  templateUrl: './fostac.component.html',
  styleUrls: ['./fostac.component.scss']
})
export class FostacComponent implements OnInit {
  @Input() formGroupName: string;
  @Input() submitted: boolean;
  @Output() fostacTotal = new EventEmitter<number>();
  @Output() fostacGSTAmount = new EventEmitter<number>();
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
      this.fostac_training.value.fostac_processing_amount != '' && this.fostac_training.value.fostac_service_name != '') {
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
      this.fostacTotalAmount(TotalAmnt);
    } else {
      this.isReadOnly = false;
      this.minValue = 2
      let TotalAmnt = this.GSTandTotalAmnt(this.minValue)
      this.fostac_training.patchValue({ 'recipient_no': this.minValue });
      this.fostacTotalAmount(TotalAmnt);
    }
  }

  //This methord caculates gst and total in case of service change
  onServiceSelect(): void {
    if (this.fostac_training.value.recipient_no != '') {
      console.log(this.fostac_training.value.recipient_no);
      this.GSTandTotalAmnt(this.fostac_training.value.recipient_no);
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
    this.fostacGSTAmount.emit(GST_amount);
    this.fostacTotalAmnt = Number(GST_amount) + fostac_processAmnt;
    this.fostacTotalAmount(this.fostacTotalAmnt);
    return this.fostacTotalAmnt;
  }

  //Set Fostac Total and Emit Fostac Total to Parent Component FBO. 
  fostacTotalAmount(amnt: number) {
    this.fostac_training.patchValue({ 'fostac_total': amnt });
    this.fostacTotal.emit(amnt);
  }

  resetForm() {
    this.fostac_training.reset({
      'fostac_service_name': '',
      'fostac_processing_amount': '',
      'fostac_client_type': '',
    }); // Resetting the form values
    // Additionally, you might want to mark the form as pristine and untouched
    let amnt = 0;
    this.fostacTotalAmount(amnt);
    this.fostac_training.markAsPristine();
    this.fostac_training.markAsUntouched();
  }
}
