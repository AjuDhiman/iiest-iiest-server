import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { faIndianRupeeSign } from '@fortawesome/free-solid-svg-icons';
import { GetdataService } from 'src/app/services/getdata.service';

@Component({
  selector: 'app-view-employee',
  templateUrl: './view-employee.component.html',
  styleUrls: ['./view-employee.component.scss']
})
export class ViewEmployeeComponent implements OnInit {
  @Input() public employee: any;
  fulladdress: any;
  allocatedState: string;
  allocatedDistrict: string;
  allocatedPincodes: [];
  faIndianRupeeSign = faIndianRupeeSign;
  userImage: string;
  constructor(public activeModal: NgbActiveModal, 
  private getDataService: GetdataService
  ) {

  }

  ngOnInit(): void {
    // this.fulladdress = this.employee.address+", "+this.employee.city+", "+ this.employee.state+", "
    // +", Pincode: "+ this.employee.zip_code+", "+ this.employee.country;
    console.log(this.employee);
    this.getAllocatedAreas();
  }

  getFormatedDate(date: string): string {
    const originalDate = new Date(date);
    const year = originalDate.getFullYear();
    const month = String(originalDate.getMonth() + 1).padStart(2, '0');
    const day = String(originalDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate
  }

  getAllocatedAreas(){
    this.getDataService.getAllocatedAreas(this.employee._id).subscribe({
      next: (res)=>{
        console.log(res)
        this.allocatedState = res.allocatedPincodes.state;
        this.allocatedDistrict = res.allocatedPincodes.district;
        this.allocatedPincodes = res.allocatedPincodes.pincodes;
      }
    })
  }

  getUserImage(){
    let userImageId = this.employee.employeeImage
    this.getDataService.getUserImage(userImageId).subscribe({
      next: (res)=>{
        this.userImage = res.imageConverted;
      }
    })
  }
}
