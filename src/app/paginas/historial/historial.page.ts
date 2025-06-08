import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  standalone: false
})
export class HistorialPage implements OnInit {

  consultas: any[] = [];
  ordenDescendente: boolean = true;

  constructor(
    private usuarioService: UsuarioService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
    const usuarioData = localStorage.getItem('usuario');
    if (usuarioData) {
      const usuario = JSON.parse(usuarioData);
      const userId = usuario.id;

      this.usuarioService.obtenerConsultasPorUsuario(userId).subscribe({
        next: (data) => {
          this.consultas = data.map(consulta => ({
            ...consulta,
            resultadoIAParsed: this.parseResultadoIA(consulta.resultadoIA)
          }));

          this.ordenarConsultas();
          console.log(this.consultas);
        },
        error: async (err) => {
          console.error('Error al obtener consultas:', err);
          const alert = await this.alertController.create({
            header: 'Error',
            message: 'No se pudieron cargar las consultas.',
            buttons: ['OK']
          });
          await alert.present();
        }
      });
    }
  }

  parseResultadoIA(resultadoIA: string): any {
    if (typeof resultadoIA === 'object' && resultadoIA !== null) {
      return resultadoIA;
    }
    
    if (typeof resultadoIA === 'string') {
      try {
        const limpio = resultadoIA.replace(/```json|```/g, '').trim();
        return JSON.parse(limpio);
      } catch (error) {
        console.warn('No se pudo parsear resultadoIA:', resultadoIA);
        return { diagnostico: resultadoIA, recomendaciones: [] };
      }
    }
    
    return { diagnostico: 'Sin diagnóstico disponible', recomendaciones: [] };
  }

  alternarOrden() {
    this.ordenDescendente = !this.ordenDescendente;
    this.ordenarConsultas();
  }

  ordenarConsultas() {
    this.consultas.sort((a, b) => {
      const fechaA = new Date(a.fecha).getTime();
      const fechaB = new Date(b.fecha).getTime();
      return this.ordenDescendente ? fechaB - fechaA : fechaA - fechaB;
    });
  }

  getRecomendaciones(consulta: any): string[] {
    if (!consulta) return [];
    
    if (consulta.resultadoIAParsed?.recomendaciones) {
      return Array.isArray(consulta.resultadoIAParsed.recomendaciones) 
        ? consulta.resultadoIAParsed.recomendaciones.filter(Boolean) 
        : [String(consulta.resultadoIAParsed.recomendaciones)];
    }
    
    if (consulta.recomendaciones) {
      return Array.isArray(consulta.recomendaciones) 
        ? consulta.recomendaciones.filter(Boolean)
        : [String(consulta.recomendaciones)];
    }
    
    return [];
  }

  getBadgeColor(estado: string): string {
    switch (estado?.toUpperCase()) {
      case 'PENDIENTE':
        return 'warning';
      case 'COMPLETADO':
        return 'success';
      case 'CANCELADO':
        return 'danger';
      default:
        return 'medium';
    }
  }

  getProgressBarColor(porcentaje: number): string {
    if (porcentaje >= 70) return 'danger';
    if (porcentaje >= 40) return 'warning';
    return 'success';
  }

  getSeverityColor(gravedad: number): string {
    if (gravedad >= 70) return 'danger';
    if (gravedad >= 40) return 'warning';
    return 'success';
  }

  getSeverityText(gravedad: number): string {
    if (gravedad >= 70) return 'Alta gravedad';
    if (gravedad >= 40) return 'Gravedad moderada';
    return 'Baja gravedad';
  }

  getConsultasRecientes(): number {
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth();
    const anioActual = fechaActual.getFullYear();
    
    return this.consultas.filter(consulta => {
      const fechaConsulta = new Date(consulta.fecha);
      return fechaConsulta.getMonth() === mesActual && fechaConsulta.getFullYear() === anioActual;
    }).length;
  }

  trackByConsulta(index: number, consulta: any): any {
    return consulta.id;
  }

  getSeverityIconColor(gravedad: number): string {
    if (gravedad >= 70) return 'danger';
    if (gravedad >= 40) return 'warning';
    return 'success';
  }

  agruparPorMes(consultas: any[]): { mes: string, consultas: any[] }[] {
    const grupos: { [key: string]: any[] } = {};
    
    const consultasOrdenadas = [...consultas].sort((a, b) => {
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    });
    
    consultasOrdenadas.forEach(consulta => {
      const fecha = new Date(consulta.fecha);
      const mes = fecha.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
      
      if (!grupos[mes]) {
        grupos[mes] = [];
      }
      
      grupos[mes].push(consulta);
    });
    
    return Object.keys(grupos).map(mes => ({
      mes: this.capitalizeFirstLetter(mes),
      consultas: grupos[mes]
    }));
  }
  
  private capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  async eliminarConsulta(consultaId: string, event: Event) {
    event.stopPropagation(); 
    
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar esta consulta? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Eliminar',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Eliminando consulta...',
              spinner: 'crescent'
            });
            await loading.present();

            try {
              await this.usuarioService.eliminarConsulta(consultaId).toPromise();
              
              // Eliminar la consulta del array local
              this.consultas = this.consultas.filter(c => c.id !== consultaId);
              
              // Mostrar mensaje de éxito
              const successAlert = await this.alertController.create({
                header: 'Éxito',
                message: 'Consulta eliminada correctamente',
                buttons: ['Aceptar']
              });
              await successAlert.present();
              
            } catch (error) {
              console.error('Error al eliminar la consulta:', error);
              const alertError = await this.alertController.create({
                header: 'Error',
                message: 'No se pudo eliminar la consulta. Por favor, inténtalo de nuevo.',
                buttons: ['Aceptar']
              });
              await alertError.present();
            } finally {
              await loading.dismiss();
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
