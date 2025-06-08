import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ResenamPage } from './resenam.page';

const routes: Routes = [
  {
    path: '',
    component: ResenamPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResenamPageRoutingModule {}
