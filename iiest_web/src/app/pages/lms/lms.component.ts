import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-lms',
  templateUrl: './lms.component.html',
  styleUrls: ['./lms.component.scss']
})
export class LmsComponent implements OnInit {
  currentDate = new Date();
  weekDays: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  calendar: any[] = [];
  months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
 showMonth:string;
 todayDate:any;
 isCurrentDate :boolean;
  constructor() { }

  ngOnInit(): void {
    this.generateCalendar();
   
  }

  generateCalendar(): void {
    const today = new Date();
    const firstDayOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDayOfMonth);
    
    this.todayDate = today.toDateString().split(' ')
    console.log(this.currentDate.toDateString())
    
    console.log(today.toDateString());
    // Adjust start date to start from Monday
    while (startDate.getDay() !== 1) { // Monday
      startDate.setDate(startDate.getDate() - 1);
    }
  
    this.calendar = [];
    let currentWeek: any[] = [];
    this.showMonth = this.months[this.currentDate.getMonth()];
    // Add week days at the top
    this.weekDays;
  
    while (startDate <= lastDayOfMonth) {
      const currentDate = new Date(startDate);
      this.currentDate.toDateString()
      this.isCurrentDate = this.currentDate.toDateString() === today.toDateString();
      if (currentDate.getMonth() === firstDayOfMonth.getMonth()) {
        currentWeek.push(currentDate.getDate());
      } else {
        currentWeek.push(null);
      }
  
      if (currentDate.getDay() === 0) { // Sunday
        this.calendar.push(currentWeek);
        currentWeek = [];
      }
  
      startDate.setDate(startDate.getDate() + 1);
    }
  
    // If the last week is not complete, add it
    if (currentWeek.length > 0) {
      this.calendar.push(currentWeek);
    }
  }
  
  

  goToPreviousMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.generateCalendar();
  }

  goToNextMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.generateCalendar();
  }

}