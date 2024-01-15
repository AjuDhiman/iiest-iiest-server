import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { faIndianRupeeSign } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-view-employee',
  templateUrl: './view-employee.component.html',
  styleUrls: ['./view-employee.component.scss']
})
export class ViewEmployeeComponent implements OnInit {
  @Input() public employee: any;
  fulladdress: any;
  allocatedArea: string;
  faIndianRupeeSign = faIndianRupeeSign;
  constructor(public activeModal: NgbActiveModal) {

  }

  ngOnInit(): void {
    // this.fulladdress = this.employee.address+", "+this.employee.city+", "+ this.employee.state+", "
    // +", Pincode: "+ this.employee.zip_code+", "+ this.employee.country;
    console.log(this.employee);
  }

  getFormatedDate(date: string): string {
    const originalDate = new Date(date);
    const year = originalDate.getFullYear();
    const month = String(originalDate.getMonth() + 1).padStart(2, '0');
    const day = String(originalDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate
  }
}
