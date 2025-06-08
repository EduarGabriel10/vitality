import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MedicoService } from '../../services/medico.service';

@Component({
  selector: 'app-datosm',
  templateUrl: './datosm.page.html',
  styleUrls: ['./datosm.page.scss'],
  standalone: false
})
export class DatosmPage implements OnInit {
  consulta: any;
  resultadoIA: any;
  respuestas: any[] = [];
  usuario: any;
  recomendaciones: string[] = [];
  porcentaje: string = '';
  gravedad: string = '';
  
  // Hacer accesible la función parseInt en la plantilla
  parseInt = parseInt;

  constructor(
    private route: ActivatedRoute,
    private medicoService: MedicoService
  ) {}
  
  // Obtener el color de la barra de progreso según el porcentaje
  getProgressBarColor(percentage: number): string {
    if (percentage >= 70) return 'danger';
    if (percentage >= 40) return 'warning';
    return 'success';
  }
  
  // Obtener el color según el nivel de gravedad
  getSeverityColor(severity: number): string {
    if (severity >= 70) return 'danger';
    if (severity >= 40) return 'warning';
    return 'success';
  }
  
  // Obtener texto descriptivo para el nivel de gravedad
  getSeverityText(severity: number): string {
    if (severity >= 70) return 'Alta';
    if (severity >= 40) return 'Moderada';
    return 'Baja';
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.medicoService.obtenerConsultaPorId(parseInt(id)).subscribe({
        next: (consulta) => {
          this.consulta = consulta;
          this.usuario = consulta.usuario;
          this.respuestas = consulta.respuestas || [];
          this.recomendaciones = consulta.recomendaciones || [];
          this.porcentaje = consulta.porcentaje || '0';
          this.gravedad = consulta.gravedad || '0';
          
          // Asignar el resultadoIA directamente
          this.resultadoIA = {
            diagnostico: consulta.resultadoIA || 'Diagnóstico no disponible'
          };
        },
        error: (error) => {
          console.error('Error al cargar la consulta:', error);
        }
      });
    }
  }
}
