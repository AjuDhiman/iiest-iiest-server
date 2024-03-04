import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { faFileCsv, faMagnifyingGlass, faUpload, faDownload, faEye, faFile } from '@fortawesome/free-solid-svg-icons';
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
  showPagination: boolean = false;
 
  serviceType = '';
  totalCount: number = 0;
  panelType: string = '';
  
  //loading var
  loading: boolean = true;

  //icons
  faMagnifyingGlass = faMagnifyingGlass;
  faFileCsv = faFileCsv;
  faUpload = faUpload;
  faDownload = faDownload;
  faEye = faEye;
  faFile = faFile;

  constructor(private exportAsService: ExportAsService,
    private _getDataService: GetdataService,
    private _registerService: RegisterService,
    private router: Router) {
  }

  ngOnInit(): void {
    let timeout = setTimeout(() => {
      this.loading = false
    }, 5000);
    this.getCasedata();

    let user: any = this._registerService.LoggedInUserData();
    let parsedUser = JSON.parse(user);
    this.panelType = parsedUser.panel_type;
    if (this.panelType === 'Fostac Panel') {
      this.serviceType = 'Catering'
    } else if (this.panelType === 'Foscos Panel') {
      this.serviceType = 'Registration'
    }
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
    if (this.searchQuery) {
      this.pageNumber = 1;
      this.isSearch = true;
    }
    else {
      this.isSearch = false;
    }
    //  this.filteredData=this.typeData;
    this.setServiceType("Registration");
    this.filter();
  }

  onTableDataChange(event: any) {
    this.pageNumber = event;
  }

  getCasedata() {
    this._getDataService.getCaseList().subscribe({
      next: res => {
        this.loading = false;
        this.caseData = res.caseList.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((elem: any, index: number) => ({ ...elem, serialNumber: index + 1 }));
        if (this.panelType === 'Fostac Panel') {
          this.setServiceType('Catering');
          this.filter();
        }
        else if (this.panelType === 'Foscos Panel') {
          this.setServiceType("Registration");
          this.filter();
        }
      },
      error: err => {
        let errorObj = err.error;
        if (errorObj.userError) {
          this._registerService.signout();
        }
      }
    })
  }

  setServiceType(type: string) {
    this.serviceType = type;
    this.pageNumber = 1;
    this.searchQuery = '';

    if (this.panelType === 'Fostac Panel') {
      this.typeData = this.caseData.filter((elem: any) => elem.salesInfo && elem.salesInfo.fostacInfo.fostac_service_name === type);
    } else if (this.panelType === 'Foscos Panel') {
      this.typeData = this.caseData.filter((elem: any) => elem.salesInfo && elem.salesInfo.foscosInfo.foscos_service_name === type);
    }

    //for getting Total number of case based on type 
    this.totalCount = this.typeData.length;
    this.filteredData = this.typeData;
  }

  //method for opening operation form
  collectResData(id: string) {
    this.router.navigate(['caselist/operationform', id]);
  }

  filter(): void {
    if (!this.searchQuery) {
      this.filteredData = this.typeData;
    } else {
      if (this.panelType = 'Fostac Panel') {
        switch (this.selectedFilter) {
          case 'byRecipientName': this.filteredData = this.typeData.filter((elem: any) => elem.name.toLowerCase().includes(this.searchQuery.toLowerCase()))
            break;

          case 'byFboName': this.filteredData = this.typeData.filter((elem: any) => elem.salesInfo && elem.salesInfo.fboInfo.fbo_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
            break;

          case 'byOwnerName': this.filteredData = this.typeData.filter((elem: any) => elem.salesInfo && elem.salesInfo.fboInfo.owner_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
            break;

          case 'byContact': this.filteredData = this.typeData.filter((elem: any) => elem.phoneNo.toString().includes(this.searchQuery.toString()))
            break;
          
            case 'byState': this.filteredData = this.typeData.filter((elem: any) => elem.salesInfo && elem.salesInfo.fboInfo.state.toLowerCase().includes(this.searchQuery.toLowerCase()));
            break;
        }
      }
      else if(this.panelType == 'Foscos Panel'){
        switch (this.selectedFilter) {
           case 'byOpetatorName': this.filteredData = this.typeData.filter((elem: any) => elem.operatorName.toLowerCase().includes(this.searchQuery.toLowerCase()))
            break;

          case 'byFboName': this.filteredData = this.typeData.filter((elem: any) => elem.salesInfo && elem.salesInfo.fboInfo.fbo_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
            break;

          case 'byOwnerName': this.filteredData = this.typeData.filter((elem: any) => elem.salesInfo && elem.salesInfo.fboInfo.owner_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
            break;
        }
      }
    }
    this.filteredData.length ? this.showPagination = true : this.showPagination = false;
    this.filteredData.sort((a: any, b: any) =>new Date(b.salesInfo.createdAt).getTime() - new Date(a.salesInfo.createdAt).getTime() );
  }

}