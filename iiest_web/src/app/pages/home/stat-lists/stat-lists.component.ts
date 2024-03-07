import { Component, Input, OnInit } from '@angular/core';
import { GetdataService } from 'src/app/services/getdata.service';
import { months, salesManagerRoles } from 'src/app/utils/config';

@Component({
  selector: 'app-stat-lists',
  templateUrl: './stat-lists.component.html',
  styleUrls: ['./stat-lists.component.scss']
})
export class StatListsComponent implements OnInit {

  topSalesPersons: Array<{name: string, salesAmmount: number, salesCount: number}>
  topProducts: Array<{name: string, salesAmmount: number, salesCount: number}>;
  empUnderManagerSale: Array<{name: string, salesAmmount: number, salesCount: number}>

  thisMonth: string;


  @Input() department: string;
  @Input() designation: string;

  constructor(private _getDataService: GetdataService) {

  }

  ngOnInit(): void {

    this.thisMonth = months[new Date().getMonth()]

    this.getTopSalesPersons();

    this.getTopProducts();

    if(salesManagerRoles.includes(this.designation)){
      this.getEmpUnderManager();
    }
   
  }

  //this methord calls the api for getting total and today sale of top sales persons
  getTopSalesPersons() {
    this._getDataService.getTopSalesPersons().subscribe({
      next: res => {
        this.topSalesPersons = res;
      }
    });
  }

  //this methord calls the api for getting total and today sale of top products 
  getTopProducts() {
    this._getDataService.getTopProducts().subscribe({
      next: res => {
        this.topProducts = res;
      }
    });
  }

   //this methord calls the api for getting total and today sale of employees under a manager
   getEmpUnderManager() {
    this._getDataService.getEmpUnderManager().subscribe({
      next: res => {
        this.empUnderManagerSale = res;
      }
    });
  }
}
