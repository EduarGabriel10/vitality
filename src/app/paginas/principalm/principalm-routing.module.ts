import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PrincipalmPage } from './principalm.page';

const routes: Routes = [
  {
    path: '',
    component: PrincipalmPage,
    children: [
      {
        path:'medico',
        loadChildren: () => import('../medico/medico.module').then(m => m.MedicoPageModule)
      },
      {
        path:'resenam',
        loadChildren: () => import('../resenam/resenam.module').then(m => m.ResenamPageModule)
      },
      {
        path: 'dashboardm',
        loadChildren: () => import('../dashboardm/dashboardm.module').then(m => m.DashboardmPageModule)
      },
      {
        path: 'datosm/:id',
        loadChildren: () => import('../datosm/datosm.module').then(m => m.DatosmPageModule)
      },
      {
        path: 'diagmedico/:id',
        loadChildren: () => import('../diagmedico/diagmedico.module').then(m => m.DiagmedicoPageModule)
      },
      {
        path: 'horario',
        loadChildren: () => import('../horario/horario.module').then(m => m.HorarioPageModule)
      },
      {
        path: 'citamed',
        loadChildren: () => import('../citamed/citamed.module').then(m => m.CitamedPageModule)
      },
      {
        path: 'grafico',
        loadChildren: () => import('../grafico/grafico.module').then(m => m.GraficoPageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrincipalmPageRoutingModule {}
