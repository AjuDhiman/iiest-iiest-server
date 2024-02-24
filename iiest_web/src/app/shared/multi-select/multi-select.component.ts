import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss']
})
export class MultiSelectComponent implements OnChanges {
  faAngleDown = faAngleDown;
  all: Array<{ value: string | number, checked: boolean }> = [];
  selected: Array<string | number> = [];
  isdropped = false;
  invalid: boolean = false;
  isDisplayEmpty: boolean = true;

  @Input()
  options: string[]|number[];

  @Input()
  placeHolder: string = '';

  @Input() forProducts:boolean=false

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
      this.all.push({ value: option, checked: false }); 
    }
  }

  onclicked(event: Event, index: number): void {
    //initially we will toggle the check of clicked element tracking by index cames from templet
    this.all[index].checked = !this.all[index].checked;

    let value = this.all[index].value
    if (this.all[index].checked) {
      console.log(value);
      this.selected.push(value);
    }
    else {
      this.selected.splice(this.selected.indexOf(value), 1);
    }

    //we want to emit the array of all selected elements
    this.selectedArrayChange.emit(this.selected);
    
    if (this.selected.length === 0) {
      this.isDisplayEmpty = true;
    }
    else {
      this.isDisplayEmpty = false;
    }
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
}
