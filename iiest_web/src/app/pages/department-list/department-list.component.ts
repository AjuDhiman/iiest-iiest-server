import { Component, OnInit } from '@angular/core';
import { faMagnifyingGlass, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { GetdataService } from 'src/app/services/getdata.service';

@Component({
  selector: 'app-department-list',
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.scss']
})
export class DepartmentListComponent implements OnInit {
  employees: any;
  department: string;
  employeeList: any;
  pageNumber: number = 1;
  itemsNumber: number = 10;
  searchQuery: string;
  selectedFilter: string = 'byEmployeeName';
  showPagination: boolean = false;
  faMagnifyingGlass = faMagnifyingGlass
  isSearch: boolean = false;
  filteredData: any;
  faXmark = faXmark;
  faCheck = faCheck;
  constructor(public activeModal: NgbActiveModal,
    private _getDataService: GetdataService) {

  }

  ngOnInit(): void {
    this.getDepartmentdata();
  }

  getDepartmentdata() {
    this._getDataService.getEmpCountDeptWise(this.department).subscribe({
<<<<<<< HEAD
      next: res => {
        console.log(res);
        this.employeeList = res.employeeList.map((elem: any, index: number) => {
          if (elem.status === true) {
            return { ...elem, serialNumber: index + 1 };
          } else {
            return null;
          }
        }).filter((value: any) => value !== null);
        this.filteredData = this.employeeList;
        this.showPagination = true;
      }
=======
        next: res=> {
          this.employeeList=res.employeeList.map((elem:any, index:number) => {
            return {...elem, serialNumber:index+1}
          });
          this.filteredData=this.employeeList;
          this.showPagination=true;
        }
>>>>>>> d8a0147dca8398f31a57e72afbde94c821b261b8
    })
  }

  // getDepartmentdata(){
  //   this._getDataService.getEmpCountDeptWise(this.department).subscribe({
  //       next: res=> {
  //         console.log(res);
  //         this.employeeList=res.employeeList.map((elem:any, index:number) => {
  //           return {...elem, serialNumber:index+1}
  //         });
  //         this.filteredData=this.employeeList;
  //         this.showPagination=true;
  //       }
  //   })
  // }

  onSearchChange() {
    if (this.searchQuery) {
      this.pageNumber = 1;
      this.isSearch = true;
      this.filter();
    }
    else {
      this.isSearch = false;
      this.filteredData = this.employeeList;
    }
  }

  onTableDataChange(event: any) {
    this.pageNumber = event;
  }

  filter(): void {
    if (this.searchQuery === '') {
      this.filteredData = this.employeeList;
    } else {
      switch (this.selectedFilter) {
        case 'byEmployeeName': this.filteredData = this.employeeList.filter((elem: any) => elem.employee_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
          break;
        case 'byState': this.filteredData = this.employeeList.filter((elem: any) => elem.state.toLowerCase().includes(this.searchQuery.toLowerCase()));
          break;
      }
    }
    this.filteredData.length ? this.showPagination = true : this.showPagination = false;
  }
}
