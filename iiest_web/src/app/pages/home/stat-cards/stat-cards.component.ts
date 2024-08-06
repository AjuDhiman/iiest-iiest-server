import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';
import { IconDefinition, faIndianRupeeSign } from '@fortawesome/free-solid-svg-icons';
import { DepartmentListComponent } from 'src/app/pages/modals/department-list/department-list.component';
import { ToastrService } from 'ngx-toastr';
import { director_roles, Months } from 'src/app/utils/config';

@Component({
  selector: 'app-stat-cards',
  templateUrl: './stat-cards.component.html',
  styleUrls: ['./stat-cards.component.scss']
})
export class StatCardsComponent implements OnInit {
  departmentAndCount: Array<{ department: string, count: string, active: string, inactive: string }>
  department: string = '';
  designation: string = '';
  salesData: any;
  ticketData: any;
  faIndianRupeeSign: IconDefinition = faIndianRupeeSign;
  Months: string[] = Months; // this var is comming from config.ts and it is a array of all months 
  thisMonth: String = Months[new Date().getMonth()];
  prevMonth: String = Months[new Date().getMonth() - 1];

  //director roles
  directorRoles: string[] = director_roles;

  @Output() emitDeptCount: EventEmitter<any> = new EventEmitter<any>


  constructor(private _getDataService: GetdataService,
    private _registerService: RegisterService,
    private _toastrService: ToastrService,
    private modalService: NgbModal) {
  }

  ngOnInit(): void {
    this.getEmployeeCountByDept()
    this.getUserRecord()

    let loggedInUserData: any = this._registerService.LoggedInUserData();
    loggedInUserData = JSON.parse(loggedInUserData)
    this.department = loggedInUserData.department;
    this.designation = loggedInUserData.designation;

  }

  //methord for getting statcards aggregated data from backend
  getUserRecord(): void {

    this._getDataService.getUserRecord().subscribe({
      next: (res) => {
        this.salesData = res[0];
      }
    });

    // this._getDataService.getTicketVerificationData().subscribe({
    //   next: res => {
    //     this.ticketData = res[0];
    //     console.log(this.ticketData)
    //   }
    // })
  }

  //methord for getting aggregated data of employee and their count
  getEmployeeCountByDept(): void {
    this._getDataService.getEmpCount().subscribe({
      next: res => {
        let departmentArr = res.employeeGroupCount;
        this.departmentAndCount = departmentArr.map((elem: any) => {
          return {
            department: elem._id.department,
            count: elem.count,
            active: elem.active,
            inactive: elem.inactive
          }
        });
        this.departmentAndCount = this.departmentAndCount.sort((a: any, b: any) => a.department > b.department ? 1 : -1);
        this.emitDeptCount.emit(this.departmentAndCount);
      },
      error: err => {
        this._toastrService.error(err.error.message);
      }
    })
  }

  //methord for viewinhg department data 
  viewDepartmentData(res: any): void {
    const modalRef = this.modalService.open(DepartmentListComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.department = res;
  }

  //methotd for correcting names
  changeNameFormat(str: any): string {
    let updatedStr: string = str.toLocaleLowerCase().split(" ").join('_');
    updatedStr = updatedStr.replace('&', 'and');
    return updatedStr;
    
  }

}