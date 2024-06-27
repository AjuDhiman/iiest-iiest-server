import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss']
})
export class MultiSelectComponent implements OnChanges {
  faAngleDown = faAngleDown;
  all: Array<{ value: string | number, checked: boolean, isDisabled: boolean }> = [];
  selected: Array<string | number> = [];
  isdropped = false;
  invalid: boolean = false;
  isDisplayEmpty: boolean = true;
  popedElement: string|number = '';

  @Input()
  options: string[]|number[];

  @Input()
  placeHolder: string = '';

  @Input() forProducts:boolean=false;

  @Input() isDisabled: boolean = false;

  @Input() disabledArray: string[]|number[] = []; // this array will contain all the value to be diabled from all options

  @ViewChild('display') display: ElementRef;

  @Output()
  selectedArrayChange: EventEmitter<any> = new EventEmitter<any>;

  ngAfterViewInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] && changes['options'].currentValue) {
      // 'options' has changed
      this.initializeAll();
    }
  }

  initializeAll(): void {
    this.all = [];
    //we are associating a checked boolean with every value for keepig track of check boxes 
    //associated with them
    for (let option of this.options) {
      this.all.push({ value: option, checked: false, isDisabled: this.disabledArray.includes((option) as never)?true:false }); // we are setting basic initial condition for array of all check boxes , value for value , checked for selecting checked or not and isDisbled for deciding disbled or not
    }
  }

  onclicked(event: Event, index: number): void {
    //initially we will toggle the check of clicked element tracking by index cames from templet
    this.all[index].checked = !this.all[index].checked;

    let value = this.all[index].value
    if (this.all[index].checked) {
      this.selected.push(value);
    }
    else {
      this.popedElement = this.selected.splice(this.selected.indexOf(value), 1)[0];
    }

    //we want to emit the array of all selected elements
    this.selectedArrayChange.emit(this.selected);
    
    this.checkIfEmpty()

    event.stopPropagation();
  }

  onDisplayClick(event: Event): void {//this function will close if display is unfocused
    this.isdropped = !this.isdropped;
    event.stopPropagation();
  }

  onCheckClick(event: Event): void {
    event.stopPropagation();
  }

  onReset() : void {
    this.selected = [];
    this.isDisplayEmpty = true;
    this.isdropped = false;
    this.invalid = false;
    this.all.forEach(item => item.checked = false);
  }

  checkIfEmpty(){
    if (this.selected.length === 0) {
      this.isDisplayEmpty = true;
    }
    else {
      this.isDisplayEmpty = false;
    }
  }
}
