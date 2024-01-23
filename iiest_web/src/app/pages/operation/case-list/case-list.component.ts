import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { faFileCsv, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { ExportAsConfig, ExportAsService } from 'ngx-export-as';
import { GetdataService } from 'src/app/services/getdata.service';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-case-list',
  templateUrl: './case-list.component.html',
  styleUrls: ['./case-list.component.scss']
})
export class CaseListComponent implements OnInit {
  filteredData: any;
  isSearch: boolean = false;
  searchQuery: string;
  selectedFilter: string;
  itemsNumber: number = 25;
  pageNumber: number = 1;
  caseData: any;
  faMagnifyingGlass = faMagnifyingGlass;
  faFileCsv = faFileCsv;

  constructor(private exportAsService: ExportAsService,
    private _getDataService: GetdataService,
    private _utilityService: UtilitiesService,
    private router: Router) {

  }

  ngOnInit(): void {
    this.getCasedata()
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

  onSearchChange() {
    if(this.searchQuery){
      this.pageNumber = 1;
      this.isSearch = true;
      this.filter();
    }
    else{
      this.isSearch=false;
    }
  }

  onTableDataChange(event: any) {
    this.pageNumber = event;
  }

  getCasedata() {
    this._getDataService.getCaseList().subscribe({
      next: res => {
        this.caseData = res.caseList;
        this.filteredData=this.caseData;
      },
      error: err => {

      }
    })
  }

  //method for opening operation form
  collectResData(id: string) {
    this._utilityService.setOperationRecpId(id);
    this.router.navigate(['/operationform'])
  }

  filter(): void {
    if (!this.searchQuery) {
      this.filteredData = this.caseData;
    } else {
      switch (this.selectedFilter) {
        case 'byRecipientName': this.filteredData = this.caseData.filter((elem: any) => elem.name.toLowerCase().includes(this.searchQuery.toLowerCase()))
          break;
      }
    }
  }

}
