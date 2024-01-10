import { Component, Input, Output, OnInit, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import { faAngleDown, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss']
})
export class MultiSelectComponent implements OnInit, OnChanges {
  all: Array<{ count: number, name: string, value: any, checked: boolean }> = [];
  selected: Array<any> = [];
  val: number;
  iterable = 0;
  checksTop = 0;
  isdropped = false;
  faAngleDown = faAngleDown;
  faCircleExclamation = faCircleExclamation;
  value: any;
  selectedItemIndex: string;
  invalid: boolean = false;
  isDisplayEmpty: boolean = true;

  @Input()
  options: any;

  @Input()
  formReset: any;

  @Input()
  placeHolder: string = '';

  @Input()
  ForProducts:boolean = false;

  @Output()
  selectedArrayChange: EventEmitter<any> = new EventEmitter<any>;
  // async consoleopt(data:any){
  //   await console.log(data)
  // }

  ngOnInit() {

    // console.log(this.options);
    // this.initializeAll();
    this.checksTop = 100;
    this.iterable = 0;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] && changes['options'].currentValue) {
      // 'options' has changed, and it has a value
      console.log(this.options)
      this.initializeAll();
    }
  }

  initializeAll() {
    this.all=[];
    this.iterable=0;
    for (let option of this.options) {
      this.iterable++;

      // this.val = !isNaN(option[1])?option[1]:this.iterable
      this.all.push({ count: this.iterable, name: option, value: option, checked: false })
    }
    console.log(this.options)
  }

  onclicked(event: Event) {
    if (event.target instanceof HTMLInputElement) {
      this.selectedItemIndex = event.target.value;
      this.all[+this.selectedItemIndex - 1].checked = !this.all[+event.target.value - 1].checked;
      this.value = this.all.find(item => item.count === +this.selectedItemIndex)?.value
      if (this.all[+this.selectedItemIndex - 1].checked) {
        console.log(this.value);
        this.selected.push(this.value);
      }
      else {
        this.selected.splice(this.selected.indexOf(this.value), 1);
      }
    }
    this.selectedArrayChange.emit(this.selected);
    if (this.selected.length === 0) {
      console.log(this.selected.length);
      this.isDisplayEmpty = true;
    }
    else {
      this.isDisplayEmpty = false;
    }
    event.stopPropagation();
  }

  onDisplayClick(event: Event) {
    this.isdropped = !this.isdropped;
    event.stopPropagation();
  }

  onCheckClick(event: Event) {
    event.stopPropagation();
  }

  onReset() {
    this.selected = [];
    this.isDisplayEmpty = true;
    this.isdropped = false;
    this.invalid = false;
    this.all.forEach(item => item.checked = false);
  }
}
