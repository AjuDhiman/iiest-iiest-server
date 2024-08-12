import { Component, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-conformation-modal',
  templateUrl: './conformation-modal.component.html',
  styleUrls: ['./conformation-modal.component.scss']
})
export class ConformationModalComponent {

  action: string  = ''
  confirmationText: string = '';
  isTextMatches: boolean = false;

  actionFunc: EventEmitter<boolean> = new EventEmitter<boolean>;

  constructor(public activeModal: NgbActiveModal){
    
  }

  //methord runs on input changes for echeck ing if input text matches the confirmation text
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
      this.actionFunc.emit(this.isTextMatches);
      this.activeModal.close();
    }
  }

  //methord handles modal closure
  closeModel(){
    //returning false in case of closing the modal
    this.actionFunc.emit(false);
    this.activeModal.dismiss();
  }
}
