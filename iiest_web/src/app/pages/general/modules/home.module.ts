import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from '../../home/home.component';
import { StatListsComponent } from '../../home/stat-lists/stat-lists.component';
import { StatCardsComponent } from '../../home/stat-cards/stat-cards.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { HighchartsComponent } from '../../highcharts/highcharts.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { HighchartDataModalComponent } from '../../modals/highchart-data-modal/highchart-data-modal.component';
import { DepartmentListComponent } from '../../modals/department-list/department-list.component';



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
