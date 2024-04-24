import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';
import { IconDefinition, faIndianRupeeSign } from '@fortawesome/free-solid-svg-icons';
import { DepartmentListComponent } from 'src/app/pages/modals/department-list/department-list.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-stat-cards',
  templateUrl: './stat-cards.component.html',
  styleUrls: ['./stat-cards.component.scss']
})
export class StatCardsComponent implements OnInit {
  departmentAndCount: Array<{ department: string, count: string, active: string, inactive: string }>
  department: string = '';
  salesData: any;
  faIndianRupeeSign: IconDefinition = faIndianRupeeSign;

  @Output() emitDeptCount: EventEmitter<any> = new EventEmitter<any>


  constructor(private _getDataService:GetdataService,
    private _registerService:RegisterService,
    private _toastrService: ToastrService,
    private modalService: NgbModal){
  }

  ngOnInit(): void {
    this.getEmployeeCountByDept()
    this.getUserRecord()

    let loggedInUserData: any = this._registerService.LoggedInUserData();
    loggedInUserData = JSON.parse(loggedInUserData)
    this.department = loggedInUserData.department;
  }

  getUserRecord():void {
    this._getDataService.getUserRecord().subscribe({
      next: (res) => {
        console.log(res);
        this.salesData = res[0];
      }
    })
  }

  getEmployeeCountByDept(): void{
    this._getDataService.getEmpCount().subscribe({
      next : res =>{
        let departmentArr=res.employeeGroupCount;
        this.departmentAndCount=departmentArr.map((elem:any) => {
          return{
            department:elem._id.department,
            count:elem.count,
            active:elem.active,
            inactive:elem.inactive
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

  viewDepartmentData(res:any): void{
    const modalRef = this.modalService.open(DepartmentListComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.department = res;
  }

  changeNameFormat(str:any): string {
    let updatedStr: string =  str.toLocaleLowerCase().split(" ").join('_');
    updatedStr = updatedStr.replace('&', 'and');
    return updatedStr;
  }

}