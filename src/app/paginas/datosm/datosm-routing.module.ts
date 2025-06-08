import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DatosmPage } from './datosm.page';

const routes: Routes = [
  {
    path: '',
    component: DatosmPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DatosmPageRoutingModule {}
