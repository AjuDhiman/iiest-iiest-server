import { Component, Input, OnInit } from '@angular/core';
import { GetdataService } from 'src/app/services/getdata.service';
import { Months, salesManagerRoles } from 'src/app/utils/config';

interface interval {
  lastMonth: string,
  lastHalf: string
}

@Component({
  selector: 'app-stat-lists',
  templateUrl: './stat-lists.component.html',
  styleUrls: ['./stat-lists.component.scss']
})
export class StatListsComponent implements OnInit {

  topSalesPersons: Array<{name: string, salesAmmount: number, salesCount: number, location: string}>
  topProducts: Array<{name: string, salesAmount: interval, salesCount: interval}>;
  empUnderManagerSale: Array<{name: string, salesAmmount: number, salesCount: number}>;
  mostRepeatedCust: Array<{name: string, repetition_count: number}>;

  selectedInterval: 'lastMonth' | 'lastHalf' = 'lastMonth';

  lastMonth: string;

  pageNumber: number = 1;
  itemsNumber: number = 5;

  @Input() department: string;
  @Input() designation: string;

  constructor(private _getDataService: GetdataService) {

  }

  ngOnInit(): void {

    this.lastMonth = Months[(new Date().getMonth() - 1) % 12]

    this.getTopSalesPersons();

    this.getTopProducts();

    this.getMostRepeatedCust();

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

  //this methord calls the api getting most repeated customer and their repetion count so we can show them in statlist table
  getMostRepeatedCust() {
    this._getDataService.getMostRepeatedCust().subscribe({
      next: res => {
        this.mostRepeatedCust = res;
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

  onTableDataChange(event: number) {
    this.pageNumber = event;
  }

  onPageChange($event: number){
    this.pageNumber = $event;
  }

  checkString(str: any): boolean{
    return typeof str === 'string';
  }
}
