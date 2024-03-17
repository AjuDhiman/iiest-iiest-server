import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faEye, faPen, faSave } from '@fortawesome/free-solid-svg-icons';
import { GetdataService } from 'src/app/services/getdata.service';
import { delhiTrainingLocations } from 'src/app/utils/config';

@Component({
  selector: 'app-batch-list',
  templateUrl: './batch-list.component.html',
  styleUrls: ['./batch-list.component.scss']
})
export class BatchListComponent implements OnInit{
  panelType: string;
  serviceType: string = 'Retail';
  activeTab: string = 'Delhi';
  filteredData: any = [{
    batch_no: 1,
    training_date: '4th Mar 2024',
    recipient_no: 20
  }];
  delhiTrainingLoactions = delhiTrainingLocations;
  totalCount: number = 1;

  batchData: any;

  editMode: boolean = false;

  faEye: IconDefinition = faEye;
  faPen: IconDefinition = faPen;
  faSave: IconDefinition = faSave;

  // table related vars
  pageNumber: number = 1;
  itemsNumber: number = 1;
  showPagination: boolean = true;

  constructor(private router: Router,
    private _getDataService: GetdataService) {
  }

  ngOnInit(): void {
    this.getCases()
  }

  toogleTabs(tab: string) {
    this.activeTab = tab;
  }

  setServiceType(type: string){
    this.serviceType=type;
  }

  onTableDataChange($event:any) {

  }

  getCases(){
    this._getDataService.getBatchListData().subscribe({
      next: res => {
        console.log(res);
        this.batchData = res.batches
                        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        this.filteredData = this.batchData;
      }
    })
  }

  showCaseList(res: any){
    this.router.navigate(['/caselist'], {state:{batchData: res, forTraining: true}});
  }

}
