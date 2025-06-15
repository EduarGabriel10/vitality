import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DatosmPage } from './datosm.page';

const routes: Routes = [
  {
    path: '',
    component: DatosmPage,
    children: [
      {
        path: 'datosm/diagmedico/:id',
        loadChildren: () => import('../diagmedico/diagmedico.module').then( m => m.DiagmedicoPageModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DatosmPageRoutingModule {}
