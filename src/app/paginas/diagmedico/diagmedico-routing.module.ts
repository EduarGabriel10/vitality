import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DiagmedicoPage } from './diagmedico.page';

const routes: Routes = [
  {
    path: '',
    component: DiagmedicoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DiagmedicoPageRoutingModule {}
