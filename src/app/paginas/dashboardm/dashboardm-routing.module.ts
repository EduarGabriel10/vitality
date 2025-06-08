import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardmPage } from './dashboardm.page';

const routes: Routes = [
  {
    path: '',
    component: DashboardmPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardmPageRoutingModule {}
