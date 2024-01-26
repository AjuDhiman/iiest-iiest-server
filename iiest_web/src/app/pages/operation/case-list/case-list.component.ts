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
  typeData: any;
  showPagination:boolean=false;
  faMagnifyingGlass = faMagnifyingGlass;
  faFileCsv = faFileCsv;
  serviceType='Catering';
  totalCount:number=0;

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
    }
    else{
      this.isSearch=false;
      // this.filteredData=this.typeData;
    }
    this.filter();
  }

  onTableDataChange(event: any) {
    this.pageNumber = event;
  }

  getCasedata() {
    this._getDataService.getCaseList().subscribe({
      next: res => {
        this.caseData = res.caseList.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((elem: any, index: number) => ({ ...elem, serialNumber: index + 1 }));
        this.setServiceType('Catering'); 
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

  setServiceType(type:string){
    this.serviceType=type;
    this.pageNumber = 1;
    this.searchQuery='';
    this.typeData=this.caseData.filter((elem:any) => elem.salesInfo && elem.salesInfo.fostacInfo.fostac_service_name===type);

    //for getting Total number of case based on type 
    this.totalCount=this.typeData.length;  
    this.filteredData=this.typeData;
  }

  //method for opening operation form
  collectResData(id: string) {
    this.router.navigate(['/operationform',id]);
  }

  filter(): void {
    if (!this.searchQuery) {
      this.filteredData = this.typeData;
    } else {
      switch (this.selectedFilter) {
        case 'byRecipientName': this.filteredData = this.typeData.filter((elem: any) => elem.name.toLowerCase().includes(this.searchQuery.toLowerCase()))
          break;
        case 'byFboName':this.filteredData = this.typeData.filter((elem: any) => elem.salesInfo.fboInfo.fbo_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
          break;
        case 'byOwnerName': this.filteredData = this.typeData.filter((elem: any) => elem.salesInfo.fboInfo.owner_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
          break;
      }
    }
    this.filteredData.length?this.showPagination=true:this.showPagination=false;
  }

}
