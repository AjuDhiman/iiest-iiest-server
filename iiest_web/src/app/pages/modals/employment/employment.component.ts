import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
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

  @Input() employee: any;
  @Input() type: any;

  allManagers:any[] = [] 

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
    this.registerService.registerArea(this.employee._id, this.areaAllocationForm.value).subscribe({
      next: (res)=>{
        if(res.success){
          this.toasterService.success('', 'Area Allocated Successfully');
        }
      },
      error: (err)=>{
        let errorObj = err.error;
        if(errorObj.userError){
          this.registerService.signout();
        }else if(errorObj.existingAreaErr){
          this.toasterService.error('', 'Area Already Allocated');
        }
      }
    });
  }

  onManagerAssignment(){
    this.submitted = true;
    console.log(this.reportingManagerForm.value);
    this.registerService.assignManager(this.employee._id, this.reportingManagerForm.value).subscribe({
      next: res => {
        this.toasterService.success('', 'Manager assigned sucessfully');
      },
      error: (err)=>{
        let errorObj = err.error;
        if(errorObj.userError){
          this.registerService.signout();
        }else if(errorObj.existingManagerErr){
          this.toasterService.error('', 'manager Already Assigned');
        }
      }
    })

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

  getNameWithID():string{
    let manager = this.allManagers
    .find(item => item.name===this.managerForm['reportingManager'].value);
    if(!manager){
      return '';
    }
    return `${manager?.name}(${manager?.emp_id})`
  }
}
