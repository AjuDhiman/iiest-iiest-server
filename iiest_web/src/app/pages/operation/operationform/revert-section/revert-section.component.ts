import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { faCircleCheck, faCircleExclamation, faFileArrowUp } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-revert-section',
  templateUrl: './revert-section.component.html',
  styleUrls: ['./revert-section.component.scss']
})
export class RevertSectionComponent {

  completedStatus: boolean = false;

  faCircleCheck = faCircleCheck;

  faCircleExclamation = faCircleExclamation;

  faFileArrowUp = faFileArrowUp;

  revertForm: FormGroup = new FormGroup({
    
  });

  onUpdate(){

  }
}
