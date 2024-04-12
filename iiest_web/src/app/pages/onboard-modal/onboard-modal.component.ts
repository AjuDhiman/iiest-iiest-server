import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-onboard-modal',
  templateUrl: './onboard-modal.component.html',
  styleUrls: ['./onboard-modal.component.scss']
})
export class OnboardModalComponent {

  constructor(public activeModal:NgbActiveModal) {
    
  }
}
