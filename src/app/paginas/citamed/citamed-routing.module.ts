import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CitamedPage } from './citamed.page';

const routes: Routes = [
  {
    path: '',
    component: CitamedPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CitamedPageRoutingModule {}
