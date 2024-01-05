import { Component } from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-highcharts',
  templateUrl: './highcharts.component.html',
  styleUrls: ['./highcharts.component.scss']
})
export class HighchartsComponent {

  Highcharts: typeof Highcharts = Highcharts;
  datas: any = [1, 2, 3, 4];
  //New Variables
  intervals: any = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  cateringSale: any[] = [88, 78, 98, 120, 140, 123, 111];
  retailSale: any[] = [34, 88, 55, 33, 55, 32, 90];
  data: any = {
    fostac: [
      {
        catagorty: 'retail',
        grandtotal: 1000,
        date: '2023-12-26'
      },
      {
        catagorty: 'retail',
        grandtotal: 1000,
        date: '2023-12-26'
      },
      {
        catagorty: 'Catering',
        grandtotal: 1000,
        date: '2023-12-26'
      },
      {
        catagorty: 'Catering',
        grandtotal: 1000,
        date: '2023-12-26'
      }
    ],
    foscos: [
      {
        catagorty: 'Registration',
        grandtotal: 1000,
        date: '2023-12-26'
      },
      {
        catagorty: 'State',
        grandtotal: 1000,
        date: '2023-12-26'
      },
      {
        catagorty: 'State',
        grandtotal: 1000,
        date: '2023-12-26'
      },
      {
        catagorty: 'Registration',
        grandtotal: 1000,
        date: '2023-12-26'
      }
    ]
  }
  fostacSeries: any = [
    {
      name: 'Retail',
      type: 'column',
      data: this.retailSale, // Replace with the actual data for 'Retail'
      color: '#128c54',
    },
    {
      name: 'Catering',
      type: 'column',
      data: this.cateringSale, // Replace with the actual data for 'Catering'
      color: '#20c997',
    },
  ];
  foscosSeries: any = [
    {
      name: 'Registration',
      type: 'column',
      data: this.retailSale, // Replace with the actual data for 'Registartion'
      color: '#128c54',
    },
    {
      name: 'State',
      type: 'column',
      data: this.cateringSale, // Replace with the actual data for 'State'
      color: '#20c997',
    },
  ];

  // Sales Chart
  barChart: Highcharts.Options = {
    title: {
      text: 'Sales Chart',
    },
    xAxis: {
      categories: this.intervals,
    },
    yAxis: {
      title: {
        text: 'Sales',
      },
    },
    series: this.fostacSeries,
  };

  //High charts
  chartOptions: Highcharts.Options = {
    credits: {
      enabled: false
    },
    series: [
      {
        type: 'line',
        data: this.datas,
      },
    ],
    colors: ['#15a362', '#33FF57', '#5733FF', '#FF33A3', '#33A3FF'], // Add your desired colors here
  };

  ChangeInterval(event: any) {
    console.log(event.target.value);
    switch (event.target.value) {
      case '1':
        this.intervals = ['Today'];
        this.retailSale = [34];
        this.cateringSale = [88];
        break;
      case '2':
        this.intervals = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        this.retailSale = [34, 88, 55, 33, 55, 32, 90];
        this.cateringSale = [88, 78, 98, 120, 140, 123, 111];
        break;
      case '3':
        this.intervals = ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'];
        this.retailSale = [34, 88, 55, 33, 55, 32, 90, 88, 0, 8, 23, 45];
        this.cateringSale = [88, 78, 98, 120, 140, 123, 111, 34, 56, 78, 90, 123];
        break;
    }

    // Update the xAxis categories
    const xAxisOptions = this.barChart.xAxis as Highcharts.XAxisOptions;
    xAxisOptions.categories = this.intervals;
    this.fostacSeries[0].data = this.retailSale;
    this.fostacSeries[1].data = this.cateringSale;
    this.barChart.series = this.fostacSeries;
    this.Highcharts.charts[1]?.update(this.barChart, true);
  }

  ChangeProduct() {
    //  switch(){

    //  }
  }

  UpdateData(Series:any,data:Number[]) {
    
  }


}
