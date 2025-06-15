import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { canActivate, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

// Redirigir a login si el usuario NO está autenticado
const redirectToLogin = () => redirectUnauthorizedTo(['/login']);

const routes: Routes = [
  {
    path: '',
    redirectTo: 'portada',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./paginas/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule),
    ...canActivate(redirectToLogin), // Solo accesible si está autenticado
  },
  {
    path: 'usuario',
    loadChildren: () => import('./paginas/usuario/usuario.module').then(m => m.UsuarioPageModule),
    ...canActivate(redirectToLogin), // Solo accesible si está autenticado
  },
  {
    path: 'principal',
    loadChildren: () => import('./paginas/principal/principal.module').then( m => m.PrincipalPageModule)
  },
  {
    path: 'portada',
    loadChildren: () => import('./paginas/portada/portada.module').then( m => m.PortadaPageModule)
  },
  {
    path: 'registrarse',
    loadChildren: () => import('./paginas/registrarse/registrarse.module').then( m => m.RegistrarsePageModule)
  },

  {
    path: 'analisis',
    loadChildren: () => import('./paginas/analisis/analisis.module').then( m => m.AnalisisPageModule)
  },
  {
    path: 'historial',
    loadChildren: () => import('./paginas/historial/historial.module').then( m => m.HistorialPageModule)
  },
  {
    path: 'detalles',
    loadChildren: () => import('./paginas/detalles/detalles.module').then( m => m.DetallesPageModule)
  },

  {
    path: 'diagnostico',
    loadChildren: () => import('./paginas/diagnostico/diagnostico.module').then( m => m.DiagnosticoPageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./paginas/dashboard/dashboard.module').then( m => m.DashboardPageModule)
  },
  {
    path: 'buscar',
    loadChildren: () => import('./paginas/buscar/buscar.module').then( m => m.BuscarPageModule)
  },
  {
    path: 'resena',
    loadChildren: () => import('./paginas/resena/resena.module').then( m => m.ResenaPageModule)
  },
  {
    path: 'mapa',
    loadChildren: () => import('./paginas/mapa/mapa.module').then( m => m.MapaPageModule)
  },
  {
    path: 'principalm',
    loadChildren: () => import('./paginas/principalm/principalm.module').then( m => m.PrincipalmPageModule)
  },
  {
    path: 'medico',
    loadChildren: () => import('./paginas/medico/medico.module').then( m => m.MedicoPageModule)
  },
  {
    path: 'dashboardm',
    loadChildren: () => import('./paginas/dashboardm/dashboardm.module').then( m => m.DashboardmPageModule)
  },
  {
    path: 'resenam',
    loadChildren: () => import('./paginas/resenam/resenam.module').then( m => m.ResenamPageModule)
  },
  {
    path: 'principal/datosm/:id',
    loadChildren: () => import('./paginas/datosm/datosm.module').then( m => m.DatosmPageModule)
  },
  {
    path: 'principal/diagmedico/:id',
    loadChildren: () => import('./paginas/diagmedico/diagmedico.module').then( m => m.DiagmedicoPageModule)
  },
  {
    path: 'grafico',
    loadChildren: () => import('./paginas/grafico/grafico.module').then( m => m.GraficoPageModule)
  },

  {
    path: 'horario',
    loadChildren: () => import('./paginas/horario/horario.module').then( m => m.HorarioPageModule)
  },
  {
    path: 'cita',
    loadChildren: () => import('./paginas/cita/cita.module').then( m => m.CitaPageModule)
  },
  {
    path: 'citamed',
    loadChildren: () => import('./paginas/citamed/citamed.module').then( m => m.CitamedPageModule)
  },
  {
    path: 'informacion',
    loadChildren: () => import('./paginas/informacion/informacion.module').then( m => m.InformacionPageModule)
  },
  


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
