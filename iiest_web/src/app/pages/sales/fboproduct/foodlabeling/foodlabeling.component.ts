import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { clientType, processAmnt } from 'src/app/utils/config';

@Component({
  selector: 'app-foodlabeling',
  templateUrl: './foodlabeling.component.html',
  styleUrls: ['./foodlabeling.component.scss']
})


export class FoodlabelingComponent implements OnInit {
  @Input() formGroupName!: string;
  @Input() submitted: boolean;
  @Input() customSale: boolean;
  @Input() productData: any;
  @Output() foodLabelingTotal = new EventEmitter<number>();
  @Output() foodLabelingGSTAmount = new EventEmitter<number>();
  serviceNames: String[] = [];
  processAmnts = processAmnt;
  clientType = clientType;
  minValue: number;
  minPrice: number;
  maxPrice: number;
  isReadOnly: boolean = true;
  food_labelTotalAmnt: number;
  food_labeling!: FormGroup;
  selected_serviceName:String = ''; 
  constructor(private rootFormGroup: FormGroupDirective) { }
  ngOnInit(): void {
    //console.log(JSON.stringify(this.productData))
    this.productData.forEach((service: { serviceName: String; }) => {
      this.serviceNames.push(service.serviceName)
    })
    //console.log(this.serviceNames)
    this.food_labeling = this.rootFormGroup.control.get(this.formGroupName) as FormGroup;
    if (!this.food_labeling) {
     // console.error(`Form group with name '${this.formGroupName}' not found in parent FormGroup!`);
    }
  }

  // Processing Amount function for Calculating Fostac total amount on basis of Processing Amount.
  processAmount() {
    const { food_labeling_service_name, food_labeling_processing_amount, product_no } = this.food_labeling.value;
  
    // Parse the processing amount to a number for range comparison
    const processingAmount = food_labeling_processing_amount ? parseFloat(food_labeling_processing_amount) : null;
    if (processingAmount === null ) {
      this.food_labeling.patchValue({ 'food_labeling_total': processingAmount });
      return;
    }
  
    if (food_labeling_service_name && food_labeling_processing_amount && product_no) {
      // Validate based on service name
      if (food_labeling_service_name === 'Product Labeling') {
        if (processingAmount >= 5000 && processingAmount <= 15000) {
          //console.log('Processing amount for Product Labeling must be in the range of 5000 to 15000.'); 
          this.GSTandTotalAmnt(product_no);
        }else{
          this.food_labeling.patchValue({ 'food_labeling_total': null });
          this.foodLabelingTotal.emit(0)
        }
      } else if (food_labeling_service_name === 'Menu Labeling') {
        if (processingAmount >= 500 && processingAmount <= 800) {
          //console.log('Processing amount for Menu Labeling must be in the range of 500 to 800.');
          //return;
          this.GSTandTotalAmnt(product_no);
          
        }
        else{
          this.food_labeling.patchValue({ 'food_labeling_total': null });
          this.foodLabelingTotal.emit(0)
        }
      }
  
      // If validation passes, calculate GST and total amount
     // this.GSTandTotalAmnt();
    } else {
      this.food_labeling.value.food_labeling_total = 0
      //console.log('Please fill in both the service name and processing amount.');
    }
  }
  

  //This methord caculates gst and total in case of service change
  onServiceSelect(): void {
    const { food_labeling_service_name, food_labeling_processing_amount, product_no } = this.food_labeling.value;
    if (food_labeling_service_name != '') {
      this.selected_serviceName = food_labeling_service_name;
      const selectedService = this.productData.find((service: { serviceName: any; }) => 
        service.serviceName === this.selected_serviceName);

      if (selectedService) {
        this.minPrice = selectedService.priceRange[0].minPrice;
        this.maxPrice = selectedService.priceRange[0].maxPrice;
        this.food_labeling.patchValue({ food_labeling_processing_amount: this.maxPrice }); 
        //return { minPrice, maxPrice };
        console.log(food_labeling_processing_amount, product_no);
        if(food_labeling_processing_amount!='' && product_no != ''){
          this.GSTandTotalAmnt(product_no);
        }
      }
      

    }
  }

  // GST Calculation on Processing Amount and No.of recipient basis.
  GSTandTotalAmnt(param: number) {
    let foodlabel_processAmnt = Number(this.food_labeling.value.food_labeling_processing_amount) * param
    let GST_amount = Math.round(foodlabel_processAmnt * 18 / 100);
    this.foodLabelingGSTAmount.emit(GST_amount);
    this.food_labelTotalAmnt = Number(GST_amount) + foodlabel_processAmnt;
    this.foodlabelTotalAmount(this.food_labelTotalAmnt);
    //console.log(this.food_labelTotalAmnt);
    return this.food_labelTotalAmnt;
  }

  //Set Food Label Total and Emit Food Label Total to Parent Component FBO. 
  foodlabelTotalAmount(amnt: number): void {
    this.food_labeling.patchValue({ 'food_labeling_total': amnt });
    this.foodLabelingTotal.emit(amnt);
  }

  //Product Count Function passing the Product countto GST Calculation function.
  productCount($event: any) {
    //console.log($event.target.value);
    let val = Number($event.target.value);
    this.GSTandTotalAmnt(val)
  }

  resetForm() {
    this.food_labeling.reset({
      'food_labeling_service_name': '',
      'food_labeling_processing_amount': '',
    }); // Resetting the form values
    // Additionally, you might want to mark the form as pristine and untouched
    let amnt = 0;
    this.foodlabelTotalAmount(amnt);
    this.food_labeling.markAsPristine();
    this.food_labeling.markAsUntouched();
  }
}
