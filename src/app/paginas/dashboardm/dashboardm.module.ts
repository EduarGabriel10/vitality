import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DashboardmPageRoutingModule } from './dashboardm-routing.module';
import { DashboardmPage } from './dashboardm.page';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DashboardmPageRoutingModule,
    SharedModule,
    DashboardmPage // Import standalone component
  ]
})
export class DashboardmPageModule {}
