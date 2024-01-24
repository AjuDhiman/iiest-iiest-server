import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { faFileCsv, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { ExportAsConfig, ExportAsService } from 'ngx-export-as';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';

@Component({
  selector: 'app-case-list',
  templateUrl: './case-list.component.html',
  styleUrls: ['./case-list.component.scss']
})
export class CaseListComponent implements OnInit {
  filteredData: any;
  isSearch: boolean = false;
  searchQuery: string;
  selectedFilter: string = 'byRecipientName';
  itemsNumber: number = 25;
  pageNumber: number = 1;
  caseData: any;
  showPagination:boolean=false;
  faMagnifyingGlass = faMagnifyingGlass;
  faFileCsv = faFileCsv;
  serviceType='Catering';

  constructor(private exportAsService: ExportAsService,
    private _getDataService: GetdataService,
    private registerService: RegisterService,
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
      this.filteredData=this.caseData;
    }
  }

  onTableDataChange(event: any) {
    this.pageNumber = event;
  }

  getCasedata() {
    this._getDataService.getCaseList().subscribe({
      next: res => {
        console.log(res);
        this.caseData = res.caseList.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((elem: any, index: number) => ({ ...elem, serialNumber: index + 1 }));
        this.filter();
      },
      error: err => {
        let errorObj = err.error;
        if(errorObj.userError){
          this.registerService.signout();
        }
      }
    })
  }

  changeServiceType(type:string){
    this.serviceType=type;

    this.pageNumber = 1;

    this.filteredData=this.caseData.filter((elem:any) => elem.salesInfo && elem.salesInfo.fostacInfo.fostac_service_name===type);
  }

  //method for opening operation form
  collectResData(id: string) {
    this.router.navigate(['/operationform',id])
  }

  filter(): void {
    if (!this.searchQuery) {
      this.filteredData = this.caseData;
    } else {
      switch (this.selectedFilter) {
        case 'byRecipientName': this.filteredData = this.caseData.filter((elem: any) => elem.name.toLowerCase().includes(this.searchQuery.toLowerCase()))
          break;
        case 'byFboName':this.filteredData = this.caseData.filter((elem: any) => elem.salesInfo.fboInfo.fbo_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
          break;
        case 'byOwnerName': this.filteredData = this.caseData.filter((elem: any) => elem.salesInfo.fboInfo.owner_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
          break;
      }
    }
    this.filteredData.length?this.showPagination=true:this.showPagination=false;
  }

}
