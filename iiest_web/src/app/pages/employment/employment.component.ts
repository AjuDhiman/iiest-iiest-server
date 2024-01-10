import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
// import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GetdataService } from 'src/app/services/getdata.service';
import { MultiSelectComponent } from 'src/app/shared/multi-select/multi-select.component';
import { stateName } from 'src/app/utils/config'
import { ActivatedRoute } from '@angular/router';

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

  employee: any;
  type: any;

  areaAllocationForm: FormGroup = new FormGroup({
    state: new FormControl(''),
    district: new FormControl(''),
    pincodes: new FormControl([])
  });

  reportingManagerForm: FormGroup = new FormGroup({
     reportingManager: new FormControl('')
  });

  constructor(
    // public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private _getdataService: GetdataService,
    private route: ActivatedRoute) {
      this.route.params.subscribe(params => {
        this.type= params['type']; 
      });
      console.log(this.type);
  }

  ngOnInit(): void {
    if (this.type === 'area') {
      this.areaAllocationForm = this.formBuilder.group(
        {
          state: ['', Validators.required],
          district: ['', Validators.required],
          pincodes: [[], Validators.required],
        });
    }
    else if(this.type === 'manager') {
      this.reportingManagerForm = this.formBuilder.group(
        {
          reportingManager: ['', Validators.required],
        });
    }
  }

  get form(): { [key: string]: AbstractControl } {
    return this.areaAllocationForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    console.log(this.areaAllocationForm);
    console.log(this.reportingManagerForm);
  }

// this function will fetch the array of distinct districsts onbased of state select
  onStateSelect($event: any) { 
    this.state = $event.target.value;
    this.districts=[];
    this.pincodes=[];
    this.multiSelect.onReset();
    this._getdataService.getPincodesData(this.state).subscribe({
      next: (res) => {
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
  onDistrictSelect($event: any) {
    this.pincodes=[];
    this.multiSelect.onReset();
    this.district = $event.target.value;
    this.pincodes = this.pincodesData
      .filter((item: any) => item.State === this.state && item.District === this.district)
      .map((item: any) => item.Pincode);
  }

  getPincodes(event: any) {
    this.form['pincodes'].setValue(event)
  }
}
