import { Component, OnInit } from '@angular/core';
import { GetdataService } from 'src/app/services/getdata.service';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-operationform',
  templateUrl: './operationform.component.html',
  styleUrls: ['./operationform.component.scss']
})
export class OperationformComponent implements OnInit{
  recipientId:string;

  constructor(private _utilityService:UtilitiesService, 
              private getDataService: GetdataService){
  }

  ngOnInit(): void {
    this.recipientId=this._utilityService.getOperationRecpId();
    this.getDataService.getMoreCaseInfo(this.recipientId).subscribe({
      next: (res)=>{
        console.log(res.moreInfo);
      }
    })
  }
}
