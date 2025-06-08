import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PrincipalPage } from './principal.page';

const routes: Routes = [
  {
    path: '',
    component: PrincipalPage,
    children: [
      {
        path: 'usuario',
        loadChildren: () => import('../usuario/usuario.module').then(m => m.UsuarioPageModule)
      },
      {
        path: 'analisis',
        loadChildren: () => import('../analisis/analisis.module').then(m => m.AnalisisPageModule)
      },
      {
        path: 'historial',
        loadChildren: () => import('../historial/historial.module').then(m => m.HistorialPageModule)
      },
      {
        path: 'detalles',
        loadChildren: () => import('../detalles/detalles.module').then(m => m.DetallesPageModule)
      },
      {
        path: 'diagnostico',
        loadChildren: () => import('../diagnostico/diagnostico.module').then(m => m.DiagnosticoPageModule)
      },
      {
        path: 'dashboard',
        loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardPageModule)  
      },
      {
        path: 'buscar',
        loadChildren: () => import('../buscar/buscar.module').then(m => m.BuscarPageModule)
      },
      {
        path: 'resena',
        loadChildren: () => import('../resena/resena.module').then(m => m.ResenaPageModule)
      },
      {
        path: 'mapa',
        loadChildren: () => import('../mapa/mapa.module').then(m => m.MapaPageModule)
      },
      {
        path: 'cita',
        loadChildren: () => import('../cita/cita.module').then(m => m.CitaPageModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrincipalPageRoutingModule {}
