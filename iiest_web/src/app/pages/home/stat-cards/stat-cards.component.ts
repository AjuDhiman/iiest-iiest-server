import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GetdataService } from 'src/app/services/getdata.service';
import { DepartmentListComponent } from '../../department-list/department-list.component';
import { RegisterService } from 'src/app/services/register.service';
import { faIndianRupeeSign } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-stat-cards',
  templateUrl: './stat-cards.component.html',
  styleUrls: ['./stat-cards.component.scss']
})
export class StatCardsComponent implements OnInit{
  departmentAndCount:Array<{department:string, count:string}>
  department:string='';
  overallSalesCount:number;
  approvedSalesCount:number;
  pendingSalesCount:number;
  userApprovedSales:number;
  userPendingSales:number;
  userTotalSales:number;
  faIndianRupeeSign = faIndianRupeeSign;


  constructor(private _getDataService:GetdataService,
    private _registerService:RegisterService,
    private modalService: NgbModal){
  }

  ngOnInit(): void {
    this.getEmployeeCountByDept()
    this.getUserRecord()

    let loggedInUserData: any = this._registerService.LoggedInUserData();
    loggedInUserData = JSON.parse(loggedInUserData)
    this.department = loggedInUserData.department;
  }

  getUserRecord() {
    this._getDataService.getUserRecord().subscribe({
      next: (res) => {
        this.userTotalSales = res.overAllSales;
        this.userPendingSales = res.pendingSales;
        this.userApprovedSales = res.approvedSales;
        this.pendingSalesCount = res.pendingSalesCount;
        this.approvedSalesCount = res.approvedSalesCount;
        this.overallSalesCount = res.overallSalesCount;
      }
    })
  }

  getEmployeeCountByDept(){
    this._getDataService.getEmpCount().subscribe({
      next : res =>{
        let departmentArr=res.employeeGroupCount;
        this.departmentAndCount=departmentArr.map((elem:any) => {
          return{
            department:elem._id.department,
            count:elem.count
          }
        });
        this.departmentAndCount = this.departmentAndCount.sort((a: any, b: any)=> a.department > b.department ? 1 : -1)
      },
      error: err => {

      }
      
    })
  }

  viewDepartmentData(res:any){
    const modalRef = this.modalService.open(DepartmentListComponent, { size: 'lg', backdrop: 'static' });
      modalRef.componentInstance.department = res;
  }

}
