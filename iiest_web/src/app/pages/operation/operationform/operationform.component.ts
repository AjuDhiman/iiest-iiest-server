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
  candidateId: string;
  verifiedDataId: string;
  enrolledDataId: string;
  verifiedStatus: boolean;
  enrolledStatus: boolean
  salesDate: string;

  @ViewChild(GeneralSectionComponent) generalsec: GeneralSectionComponent;

  constructor(
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.candidateId = this.activatedRoute.snapshot.params['id'];
  }

  getVerifiedDataId($event: string) {
    this.verifiedDataId = $event;
  }

  getEnrolledDataId($event: string) {
    this.enrolledDataId = $event;
  }

  getSalesData($event: string) {
    this.salesDate = $event;
  }

  getVerifiedStatus($event: boolean) {
    this.verifiedStatus = $event
  }

  getEnrolledStatus($event: boolean){
    this.enrolledStatus = $event;
  }
}
