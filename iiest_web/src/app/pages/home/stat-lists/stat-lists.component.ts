import { Component, Input, OnInit } from '@angular/core';
import { GetdataService } from 'src/app/services/getdata.service';

@Component({
  selector: 'app-stat-lists',
  templateUrl: './stat-lists.component.html',
  styleUrls: ['./stat-lists.component.scss']
})
export class StatListsComponent implements OnInit {

  topSalesPersons: Array<{name: string, totalSales: number, todaySales: number}>
  topProducts: Array<{name: string, totalSalesCount: number, todaySalesCount: number}>;

  @Input() department: string;
  @Input() designation: string;

  constructor(private _getDataService: GetdataService) {

  }

  ngOnInit(): void {
    this.getTopSalesPersons();

    this.getTopProducts();
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
}
