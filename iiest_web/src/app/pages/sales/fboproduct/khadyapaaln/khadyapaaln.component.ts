import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';

@Component({
  selector: 'app-khadyapaaln',
  templateUrl: './khadyapaaln.component.html',
  styleUrls: ['./khadyapaaln.component.scss']
})
export class KhadyapaalnComponent implements OnInit {
  @Input() formGroupName: string;
  @Input() submitted: boolean;
  @Input() customSale: boolean;
  @Input() khadya_paaln_processAmnt:any;
  @Input() khadya_paaln_serviceName:any;
  @Output() khadyaTotal = new EventEmitter<number>();
  @Output() khadyaGSTAmount = new EventEmitter<number>();
  khadya_paaln: FormGroup;
  khadyaPaalnGST: number = 0;
  khadyaPaalnFixedCharges: number = 0;
  isReadOnly: boolean = true;
  //Discount Check Box 
  isCheckboxChecked:boolean = false;
  showDiscountCheckbox: boolean = false;
  //khadya_paaln_processAmnt: { [key: string]: string } = {};
  //khadya_paaln_serviceName: { [key: string]: string } = {};
  constructor(private rootFormGroup: FormGroupDirective) { }
  ngOnInit(): void {
    this.khadya_paaln = this.rootFormGroup.control.get(this.formGroupName) as FormGroup;
   console.log(this.khadya_paaln)
  }
   //Discount Function
   onDiscountCheckboxChange(event: any ) {
    // Toggle the readonly based on the checkbox state
   
    this.isCheckboxChecked = event.target.checked;
    if(this.isCheckboxChecked === true){
     this.isReadOnly = false;
    }else{
     this.isReadOnly = true;
    }
    
    console.log('Checkbox is checked:', this.isCheckboxChecked);
   }
 
 
   //Khadya Paaln
 
   //This methord caculates gst and total in case of service change
   onServiceSelect(): void {
    console.log(this.khadya_paaln.value.khadya_paaln_service_name)
     if (this.khadya_paaln.value.khadya_paaln_service_name !== '') {
      this.showDiscountCheckbox = true;
      //this.showDiscountCheckbox = this.khadya_paaln.value.khadya_paaln_service_name === '2' ? true : false; 
      let serviceKey = this.khadya_paaln.value.khadya_paaln_service_name;
      this.khadya_paaln.get('khadya_paaln_processing_amount')?.setValue(this.khadya_paaln_processAmnt[serviceKey]); 
       this.GSTandTotalAmnt(this.khadya_paaln.value.khadya_paaln_processing_amount);
     }
   }
   // GST Calculation on Processing Amount and No.of recipient basis.
   GSTandTotalAmnt(param: number) {
    console.log(param);
     const baseAmount = typeof param === 'string' ? parseFloat(param) : param;
     const gst = Math.round((baseAmount * 18) / 100);   
     const totalAmountWithGST = baseAmount + gst;
     this.khadya_paaln.get('khadya_paaln_total')?.setValue(totalAmountWithGST);
    //this.khadyaPaalnTotalAmount(totalAmountWithGST);
     this.khadyaGSTAmount.emit(totalAmountWithGST);
   }
 
   //patching only khadys palasn amont in case of khadya paaln
   khadyaPaalnTotalAmount(TotalAmnt: any) {
     //this.khadya_paaln.patchValue({ 'grand_total': TotalAmnt });
     //this.khadyaTotal.emit(TotalAmnt);
   }  
 
   onProcessingAmountChange(amount: number): void {
     this.GSTandTotalAmnt(amount);
   }
}
