import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ResenaPage } from './resena.page';

const routes: Routes = [
  {
    path: '',
    component: ResenaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResenaPageRoutingModule {}
