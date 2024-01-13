import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GetdataService } from 'src/app/services/getdata.service';
import { MultiSelectComponent } from 'src/app/shared/multi-select/multi-select.component';
import { stateName } from 'src/app/utils/config'
import { ActivatedRoute } from '@angular/router';
import { RegisterService } from 'src/app/services/register.service';
import { ToastrService } from 'ngx-toastr';

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
  statesList = stateName;
  employeeId: string;
  districts: string[] = [];
  pincodes: number[] = [];
  allocationType: string;
  @ViewChild(MultiSelectComponent) multiSelect !: MultiSelectComponent;

  employee: any;
  type: any;
  //New variables for search box still in testing
  // isSearchEmpty: boolean;
  // searchSuggestions: any;
  allManagers = [
    {
      name: 'vansh',
      emp_id: 'IIEST/FD/7809'
    },
    {
      name: 'harsh',
      emp_id: 'IIEST/FD/9090'
    },
    {
      name: 'bhavesh',
      emp_id: 'IIEST/FD/9900'
    },
    {
      name: 'rndheer',
      emp_id: 'IIEST/FD/7890'
    },
    {
      name: 'Abhishake',
      emp_id: 'IIEST/FD/8908'
    }
  ] 

  areaAllocationForm: FormGroup = new FormGroup({
    state: new FormControl(''),
    district: new FormControl(''),
    pincodes: new FormControl([])
  });

  reportingManagerForm: FormGroup = new FormGroup({
    reportingManager: new FormControl('')
  });

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private _getdataService: GetdataService,
    private registerService: RegisterService,
    private toasterService: ToastrService,
    private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.type = params['type'];
    });
    console.log(this.type);
  }

  ngOnInit(): void {

    if (this.type === 'area') {
      this.areaAllocationForm = this.formBuilder.group(
        {
          state: ['', Validators.required],
          district: ['', Validators.required],
          pincodes: ['', Validators.required],
        });
    }
    else if (this.type === 'manager') {
      this.reportingManagerForm = this.formBuilder.group(
        {
          reportingManager: ['', Validators.required],
        });
    }
  }

  get areaForm(): { [key: string]: AbstractControl } {
    return this.areaAllocationForm.controls;
  }

  get managerForm(): { [key: string]: AbstractControl } {
    return this.reportingManagerForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    console.log(this.areaAllocationForm.value);
    console.log(this.reportingManagerForm);
    this.registerService.registerArea(this.employee._id, this.areaAllocationForm.value).subscribe({
      next: (res)=>{
        if(res.success){
          this.toasterService.success('', 'Area Allocated Successfully');
        }
      },
      error: (err)=>{
        let errorObj = err.error;
        console.log(errorObj)
        if(errorObj.userError){
          this.registerService.signout();
        }else if(errorObj.existingAreaErr){
          this.toasterService.error('', 'Area Already Allocated');
        }
      }
    });
  }

  // this function will fetch the array of distinct districsts onbased of state select
  onStateSelect($event: any) {
    this.state = $event.target.value;
    this.areaForm['district'].setValue('');
    this.areaForm['pincodes'].setValue('');
    this.districts = [];
    this.pincodes = [];
    this.multiSelect.onReset();
    this._getdataService.getPincodesData(this.state).subscribe({
      next: (res) => {
        this.pincodesData = res;
        this.pincodesData.forEach((obj: any) => {
          if (!this.districts.find((item: any) => item.toLowerCase() === obj.District.toLowerCase())) {
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
    this.areaForm['pincodes'].setValue('')
    this.pincodes = [];
    this.multiSelect.onReset();
    this.district = $event.target.value;
    this.pincodes = this.pincodesData
      .filter((item: any) => item.State === this.state && item.District === this.district)
      .map((item: any) => item.Pincode);
  }

  getPincodes(event: any) { //used for multi select
    this.areaForm['pincodes'].setValue(event)
  }

  selectManager(){

  }

  getNameWithID():string{
    let manager = this.allManagers
    .find(item => item.name===this.managerForm['reportingManager'].value);
    if(!manager){
      return '';
    }
    return `${manager?.name}(${manager?.emp_id})`
  }

  // filterSearch(event: any) {
  //   let value = event.target.value
  //   console.log(value);
  //   if (value !== '') {
  //     this.isSearchEmpty = false;
  //   }
  //   else {
  //     this.isSearchEmpty = true;
  //     return
  //   }
  //   let regex = new RegExp(value, "i") // i means case insesitive
  //   //using regex for comparing fbo names and customer ids
  //   this.searchSuggestions = this.allManagers.filter((obj: any) => regex.test(obj.fbo_name) || regex.test(obj.customer_id));
  //   console.log(this.searchSuggestions);
  // }
}
