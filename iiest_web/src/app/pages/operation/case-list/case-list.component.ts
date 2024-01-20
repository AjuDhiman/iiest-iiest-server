import { Component } from '@angular/core';
import { faFileCsv, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { ExportAsConfig, ExportAsService } from 'ngx-export-as';

@Component({
  selector: 'app-case-list',
  templateUrl: './case-list.component.html',
  styleUrls: ['./case-list.component.scss']
})
export class CaseListComponent {
  filteredData:any;
  isSearch:boolean;
  searchQuery:string;
  selectedFilter:string;
  pageNumber:number=1;
  faMagnifyingGlass=faMagnifyingGlass;
  faFileCsv=faFileCsv;

  constructor(private exportAsService: ExportAsService){

  }
  
  //Export To CSV
  exportToCsv(): void {
    const options: ExportAsConfig = {
      type: 'csv',
      elementIdOrContent: 'data-to-export',
    };

    this.exportAsService.save(options, 'table_data').subscribe(() => {
    });
  }

  onSearchChange(){

  }

  onTableDataChange($event:any){

  }

}
