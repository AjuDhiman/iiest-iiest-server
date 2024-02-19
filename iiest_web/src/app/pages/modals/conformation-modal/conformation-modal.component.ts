import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-conformation-modal',
  templateUrl: './conformation-modal.component.html',
  styleUrls: ['./conformation-modal.component.scss']
})
export class ConformationModalComponent {

  action: string  = ''

  confirmationText: string = '';

  actionFunc: any;

  isTextMatches: boolean = false;

  constructor(public activeModal: NgbActiveModal){
    
  }

  onInputChange($event:any){
    console.log($event.target.value);
    if($event.target.value === this.confirmationText){
      this.isTextMatches = true;
    } else {
      this.isTextMatches = false;
    }
  }

  onSubmit(){
    if(this.isTextMatches){
      this.actionFunc(this.isTextMatches);
      this.activeModal.close();
    }
  }
}
