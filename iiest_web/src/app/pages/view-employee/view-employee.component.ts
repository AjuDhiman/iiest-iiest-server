import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { faIndianRupeeSign } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-view-employee',
  templateUrl: './view-employee.component.html',
  styleUrls: ['./view-employee.component.scss']
})
export class ViewEmployeeComponent implements OnInit{
  @Input() public employee: any;
  fulladdress: any;
  faIndianRupeeSign = faIndianRupeeSign;
  constructor(public activeModal: NgbActiveModal) { 
    
  }

  ngOnInit(): void {
    // this.fulladdress = this.employee.address+", "+this.employee.city+", "+ this.employee.state+", "
    // +", Pincode: "+ this.employee.zip_code+", "+ this.employee.country;

    console.log(this.employee);
  }
}
