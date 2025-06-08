import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { QuestionsService } from 'src/app/services/questions.service';
import { MedicoService } from 'src/app/services/medico.service';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, 
  IonCardContent, IonGrid, IonRow, IonCol, IonLabel, IonBadge, IonList, IonItem, 
  IonButtons, IonButton, IonIcon,
} from '@ionic/angular/standalone';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs, 'es');

interface Pregunta {
  id: number;
  text: string;
}

interface ResumenSintoma {
  tipoRespuesta: number;
  conteos: { [key: string]: number };
}

@Component({
  selector: 'app-dashboardm',
  templateUrl: './dashboardm.page.html',
  styleUrls: ['./dashboardm.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, 
    IonCardContent, IonGrid, IonRow, IonCol, IonBadge, IonButton, IonIcon,
  ]
})
export class DashboardmPage implements OnInit, OnDestroy {
  resumenGeneral: any = {};
  respuestaDetalle: any[] = [];
  isLoading = true;
  error: string | null = null;
  gravedad: string | null = null;

  preguntasDisponibles: Pregunta[] = [];
  resumenPorSintoma: { [key: number]: ResumenSintoma } = {};
  selectedQuestionId: number | null = null;
  dataSubscription: Subscription | undefined;
  
  // Filtros
  filtroEstado: string = 'todos';
  filtroMes: string = 'todos';
  consultasOriginales: any[] = [];
  meses: {value: string, nombre: string}[] = [];

  // Global function references for template
  isNaN = isNaN;
  parseInt = parseInt;

  constructor(
    private router: Router,
    private questionsService: QuestionsService,
    private medicoService: MedicoService
  ) {
    this.loadQuestions();
  }

  ngOnInit() {
    this.obtenerDetallesRespuestas();
    this.loadSummaryData();
  }

  ngOnDestroy() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }
  obtenerDetallesRespuestas() {
    this.isLoading = true;
    this.error = null;
  
    this.medicoService.obtenerConsultas().subscribe({
      next: (respuesta) => {
        try {
          const respuestas = respuesta.consultas || [];
          const estadisticas = respuesta.estadisticas || {};
  
          this.consultasOriginales = respuestas.map((r: any) => {
            const fecha = new Date(r.fecha);
            const mes = fecha.toLocaleString('es-ES', { month: 'long' });
  
            return {
              ...r,
              nombreUsuario: r.usuario?.nombre || 'Sin nombre',
              diagnostico: r.resultadoIA || 'Diagnóstico no disponible',
              gravedad: r.gravedad || 'Gravedad no disponible', 
              mes: mes,
              mesNumero: fecha.getMonth() + 1,
              anio: fecha.getFullYear(),
              fechaFormateada: fecha.toLocaleDateString('es-ES')
            };
          });
  
          // Aquí imprimes en consola el nombre de usuario de cada consulta
          this.consultasOriginales.forEach(c => console.log('Nombre usuario:', c.nombreUsuario));
  
          this.generarListaMeses();
          this.aplicarFiltros();
  
          this.resumenGeneral = {
            totalConsultas: estadisticas.totalConsultas || 0,
            totalPendientes: estadisticas.totalPendientes || 0,
            totalDiagnosticadas: estadisticas.totalDiagnosticadas || 0
          };
        } catch (error) {
          console.error('Error al procesar la respuesta:', error);
          this.error = 'Error al procesar los datos.';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener detalles:', error);
        this.error = 'No se pudieron cargar los datos.';
        this.isLoading = false;
      }
    });
  }
  

  verConsulta(consulta: any) {
    this.router.navigate(['principal/datosm', consulta.id]);
  }
  
  // Métodos para manejar cambios en los filtros
  onEstadoChange(event: any) {
    this.filtroEstado = event.detail.value;
    this.aplicarFiltros();
  }
  
  onMesChange(event: any) {
    this.filtroMes = event.detail.value;
    this.aplicarFiltros();
  }

  agregarDiagnostico(consulta: any) {
    this.router.navigate(['principal/diagmedico', consulta.id]);
  }

  editarConsulta(consulta: any) {
    console.log('Editar consulta:', consulta.id);
  }

  eliminarConsulta(consulta: any) {
    if (confirm(`¿Está seguro de que desea eliminar la consulta de ${consulta.usuario}?`)) {
      this.medicoService.eliminarConsulta(consulta.id).subscribe({
        next: () => {
          this.respuestaDetalle = this.respuestaDetalle.filter(r => r.id !== consulta.id);
        },
        error: (error) => {
          console.error('Error al eliminar la consulta:', error);
        }
      });
    }
  }

  private loadQuestions(): void {
    try {
      this.preguntasDisponibles = this.questionsService.getQuestions()
        .filter(q => q.id !== 1)
        .map(q => ({ id: q.id, text: q.text }));
      
      if (this.preguntasDisponibles.length > 0) {
        this.selectedQuestionId = this.preguntasDisponibles[0].id;
      }
    } catch (error) {
      console.error('Error al cargar las preguntas:', error);
      this.error = 'No se pudieron cargar las preguntas.';
    }
  }

  generarListaMeses() {
    const mesesUnicos = new Set<string>();
    const mesesData: {value: string, nombre: string}[] = [];
    
    this.consultasOriginales.forEach(consulta => {
      const clave = `${consulta.mesNumero}-${consulta.anio}`;
      if (!mesesUnicos.has(clave)) {
        mesesUnicos.add(clave);
        mesesData.push({
          value: clave,
          nombre: `${consulta.mes.charAt(0).toUpperCase() + consulta.mes.slice(1)} ${consulta.anio}`
        });
      }
    });

    // Ordenar por fecha (más reciente primero)
    this.meses = mesesData.sort((a, b) => {
      const [mesA, anioA] = a.value.split('-').map(Number);
      const [mesB, anioB] = b.value.split('-').map(Number);
      return anioB - anioA || mesB - mesA;
    });
  }

  aplicarFiltros() {
    let consultasFiltradas = [...this.consultasOriginales];
    
    // Filtrar por estado
    if (this.filtroEstado !== 'todos') {
      consultasFiltradas = consultasFiltradas.filter(
        c => c.estado.toLowerCase() === this.filtroEstado.toLowerCase()
      );
    }
    
    // Filtrar por mes
    if (this.filtroMes !== 'todos') {
      const [mes, anio] = this.filtroMes.split('-').map(Number);
      consultasFiltradas = consultasFiltradas.filter(
        c => c.mesNumero === mes && c.anio === anio
      );
    }
    
    this.respuestaDetalle = consultasFiltradas.map((r: any) => {
      let diagnostico = 'Diagnóstico no disponible';
      if (r.resultadoIA) {
        diagnostico = r.resultadoIA;
        let gravedad = 'Gravedad no disponible';
        if (r.gravedad) {
          gravedad = r.gravedad;
        }
      }

      return {
        usuario: r.usuario,
        diagnostico,
        gravedad: r.gravedad,
        fecha: r.fecha,
        estado: r.estado,
        id: r.id
      };
    });
  }
  
  limpiarFiltros() {
    this.filtroEstado = 'todos';
    this.filtroMes = 'todos';
    this.aplicarFiltros();
  }

  public loadSummaryData(): void {
    this.isLoading = true;
    this.error = null;

    this.dataSubscription = this.medicoService.obtenerResumenSintomas().subscribe({
      next: (data) => {
        this.resumenPorSintoma = data.resumenPorSintoma || {};
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar el resumen:', error);
        this.error = 'Error al cargar el resumen.';
        this.isLoading = false;
      }
    });
  }

  trackByConsultation(index: number, item: any): number {
    return item.id;
  }

  
}
