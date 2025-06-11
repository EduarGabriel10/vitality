import { Component, OnInit } from '@angular/core';
import { HorarioService } from 'src/app/services/horario.service';
import { AlertController, ToastController, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-horario',
  templateUrl: './horario.page.html',
  styleUrls: ['./horario.page.scss'],
  standalone: false
})
export class HorarioPage implements OnInit {
  horarios: any[] = [];
  error = '';
  isLoading = true;

  fechaBase: string | null = null;
  horaInicio: string | null = null;
  horaFin: string | null = null;
  fechaMinima: string;

  constructor(
    private horarioService: HorarioService,
    private alertController: AlertController,
    private toastController: ToastController,
    private modalCtrl: ModalController
  ) {
    // Establecer fecha mínima como hoy
    this.fechaMinima = new Date().toISOString().split('T')[0];
  }

  ngOnInit() {
    this.cargarHorarios();
    this.inicializarHoras();
  }

  inicializarHoras() {
    // Valores predeterminados más útiles
    const hoy = new Date().toISOString().split('T')[0];
    this.horaInicio = `${hoy}T08:00:00.000Z`;
    this.horaFin = `${hoy}T17:00:00.000Z`;
  }

  cargarHorarios() {
    this.isLoading = true;
    this.error = '';
    
    this.horarioService.getHorarios().subscribe({
      next: (data) => {
        this.horarios = data || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar horarios:', err);
        this.error = 'Error al cargar los horarios. Intenta nuevamente.';
        this.isLoading = false;
        this.mostrarToast('Error al cargar los horarios', 'danger');
      }
    });
  }

  async crearHorario() {
    // Validaciones
    if (!this.validarFormulario()) {
      return;
    }

    try {
      const fecha = new Date(this.fechaBase!);
      const diaSemana = this.obtenerNombreDiaSemana(fecha);

      // Validar que la hora de fin sea posterior a la de inicio
      if (!this.validarHoras()) {
        this.error = 'La hora de fin debe ser posterior a la hora de inicio.';
        this.mostrarToast('Horario inválido', 'warning');
        return;
      }

      const horaInicioFinal = this.combinarFechaYHora(this.fechaBase!, this.horaInicio!);
      const horaFinFinal = this.combinarFechaYHora(this.fechaBase!, this.horaFin!);

      const nuevoHorario = {
        diaSemana,
        horaInicio: horaInicioFinal,
        horaFin: horaFinFinal,
        medicoId: 1 // TODO: Obtener ID real del médico autenticado
      };

      await this.guardarHorario(nuevoHorario);
      
    } catch (error) {
      console.error('Error al crear horario:', error);
      this.error = 'Error inesperado al crear el horario.';
      this.mostrarToast('Error al guardar', 'danger');
    }
  }

  private validarFormulario(): boolean {
    if (!this.fechaBase || !this.horaInicio || !this.horaFin) {
      this.error = 'Por favor completa todos los campos requeridos.';
      this.mostrarToast('Campos incompletos', 'warning');
      return false;
    }
    return true;
  }

  private validarHoras(): boolean {
    if (!this.horaInicio || !this.horaFin) return false;
    
    const inicio = new Date(this.horaInicio);
    const fin = new Date(this.horaFin);
    
    return fin > inicio;
  }

  private async guardarHorario(horario: any) {
    return new Promise((resolve, reject) => {
      this.horarioService.createHorario(horario).subscribe({
        next: (response) => {
          this.mostrarToast('Horario guardado exitosamente', 'success');
          this.limpiarFormulario();
          this.cargarHorarios();
          resolve(response);
        },
        error: (err) => {
          console.error('Error al guardar horario:', err);
          this.error = 'Error al guardar el horario. Verifica los datos e intenta nuevamente.';
          reject(err);
        }
      });
    });
  }

  async eliminarHorario(horarioId: number) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar este horario?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.confirmarEliminacion(horarioId);
          }
        }
      ]
    });

    await alert.present();
  }

  private confirmarEliminacion(horarioId: number) {
    this.horarioService.deleteHorario(horarioId).subscribe({
      next: () => {
        this.mostrarToast('Horario eliminado', 'success');
        this.cargarHorarios();
      },
      error: (err) => {
        console.error('Error al eliminar horario:', err);
        this.mostrarToast('Error al eliminar el horario', 'danger');
      }
    });
  }

  formatearHora(hora: string | null): string {
    if (!hora) return '';
    const date = new Date(hora);
    return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  formatearFecha(fecha: string | null): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    });
  }

  async abrirCalendario() {
    const alert = await this.alertController.create({
      header: 'Seleccionar fecha',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aceptar',
          handler: (data) => {
            this.fechaBase = data.fecha;
          }
        }
      ],
      inputs: [
        {
          name: 'fecha',
          type: 'date',
          value: this.fechaBase || new Date().toISOString().split('T')[0],
          min: this.fechaMinima
        }
      ]
    });

    await alert.present();
  }

  async abrirSelectorHora(tipo: 'inicio' | 'fin') {
    const alert = await this.alertController.create({
      header: `Seleccionar hora ${tipo === 'inicio' ? 'de inicio' : 'de fin'}`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aceptar',
          handler: (data) => {
            // Asegurarse de que la hora tenga el formato correcto
            const horaSeleccionada = data.hora || '00:00';
            const fechaActual = new Date().toISOString().split('T')[0];
            const fechaHora = new Date(`${fechaActual}T${horaSeleccionada}`);
            
            if (tipo === 'inicio') {
              this.horaInicio = fechaHora.toISOString();
            } else {
              this.horaFin = fechaHora.toISOString();
            }
          }
        }
      ],
      inputs: [
        {
          name: 'hora',
          type: 'time',
          value: this.obtenerHoraFormateada(tipo === 'inicio' ? this.horaInicio : this.horaFin)
        }
      ]
    });

    await alert.present();
  }

  private obtenerHoraFormateada(fechaISO: string | null): string {
    if (!fechaISO) return '';
    const fecha = new Date(fechaISO);
    return fecha.toTimeString().slice(0, 5);
  }

  private limpiarFormulario() {
    this.fechaBase = null;
    this.horaInicio = null;
    this.horaFin = null;
    this.error = '';
    this.inicializarHoras();
  }

  private async mostrarToast(mensaje: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      position: 'top',
      color: color,
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  combinarFechaYHora(fechaISO: string, horaISO: string): string {
    try {
      const fecha = new Date(fechaISO);
      const hora = new Date(horaISO);

      fecha.setHours(hora.getHours(), hora.getMinutes(), 0, 0);
      return fecha.toISOString();
    } catch (error) {
      console.error('Error al combinar fecha y hora:', error);
      return new Date().toISOString();
    }
  }

  obtenerNombreDiaSemana(fecha: Date): string {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dias[fecha.getUTCDay()];
  }
}