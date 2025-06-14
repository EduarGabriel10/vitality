import { Component, OnInit } from '@angular/core';
import { IonRouterOutlet, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { Injectable } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {
  usuarioId: number = 0;
  nombreUsuario: string = '';
  ultimoDiagnostico: any = null;
  mostrarTodasRecomendaciones: boolean = false;
  mostrarDiagnosticoCompleto: boolean = false;
  recomendaciones: string[] = [];
  recomendacionPrincipal: string = '';

  constructor(
    private platform: Platform,
    private usuarioService: UsuarioService,
    private router: Router
  ) {
    this.platform.resume.subscribe(() => {
      this.obtenerDatos();
    });
  }

  ngOnInit() {
    this.cargarUsuario();
  }

    ionViewWillEnter() {
    this.obtenerDatos();
  }

  navigateToAnalysis() {
    this.router.navigate(['/principal/analisis'], { 
      queryParams: { refresh: new Date().getTime() },
      replaceUrl: true
    });
  }

  obtenerDatos() {
    this.usuarioService.obtenerConsultasPorUsuario(this.usuarioId).subscribe({
      next: (consultas: any[]) => {
        if (consultas && consultas.length > 0) {
          consultas.sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
          const ultimaConsulta = consultas[0];
          
          this.ultimoDiagnostico = {
            diagnostico: ultimaConsulta.resultadoIA || 'Sin diagnóstico disponible',
            estado: ultimaConsulta.estado || 'PENDIENTE',
            fecha: ultimaConsulta.fecha ? new Date(ultimaConsulta.fecha) : new Date(),
            porcentaje: ultimaConsulta.porcentaje ? parseInt(ultimaConsulta.porcentaje, 10) : 0,
            gravedad: ultimaConsulta.gravedad ? parseInt(ultimaConsulta.gravedad, 10) : 0,
            recomendaciones: Array.isArray(ultimaConsulta.recomendaciones) 
              ? ultimaConsulta.recomendaciones 
              : (ultimaConsulta.recomendaciones ? [ultimaConsulta.recomendaciones] : ['No hay recomendaciones disponibles']),
            diagnosticoMedico: ultimaConsulta.diagnosticoMedico || null
          };

          this.recomendaciones = Array.isArray(ultimaConsulta.recomendaciones) 
            ? ultimaConsulta.recomendaciones 
            : (ultimaConsulta.recomendaciones ? [ultimaConsulta.recomendaciones] : ['No hay recomendaciones disponibles']);
          
          this.recomendacionPrincipal = this.recomendaciones.length > 0 ? this.recomendaciones[0] : 'No hay recomendaciones disponibles';
        }
      },
      error: (error: any) => {
        console.error('Error al obtener las consultas:', error);
        this.ultimoDiagnostico = {
          diagnostico: 'Error al cargar el diagnóstico',
          estado: 'ERROR',
          fecha: new Date(),
          porcentaje: 0,
          gravedad: 0,
          recomendaciones: ['No se pudieron cargar las recomendaciones']
        };
        this.recomendaciones = ['Error al cargar las recomendaciones'];
        this.recomendacionPrincipal = 'Error al cargar las recomendaciones';
      }
    });
  }

  cargarUsuario() {
    const datos = localStorage.getItem('usuario');
    if (datos) {
      const usuario = JSON.parse(datos);
      this.nombreUsuario = usuario.nombre || 'Usuario';
      this.usuarioId = usuario.id;
    } else {
      console.error('No se encontró el usuario en localStorage');
    }
  }

  toggleRecomendaciones() {
    this.mostrarTodasRecomendaciones = !this.mostrarTodasRecomendaciones;
  }

  toggleDiagnosticoCompleto() {
    this.mostrarDiagnosticoCompleto = !this.mostrarDiagnosticoCompleto;
  }

  getEstadoColor(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'activo':
        return 'estado-activo';
      case 'en proceso':
        return 'estado-en-proceso';
      case 'completado':
        return 'estado-completado';
      default:
        return 'estado-inactivo';
    }
  }
}
