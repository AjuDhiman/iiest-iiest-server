import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from 'src/app/pages/home/home.component';
import { StatListsComponent } from 'src/app/pages/home/stat-lists/stat-lists.component';
import { StatCardsComponent } from 'src/app/pages/home/stat-cards/stat-cards.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { HighchartsComponent } from 'src/app/pages/highcharts/highcharts.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { HighchartDataModalComponent } from 'src/app/pages/modals/highchart-data-modal/highchart-data-modal.component';
import { DepartmentListComponent } from 'src/app/pages/modals/department-list/department-list.component';



@NgModule({
  declarations: [
    HomeComponent,
    StatListsComponent,
    StatCardsComponent,
    HighchartsComponent,
    HighchartDataModalComponent,
    DepartmentListComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    HighchartsChartModule,
  ],
  exports: [
  ]
})
export class homeModule { }
