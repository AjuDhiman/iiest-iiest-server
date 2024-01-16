import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { faEye, faPencil, faTrash, faEnvelope, faXmark, faCheck, faFileCsv, faFilePdf, faMagnifyingGlass, faLocationPin } from '@fortawesome/free-solid-svg-icons';
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
import { EmploymentComponent } from '../employment/employment.component';
import { ViewEmployeeComponent } from '../view-employee/view-employee.component';

@Component({
  selector: 'app-employeelist',
  templateUrl: './employeelist.component.html',
  styleUrls: ['./employeelist.component.scss']
})
export class EmployeelistComponent implements OnInit {
  @Output() isEditRecord = new EventEmitter();
  @Select(EmployeeState.GetEmployeeList) employees$:Observable<Employee>;
  @Select(EmployeeState.employeeLoaded) employeeLoaded$:Observable<boolean>
  empLoadedSub:Subscription;
  allEmployees: any;
  filteredEmployees: any;
  searchQuery: string = '';
  selectedFilter: string = 'byName';
  pageNumber: number = 1;
  isSearch: boolean = false;
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
 
  
  constructor( 
    private _utililitesService: UtilitiesService,
    private registerService: RegisterService,
    private store:Store,
    private _toastrService : ToastrService,
    private papa: Papa,
    private fileSaverService: FileSaverService,
    private modalService: NgbModal) {
  }

  ngOnInit(): void {
    this.fetchAllEmployees();
  }

  fetchAllEmployees(): void {
    this.allEmployees = this._utililitesService.getData();
    this.filter();
    console.log(this.allEmployees);
    if(this.allEmployees.length === 0){
        this.getEmployees();
        this.employees$.subscribe(res => {
          this.allEmployees = res;
          this.filter();
        })
    }
  }

  filter(): void {
    if (!this.searchQuery) {
      this.isSearch =false;
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

  onSearchChange(): void{
    this.pageNumber = 1;
    this.isSearch = true;
    this.filter();
  }

  onTableDataChange(event: any) {
    this.pageNumber = event;
    this.filter();
  }
  //Export To CSV
  exportToCsv() {
    const csvData = this.papa.unparse(this.filteredEmployees, {header: true})

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });

    this.fileSaverService.save(blob, 'employeelist.csv');
  }

  getEmployees(){
   this.empLoadedSub = this.employeeLoaded$.subscribe(loadedEmployee =>{
       if(!loadedEmployee){
         this.store.dispatch(new GetEmployee());
       }
     })
   }
   
   editRecord(res:any): void{
    console.log(res);
    var data = {
      isEditMode: true,
      Record: res
    }
    this.isEditRecord.emit(data);
   }

   deleteEmployee(objId: string): void{
      const loggedInUserData: any = this.registerService.LoggedInUserData();
      const parsedData = JSON.parse(loggedInUserData);
      const deletedBy = `${parsedData.employee_name}(${parsedData.employee_id})`;
      this.registerService.deleteEmployee(objId, deletedBy).subscribe({
        next: (res) =>{
        if(res.success){
          this.store.dispatch(new DeleteEmployee(objId))
          this._toastrService.success('Record Edited Successfully', res.message);
        }else{
          this._toastrService.success('Message Error!', res.message);
        }
      },
        error: (err) =>{
        let errorObj = err.error;
        if(errorObj.userError){
          this.registerService.signout();
        }
      }})
   }

   allocate(res:any, type:string){
    const modalRef = this.modalService.open(EmploymentComponent, { size: type==='manager'?'md':'lg', backdrop: 'static' });
      modalRef.componentInstance.employee = res;
      modalRef.componentInstance.type = type;

      if(type==='manager'){
        let allManagers = this.allEmployees
        .filter((emp: any) => emp.designation.toLowerCase().includes('manager'))
        .map((emp:any) => {
          return {
            name:emp.employee_name,
            emp_id:emp.employee_id
          }
        });
        console.log(allManagers);
        modalRef.componentInstance.allManagers = allManagers;
      }
  }

    //View Employee Details
    viewEmployeeDetails(res:any){
      const modalRef = this.modalService.open(ViewEmployeeComponent, { size: 'lg', backdrop: 'static' });
      console.log(res);
        modalRef.componentInstance.employee = res;
    }
}
