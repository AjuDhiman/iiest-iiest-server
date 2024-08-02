import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-view-cowork-sale',
  templateUrl: './view-cowork-sale.component.html',
  styleUrls: ['./view-cowork-sale.component.scss']
})
export class ViewCoworkSaleComponent {

  //vars
  data: any = []


  //constrctor
  constructor(public activeModal: NgbActiveModal) {

  }


  //methord change the view format ofthe invoice date in the table
  getFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    let suffix = "";
    if (day === 1 || day === 21 || day === 31) {
      suffix = "st";
    } else if (day === 2 || day === 22) {
      suffix = "nd";
    } else if (day === 3 || day === 23) {
      suffix = "rd";
    } else {
      suffix = "th";
    }
    return `${day}${suffix} ${month} ${year}`;
  }

}
