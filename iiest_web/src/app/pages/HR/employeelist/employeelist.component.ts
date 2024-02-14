import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { faEye, faPencil, faTrash, faEnvelope, faXmark, faCheck, faFileCsv, faFilePdf, faMagnifyingGlass, faLocationPin, faCopy } from '@fortawesome/free-solid-svg-icons';
import { UtilitiesService } from 'src/app/services/utilities.service'
import { EmployeeState } from 'src/app/store/state/employee.state';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { Employee } from 'src/app/utils/registerinterface';
import { DeleteEmployee, GetEmployee } from 'src/app/store/actions/employee.action';
import { RegisterService } from 'src/app/services/register.service';
import { ToastrService } from 'ngx-toastr';
import { Papa } from 'ngx-papaparse';
import { FileSaverService } from 'ngx-filesaver'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ViewEmployeeComponent } from '../../modals/view-employee/view-employee.component';
import { EmploymentComponent } from '../../modals/employment/employment.component';

@Component({
  selector: 'app-employeelist',
  templateUrl: './employeelist.component.html',
  styleUrls: ['./employeelist.component.scss']
})
export class EmployeelistComponent implements OnInit {

  //store related variables
  @Select(EmployeeState.GetEmployeeList) employees$: Observable<Employee>;
  @Select(EmployeeState.employeeLoaded) employeeLoaded$: Observable<boolean>
  empLoadedSub: Subscription;

  //employee list table related variables
  allEmployees: any;
  filteredEmployees: any;
  searchQuery: string = '';
  selectedFilter: string = 'byName';
  pageNumber: number = 1;
  isSearch: boolean = false;
  itemsNumber: number = 10;

  //icons
  faEye = faEye;
  faPencil = faPencil;
  faTrash = faTrash;
  faEnvelope = faEnvelope;
  faXmark = faXmark;
  faCheck = faCheck;
  faFileCsv = faFileCsv;
  faFilePdf = faFilePdf;
  faMagnifyingGlass = faMagnifyingGlass;
  faLocationPin = faLocationPin;
  faCopy = faCopy;

  //output event emitters
  @Output() isEditRecord = new EventEmitter();

  constructor(
    private _utililitesService: UtilitiesService,
    private registerService: RegisterService,
    private store: Store,
    private _toastrService: ToastrService,
    private papa: Papa,
    private fileSaverService: FileSaverService,
    private modalService: NgbModal,
  ) {
  }

  ngOnInit(): void {
    this.fetchAllEmployees();
  }

  // this methord fetches the list of all employees from ngrx store
  fetchAllEmployees(): void {
    this.allEmployees = this._utililitesService.getData();
    this.filter();
    if (this.allEmployees.length === 0) {
      this.getEmployees();
      this.employees$.subscribe(res => {
        this.allEmployees = res;
        this.filter();
      });
    }
  }

  //this methord filter the table data on the basis of search query and selected search filter
  filter(): void {
    if (!this.searchQuery) {
      this.isSearch = false;
      this.filteredEmployees = this.allEmployees;
    } else {
      switch (this.selectedFilter) {
        case 'byName': this.filteredEmployees = this.allEmployees.filter((emp: any) => emp.employee_name.toLowerCase().includes(this.searchQuery.toLowerCase()))
          break;
        case 'byEMail': this.filteredEmployees = this.allEmployees.filter((emp: any) => emp.email.toLowerCase().includes(this.searchQuery.toLowerCase()))
          break;
        case 'byEmpId': this.filteredEmployees = this.allEmployees.filter((emp: any) => emp.employee_id.toLowerCase().includes(this.searchQuery.toLowerCase()))
          break;
        case 'byContact': this.filteredEmployees = this.allEmployees.filter((emp: any) => emp.contact_no.toString().includes(this.searchQuery.toString()))
          break;
        case 'byLocation': this.filteredEmployees = this.allEmployees.filter((emp: any) => emp.state.toLowerCase().includes(this.searchQuery.toString()))
          break;
      }
    }
  }

  //this method sets the table configuration on the basis of search change
  onSearchChange(): void {
    this.pageNumber = 1;
    this.isSearch = true;
    this.filter();
  }

  //this method sets the table configuration on the basis pagination change
  onPageChange(event: any): void {
    this.pageNumber = event;
    this.filter();
  }

  //Export To CSV
  exportToCsv(): void {
    const csvData = this.papa.unparse(this.filteredEmployees, { header: true })

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });

    this.fileSaverService.save(blob, 'employeelist.csv');
  }

  //this methord manages the state of ngrx store
  getEmployees(): void {
    this.empLoadedSub = this.employeeLoaded$.subscribe(loadedEmployee => {
      if (!loadedEmployee) {
        this.store.dispatch(new GetEmployee());
      }
    })
  }

  //this methord emits the data from from employee list component to emp register component in case of edit record
  editRecord(res: any): void {
    var data = {
      isEditMode: true,
      Record: res
    }
    this.isEditRecord.emit(data);
  }

  //methord for deleting employee from our record and calling the api for sending updatingemployee in past employee schema
  deleteEmployee(objId: string): void {
    const loggedInUserData: any = this.registerService.LoggedInUserData();
    const parsedData = JSON.parse(loggedInUserData);
    const deletedBy = `${parsedData.employee_name}(${parsedData.employee_id})`;
    this.registerService.deleteEmployee(objId, deletedBy).subscribe({
      next: (res): void => {
        if (res.success) {
          this.store.dispatch(new DeleteEmployee(objId))
          this._toastrService.success('Record Edited Successfully', res.message);
        } else {
          this._toastrService.success('Message Error!', res.message);
        }
      },
      error: (err) : void => {
        let errorObj = err.error;
        if (errorObj.userError) {
          this.registerService.signout();
        } else if (errorObj.deleteEmpErr) {
          this._toastrService.error('', 'Some error occured. Please try again')
        }
      }
    })
  }

  //methord for area allocation of a employee
  allocate(res: any, type: string): void {
    const modalRef = this.modalService.open(EmploymentComponent, { size: type === 'manager' ? 'md' : 'lg', backdrop: 'static' });
    modalRef.componentInstance.employee = res;
    modalRef.componentInstance.type = type;

    if (type === 'manager') {
      let allManagers = this.allEmployees
        .filter((emp: any) => 
          emp.designation.toLowerCase().includes('manager'))
        .map((emp: any) => {
          return {
            _id: emp._id,
            name: emp.employee_name,
            emp_id: emp.employee_id,
          }
        });
      modalRef.componentInstance.allManagers = allManagers;
    }
  }

  //this methord will notify us in case of copy text event in employee table 
  copyNotification() :void {
    this._toastrService.success('Text Copied');
  }

  //View Employee Details
  viewEmployeeDetails(res: any): void {
    const modalRef = this.modalService.open(ViewEmployeeComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.employee = res;
  }
}
