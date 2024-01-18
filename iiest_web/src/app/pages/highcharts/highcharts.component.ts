import { Component, Input } from '@angular/core';
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
  intervalType: string = 'week';
  categories = ['fostac(Retail)', 'fostac(Catering)', 'foscos(Registration)', 'foscos(State)'];
  @Input() chartData:Highcharts.Options;
  data_0: any = [
    {
      date: '2023-12-26',
      sale: [
        {
          category: 'fostac',
          subCategory: 'Catering',
          grandTotal: 2000
        }
      ]
    },
    {
      date: '2023-12-23',
      sale: [
        {
          category: 'fostac',
          subCategory: 'retail',
          grandTotal: 2000
        }
      ]
    },
    {
      date: '2023-12-21',
      sale: [
        {
          category: 'foscos',
          subCategory: 'State',
          grandTotal: 2000
        }
      ]
    },
    {
      date: '2023-12-20',
      sale: [
        {
          category: 'foscos',
          subCategory: 'Registration',
          grandTotal: 2000
        }
      ]
    },

    {
      date: '2023-12-06',
      sale: [
        {
          category: 'fostac',
          subCategory: 'Catering',
          grandTotal: 1800
        }
      ]
    },
    {
      date: '2023-12-05',
      sale: [
        {
          category: 'foscos',
          subCategory: 'State',
          grandTotal: 2200
        }
      ]
    },
    {
      date: '2023-12-04',
      sale: [
        {
          category: 'foscos',
          subCategory: 'Registration',
          grandTotal: 2000
        }
      ]
    },
    {
      date: '2023-12-03',
      sale: [
        {
          category: 'fostac',
          subCategory: 'retail',
          grandTotal: 1900
        }
      ]
    },
    {
      date: '2023-12-02',
      sale: [
        {
          category: 'fostac',
          subCategory: 'Catering',
          grandTotal: 2100
        }
      ]
    },
    {
      date: '2023-12-01',
      sale: [
        {
          category: 'foscos',
          subCategory: 'State',
          grandTotal: 2300
        }
      ]
    },
    {
      date: '2023-11-30',
      sale: [
        {
          category: 'foscos',
          subCategory: 'Registration',
          grandTotal: 2000
        }
      ]
    },
    {
      date: '2023-11-29',
      sale: [
        {
          category: 'fostac',
          subCategory: 'retail',
          grandTotal: 1800
        }
      ]
    },
    {
      date: '2023-11-28',
      sale: [
        {
          category: 'foscos',
          subCategory: 'Catering',
          grandTotal: 1700
        }
      ]
    },
    {
      date: '2023-11-27',
      sale: [
        {
          category: 'fostac',
          subCategory: 'State',
          grandTotal: 2100
        }
      ]
    },
    {
      date: '2023-11-26',
      sale: [
        {
          category: 'foscos',
          subCategory: 'Registration',
          grandTotal: 1900
        }
      ]
    },
    {
      date: '2023-11-25',
      sale: [
        {
          category: 'fostac',
          subCategory: 'retail',
          grandTotal: 2000
        }
      ]
    },
    {
      date: '2023-11-24',
      sale: [
        {
          category: 'foscos',
          subCategory: 'Catering',
          grandTotal: 2200
        }
      ]
    },
    {
      date: '2023-11-23',
      sale: [
        {
          category: 'foscos',
          subCategory: 'State',
          grandTotal: 1800
        }
      ]
    },
    {
      date: '2023-11-22',
      sale: [
        {
          category: 'fostac',
          subCategory: 'Registration',
          grandTotal: 1900
        }
      ]
    },
    {
      date: '2023-11-21',
      sale: [
        {
          category: 'fostac',
          subCategory: 'retail',
          grandTotal: 2100
        }
      ]
    },
    {
      date: '2023-11-20',
      sale: [
        {
          category: 'foscos',
          subCategory: 'Catering',
          grandTotal: 2000
        }
      ]
    },
    {
      date: '2023-11-19',
      sale: [
        {
          category: 'fostac',
          subCategory: 'State',
          grandTotal: 2200
        }
      ]
    },
    {
      date: '2023-11-18',
      sale: [
        {
          category: 'foscos',
          subCategory: 'Registration',
          grandTotal: 1900
        }
      ]
    },
    {
      date: '2023-11-17',
      sale: [
        {
          category: 'fostac',
          subCategory: 'retail',
          grandTotal: 1800
        }
      ]
    },
  ]
  data = {
    fostac: [
      {
        catagory: 'retail',
        grandtotal: 1000,
        date: '2023-12-26'
      },
      {
        catagory: 'retail',
        grandtotal: 1000,
        date: '2023-12-26'
      },
      {
        catagory: 'Catering',
        grandtotal: 1000,
        date: '2023-12-26'
      },
      {
        catagory: 'Catering',
        grandtotal: 1000,
        date: '2023-12-26'
      },
      // 10 more entries for fostac
      {
        catagory: 'Catering',
        grandtotal: 1200,
        date: '2023-12-27'
      },
      {
        catagory: 'retail',
        grandtotal: 1300,
        date: '2023-12-28'
      },
      {
        catagory: 'Catering',
        grandtotal: 1100,
        date: '2023-12-29'
      },
      {
        catagory: 'retail',
        grandtotal: 1400,
        date: '2023-12-30'
      },
      {
        catagory: 'Catering',
        grandtotal: 1200,
        date: '2023-12-31'
      },
      {
        catagory: 'retail',
        grandtotal: 1300,
        date: '2024-01-01'
      },
      {
        catagory: 'Catering',
        grandtotal: 1400,
        date: '2024-01-02'
      },
      {
        catagory: 'retail',
        grandtotal: 1100,
        date: '2024-01-03'
      },
      {
        catagory: 'Catering',
        grandtotal: 1200,
        date: '2024-01-04'
      },
      {
        catagory: 'retail',
        grandtotal: 1300,
        date: '2024-01-05'
      },
    ],
    foscos: [
      {
        catagory: 'Registration',
        grandtotal: 1000,
        date: '2023-12-26'
      },
      {
        catagory: 'State',
        grandtotal: 1000,
        date: '2023-12-26'
      },
      {
        catagory: 'State',
        grandtotal: 1000,
        date: '2023-12-26'
      },
      {
        catagory: 'Registration',
        grandtotal: 1000,
        date: '2023-12-26'
      },
      // 10 more entries for foscos
      {
        catagory: 'Registration',
        grandtotal: 1200,
        date: '2023-12-27'
      },
      {
        catagory: 'State',
        grandtotal: 1300,
        date: '2023-12-28'
      },
      {
        catagory: 'State',
        grandtotal: 1100,
        date: '2023-12-29'
      },
      {
        catagory: 'Registration',
        grandtotal: 1400,
        date: '2023-12-30'
      },
      {
        catagory: 'Registration',
        grandtotal: 1200,
        date: '2023-12-31'
      },
      {
        catagory: 'State',
        grandtotal: 1300,
        date: '2024-01-01'
      },
      {
        catagory: 'State',
        grandtotal: 1400,
        date: '2024-01-02'
      },
      {
        catagory: 'Registration',
        grandtotal: 1100,
        date: '2024-01-03'
      },
      {
        catagory: 'State',
        grandtotal: 1200,
        date: '2024-01-04'
      },
      {
        catagory: 'Registration',
        grandtotal: 1300,
        date: '2024-01-05'
      },
    ]
  };

  data1 = [
    {
      category: 'fostac(Catering)',
      grandTotal: 2000,
      date: '2023-12-18'
    },
    {
      category: 'fostac(Retail)',
      grandTotal: 2000,
      date: '2023-12-18'
    },
    {
      category: 'foscos(Registration)',
      grandTotal: 2000,
      date: '2023-12-18'
    },
    {
      category: 'foscos(State)',
      grandTotal: 2000,
      date: '2023-12-18'
    },
    // Additional 30 fake objects with the same category and subcategory
    {
      category: 'fostac(Catering)',
      grandTotal: 1500,
      date: '2023-12-18'
    },
    {
      category: 'fostac(Retail)',
      grandTotal: 1700,
      date: '2023-12-18'
    },
    {
      category: 'foscos(Registration)',
      grandTotal: 1200,
      date: '2023-12-18'
    },
    // ... repeat this pattern for the remaining fake objects
    {
      category: 'fostac(Catering)',
      grandTotal: 1800,
      date: '2023-12-18'
    },
    {
      category: 'fostac(Retail)',
      grandTotal: 1300,
      date: '2023-12-18'
    },
    {
      category: 'foscos(Registration)',
      grandTotal: 2000,
      date: '2023-12-18'
    },
    // ... repeat this pattern for the remaining fake objects
    {
      category: 'fostac(Catering)',
      grandTotal: 1400,
      date: '2023-12-18'
    },
    {
      category: 'fostac(Retail)',
      grandTotal: 2100,
      date: '2023-12-18'
    },
    {
      category: 'foscos(Registration)',
      grandTotal: 2300,
      date: '2023-12-18'
    },
    // ... repeat this pattern for the remaining fake objects
  ];

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

  barChart1: Highcharts.Options = {
    title: {
      text: 'Sales Chart',
    },
    xAxis: {
      categories: this.categories,
    },
    yAxis: {
      title: {
        text: 'Sales',
      },
    },
    plotOptions: {
      column: {
        colorByPoint: true,
        colors: ['#1a9850', '#66bd63', '#a6d96a', '#d9ef8b'], // Shades of green
      },
    },
    series: [
      {
        type: 'column',
        data: [20, 50, 79, 22],
        color: '#128c54',
      },
    ],
  };

  //High charts
  // chartOptions: Highcharts.Options = {
  //   credits: {
  //     enabled: false
  //   },
  //   series: [
  //     {
  //       type: 'line',
  //       data: this.datas,
  //     },
  //   ],
  //   colors: ['#15a362', '#33FF57', '#5733FF', '#FF33A3', '#33A3FF'], // Add your desired colors here
  // };

  ChangeInterval(event: any) {
    this.intervalType = event.target.value;
    console.log(this.intervalType);
    switch (this.intervalType) {
      case 'today':
        this.intervals = ['Today'];
        this.retailSale = [34];
        this.cateringSale = [88];
        break;
      case 'week':
        this.intervals = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        this.retailSale = [34, 88, 55, 33, 55, 32, 90];
        this.cateringSale = [88, 78, 98, 120, 140, 123, 111];
        break;
      case 'year':
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

  UpdateData(Series: any, data: Number[]) {

  }

  // for second type of sales chart
  ChangeInterval1(event: any) {
  //   var today = new Date();

  //   switch (event.target.value) {
  //     case 'week':
  //       var currentDayOfWeek = today.getDay();
  //       var difference = currentDayOfWeek - 0; // 0 is Sunday
  //       today.setDate(today.getDate() - difference);

  //       for (var i = 0; i <= currentDayOfWeek; i++) {
  //           console.log("Day of the week:", today.toDateString());
  //           today.setDate(today.getDate() + 1);
  //       }
  //       break;

  //   case 'month':
  //       var currentDayOfMonth = today.getDate();
  //       today.setDate(1);

  //       while (today.getDate() <= currentDayOfMonth) {
  //           console.log("Day of the month:", today.toDateString());
  //           today.setDate(today.getDate() + 1);
  //       }
  //       break;

  //   case 'year':
  //       var currentDayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  //       today = new Date(today.getFullYear(), 0, 1);

  //       while (Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)) <= currentDayOfYear) {
  //           console.log("Day of the year:", today.toDateString());
  //           today.setDate(today.getDate() + 1);
  //       }
  //       break;

  //   default:
  //       console.log("Invalid type. Use 'week', 'month', or 'year'.");
  //       break;
  //   }
  }


}
