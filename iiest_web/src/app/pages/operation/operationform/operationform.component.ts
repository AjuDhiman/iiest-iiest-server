import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GeneralSectionComponent } from './general-section/general-section.component';
import { RegisterService } from 'src/app/services/register.service';

@Component({
  selector: 'app-operationform',
  templateUrl: './operationform.component.html',
  styleUrls: ['./operationform.component.scss']
})
export class OperationformComponent implements OnInit {
  //global variables 
  candidateId: string;
  verifiedDataId: string;
  enrolledDataId: string;
  verifiedStatus: boolean;
  enrolledStatus: boolean;
  attendanceStatus: boolean;
  salesDate: string;
  productType: string;
  conformationText: string;

  @ViewChild(GeneralSectionComponent) generalsec: GeneralSectionComponent;

  constructor(
    private activatedRoute: ActivatedRoute,
    private _registerService: RegisterService
  ) {
  }

  ngOnInit(): void {
    this.candidateId = this.activatedRoute.snapshot.params['id'];
    this.getUserProductType();
  }

  //this methord catch sales date from verification section which we will pass in enrollment section
  getSalesData($event: string) {
    this.salesDate = $event;
  }

  // this methord catch verification Id from verification section which we will pass in enrollment section
  getVerifiedDataId($event: string) {
    this.verifiedDataId = $event;
  }

  // this methord catch verification sataus from verification section which we will pass in enrollment section
  getVerifiedStatus($event: boolean) {
    this.verifiedStatus = $event
  }

  
  // this methord catch enrollment Id from Enrollment section which we will pass in Attendance section
  getEnrolledDataId($event: string) {
    this.enrolledDataId = $event;
  }

   // this methord catch enrollment status from Enrollment section which we will pass in Attendance section
  getEnrolledStatus($event: boolean){
    this.enrolledStatus = $event;
  }

  // this methord catch attendance status from section which we will pass in Attendance section
  getAttendanceStatus($event: boolean){
    this.attendanceStatus = $event;
  }

  getUserProductType(){
    let user:any = this._registerService.LoggedInUserData();
    let parsedUser = JSON.parse(user); 
    let panelType = parsedUser.panel_type;
    
    switch(panelType){
      case 'Fostac Panel':
        this.productType = 'Fostac'
        break;
      case 'Foscos Panel':
        this.productType = 'Foscos'
        break;
      case 'Hygiene Panel' :
        this.productType = 'Hygiene'
        break;
      default:
        this.productType = ''
    }
  }
}
