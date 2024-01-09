import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GetdataService } from 'src/app/services/getdata.service';
import { MultiSelectComponent } from 'src/app/shared/multi-select/multi-select.component';
import { stateName } from 'src/app/utils/config'

@Component({
  selector: 'app-employment',
  templateUrl: './employment.component.html',
  styleUrls: ['./employment.component.scss']
})
export class EmploymentComponent implements OnInit {
  submitted: boolean;
  pincodesData: Object[];
  state: string;
  district: string;
  statesList=stateName;
  districts: string[] = [];
  pincodes: number[] = [] ;
  allocationType: string;
  @ViewChild(MultiSelectComponent) multiSelect !: MultiSelectComponent;

  @Input() public employee: any;
  @Input() public type: string;

  allocationForm: FormGroup = new FormGroup({
    underManager: new FormControl('', Validators.required),
    state: new FormControl('', Validators.required),
    district: new FormControl('', Validators.required),
    pincodes: new FormControl([], Validators.required)
  });



  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private _getdataService: GetdataService) {
    // this.getPincodesData();
  }

  ngOnInit(): void {
    if (this.type === 'area') {
      this.allocationForm = this.formBuilder.group(
        {
          state: ['', Validators.required],
          district: ['', Validators.required],
          pincodes: ['', Validators.required],
        });
    }
    else if(this.type === 'manager') {
      this.allocationForm = this.formBuilder.group(
        {
          reportingManager: ['', Validators.required],
        });
    }
  }

  get form(): { [key: string]: AbstractControl } {
    return this.allocationForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    console.log(this.allocationForm);
  }

  // getPincodesData() {  // this function retrives post data and save into variable by the help of getdataservice
    // this._getdataService.getPincodesData().subscribe({
    //   next: (res) => {
    //     console.log(res);
    //     this.pincodesData = res;
    //     this.pincodesData.forEach((obj: any) => {
    //       if (!this.states.find((item: any) => item === obj.state)) {
    //         this.states.push(obj.state);
    //       }
    //     })
    //     console.log(this.states);
    //   },
    //   error: (err) => {
    //     let errorObj = err.error
    //     // if (errorObj.userError) {
    //     //   this._registerService.signout();
    //     // }
    //   }
    // }
    // )
  // }


  onStateSelect($event: any) { // this function will fetch the array of distinct districsts onbased of state select
    // this.districts=[];
    // this.pincodes=[];
    // this.form['district'].setValue('');
    // this.form['pincodes'].setValue([]);
    // this.multiSelect.onReset();
    // //preceeding 5 lines will empty and reset the form fielsd on state reselect
    // this.state = event.target.value;
    // this.pincodesData.forEach((obj: any) => {
    //   if (!this.districts.find((item: any) => item === obj.district) && obj.state === this.state) {
    //     this.districts.push(obj.district);
    //   }
    // })
    console.log($event.target.value);
    this.state = $event.target.value;
    this.districts=[];
    this._getdataService.getPincodesData(this.state).subscribe({
      next: (res) => {
        console.log(res);
        this.pincodesData = res;
        this.pincodesData.forEach((obj:any)=>{
          if(!this.districts.find((item:any)=>item.toLowerCase()===obj.District.toLowerCase())){
            this.districts.push(obj.District);
          }
        })
      },
      error: (err) => {
        let errorObj = err.error
        // if (errorObj.userError) {
        //   this._registerService.signout();
        // }
      }
    }
    )
  }
  onDistrictSelect(event: any) {
    this.district = event.target.value;
    this.pincodes = this.pincodesData
      .filter((item: any) => item.state === this.state && item.district === this.district)
      .map((item: any) => item.pincode);
    console.log(this.pincodes);
  }

  getPincodes(event: any) {
    this.form['pincodes'].setValue(event)
  }
}
