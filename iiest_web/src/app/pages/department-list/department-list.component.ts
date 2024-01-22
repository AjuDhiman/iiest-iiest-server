import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { GetdataService } from 'src/app/services/getdata.service';

@Component({
  selector: 'app-department-list',
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.scss']
})
export class DepartmentListComponent implements OnInit{
  employees:any;
  department:string;
  employeeList:any;
  pageNumber:number=1;
  showPagination:boolean=true;
  constructor(public activeModal:NgbActiveModal,
              private _getDataService: GetdataService){

  }

  ngOnInit(): void {
    this.getDepartmentdata();
  }

  getDepartmentdata(){
    this._getDataService.getEmpCountDeptWise(this.department).subscribe({
        next: res=> {
          console.log(res);
          this.employeeList=res.employeeList;
        }
    })
  }

  onTableDataChange(event: any) {
    this.pageNumber = event;
  }
}
