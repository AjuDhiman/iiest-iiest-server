import { Component, OnInit, ViewChild } from '@angular/core';
import { faCircleCheck, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute } from '@angular/router';
import { GeneralSectionComponent } from './general-section/general-section.component';

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
  salesDate: string;

  @ViewChild(GeneralSectionComponent) generalsec: GeneralSectionComponent;

  constructor(
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.candidateId = this.activatedRoute.snapshot.params['id'];
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

   // this methord catch enrollment ststus from Enrollment section which we will pass in Attendance section
  getEnrolledStatus($event: boolean){
    this.enrolledStatus = $event;
  }
}
