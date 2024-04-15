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
  empCount: number;
  faXmark = faXmark;
  faCheck = faCheck;
  loading: boolean = false;
  dataNotAvilable: boolean = true;
  constructor(public activeModal: NgbActiveModal,
    private _getDataService: GetdataService) {

  }

  ngOnInit(): void {
    this.getDepartmentdata();
  }

  getDepartmentdata() {
    this.loading = true;
    this._getDataService.getEmpCountDeptWise(this.department).subscribe({
      next: res => {
        this.loading = false;
        this.employeeList = res.employeeList.map((elem: any, index: number) => {

          return { ...elem, serialNumber: index + 1 };
        }).filter((value: any) => value !== null);
        this.filteredData = this.employeeList;
        this.empCount = this.filteredData.length;
        if(this.empCount){
          this.dataNotAvilable = false;
        }
        this.showPagination = true;
      }, 
      error: err => {
        this.loading = false;
      }
    })
  }

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
    this.filteredData.length ? this.dataNotAvilable = false : this.dataNotAvilable = true;
  }
}
