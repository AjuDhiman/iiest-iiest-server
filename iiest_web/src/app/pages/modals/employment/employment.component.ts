import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
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
  employeeId: string;
  pincodesData: Object[];

  // Area allocation form related variables
  state: string;
  district: string;
  statesList = stateName;
  districts: string[] = [];
  pincodes: number[] = [];
  allocationType: string;

  //reporting manager form relared variables
  empWithId: string = ''

  @ViewChild(MultiSelectComponent) multiSelect !: MultiSelectComponent;

  @Input() employee: any;
  @Input() type: any;

  allManagers: any[] = []

  areaAllocationForm: FormGroup = new FormGroup({
    state: new FormControl(''),
    district: new FormControl([]),
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

  onSubmit(): void {
    this.submitted = true;
    this.registerService.registerArea(this.employee._id, this.areaAllocationForm.value).subscribe({
      next: (res) => {
        if (res.success) {
          this.toasterService.success('', 'Area Allocated Successfully');
        }
      },
      error: (err) => {
        let errorObj = err.error;
        if (errorObj.userError) {
          this.registerService.signout();
        } else if (errorObj.existingAreaErr) {
          this.toasterService.error('', 'Area Already Allocated');
        }
      }
    });
  }

  onManangerSelect($event: any): void {
    let manager = this.allManagers.find((item: any) => item._id === $event.target.value);
    this.empWithId = `${manager.name}(${manager.emp_id})`;
  }

  onManagerAssignment(): void {
    this.submitted = true;
    this.registerService.assignManager(this.employee._id, this.reportingManagerForm.value).subscribe({
      next: res => {
        this.toasterService.success('', 'Manager assigned sucessfully');
      },
      error: (err) => {
        let errorObj = err.error;
        if (errorObj.userError) {
          this.registerService.signout();
        } else if (errorObj.existingManagerErr) {
          this.toasterService.error('', 'manager Already Assigned');
        }
      }
    })

  }

  // this function will fetch the array of distinct districsts onbased of state select
  onStateSelect($event: any): void {
    this.state = $event.target.value;
    this.areaForm['district'].setValue('');
    this.areaForm['pincodes'].setValue('');
    this.districts = [];
    this.pincodes = [];
    this.multiSelect.onReset();
    let distinctDistrict: any = [];
    this._getdataService.getPincodesData(this.state).subscribe({
      next: (res) => {
        this.pincodesData = res;
        console.log(this.pincodesData);
        this.pincodesData.forEach((obj: any) => {
          if (!(this.districts.find((item: any) => item.toLowerCase() === obj.District.toLowerCase()))) {
            distinctDistrict.push(obj);
          }
          this.districts = distinctDistrict
            .filter((item: any) => item.State === this.state)
            .map((item: any) => item.District);
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

  onDistrictSelect($event: any): void {
    this.areaForm['pincodes'].setValue('');
    this.areaForm['district'].setValue($event);
    this.pincodes = [];
    this.district = $event;
    $event.forEach((element: any) => {
      let pincodes = this.pincodesData
        .filter((item: any) => item.State === this.state && item.District === element)
        .map((item: any) => item.Pincode);

      this.pincodes.push(...pincodes);
    });
  }

  getPincodes(event: any): void { //used for multi select
    this.areaForm['pincodes'].setValue(event)
  }
}