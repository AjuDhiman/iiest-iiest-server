import { Component, OnInit } from '@angular/core';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-operationform',
  templateUrl: './operationform.component.html',
  styleUrls: ['./operationform.component.scss']
})
export class OperationformComponent implements OnInit{
  recipientId:string;

  constructor(private _utilityService:UtilitiesService){
  }

  ngOnInit(): void {
    this.recipientId=this._utilityService.getOperationRecpId();
    console.log(this.recipientId);
  }
}
