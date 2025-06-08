import { Component, OnInit } from '@angular/core';
import { HorarioService } from 'src/app/services/horario.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-cita',
  templateUrl: './cita.page.html',
  styleUrls: ['./cita.page.scss'],
  standalone: false
})
export class CitaPage implements OnInit {
  datosUsuario: any;
  segmentoSeleccionado: string = 'horarios'; // valor por defecto
  citas: any[] = []; // simulación de citas
  horarios: any[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  selectedHorario: any = null;
  isModalOpen = false;

  constructor(
    private horarioService: HorarioService,
    private usuarioService: UsuarioService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) { 
    // Load initial data
    this.cargarCitas();
  }

  ngOnInit() {
    this.cargarHorarios();
    this.cargarUsuario();
  }


  //cargar usuario desde local
  cargarUsuario() {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      this.datosUsuario = JSON.parse(usuario);
      console.log(this.datosUsuario);
    }
  }
  cargarHorarios() {
    this.horarioService.getHorarios().subscribe({
      next: (data) => {
        this.horarios = data;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Error al cargar los horarios.';
        this.isLoading = false;
      }
    });
  }

  agregarCita(horario: any) {
    // Lógica para agendar cita
  }
  
  tieneSlotsDisponibles(horario: any): boolean {
    return horario.slots && horario.slots.some((slot: any) => slot.disponible);
  }

  async mostrarSlotsDisponibles(horario: any) {
    this.selectedHorario = horario;
    
    const inputs = horario.slots.map((slot: any) => ({
      name: 'slot',
      type: 'radio',
      label: `${new Date(slot.horaInicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - ${new Date(slot.horaFin).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`,
      value: slot,
      disabled: !slot.disponible
    }));

    const alert = await this.alertController.create({
      header: 'Selecciona un horario',
      inputs: inputs,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Seleccionar',
          handler: (selectedSlot) => {
            if (selectedSlot) {
              this.seleccionarSlot(selectedSlot);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async verDetalleHorario(horario: any) {
    // Mostrar detalles del horario si es necesario
    console.log('Detalles del horario:', horario);
  }

  onWillDismiss(event: any) {
    this.isModalOpen = false;
  }

  async seleccionarSlot(slot: any) {
    console.log('Slot seleccionado:', slot);
    
    const loading = await this.loadingController.create({
      message: 'Agendando cita...',
    });
    await loading.present();

    // Crear el objeto de la cita según el formato requerido
    const citaData = {
      fechaHora: slot.horaInicio,
      estado: 'ACEPTADA',
      usuarioId: this.datosUsuario.id, // Usar el ID del usuario autenticado
      medicoId: this.selectedHorario.medicoId,
      slotId: slot.id
    };

    try {
      // Usar el servicio para agendar la cita
      await this.usuarioService.agendarCita(citaData).toPromise();
      
      await loading.dismiss();
      
      const alert = await this.alertController.create({
        header: '¡Éxito!',
        message: 'La cita se ha agendado correctamente.',
        buttons: [{
          text: 'Aceptar',
          handler: () => {
            // Recargar las citas después de agendar
            this.cargarCitas();
          }
        }]
      });
      
      await alert.present();
      
      // Cambiar a la pestaña de citas agendadas
      this.segmentoSeleccionado = 'citas';
      
    } catch (error) {
      console.error('Error al agendar cita:', error);
      await loading.dismiss();
      
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No se pudo agendar la cita. Por favor, intente nuevamente.',
        buttons: ['OK']
      });
      
      await alert.present();
    }
    
    this.isModalOpen = false;
  }

  // Cambiar entre pestañas
  segmentChanged(event: any) {
    this.segmentoSeleccionado = event.detail.value;
    if (this.segmentoSeleccionado === 'citas') {
      this.cargarCitas();
    }
  }

  async cargarCitas() {
    const loading = await this.loadingController.create({
      message: 'Cargando citas...',
    });
    await loading.present();

    try {
      const response = await this.usuarioService.obtenerCitasPorUsuario(this.datosUsuario.id).toPromise();
      this.citas = response || [];
    } catch (error) {
      console.error('Error al cargar citas:', error);
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No se pudieron cargar las citas. Por favor, intente nuevamente.',
        buttons: ['OK']
      });
      await alert.present();
      this.citas = [];
    } finally {
      await loading.dismiss();
    }
  }

  async agendarCita(horario: any) {
    if (!horario.disponible) return;
    
    // Mostrar el modal con los slots disponibles
    this.verDetalleHorario(horario);
  }

  async confirmarAgendamiento(slot: any) {
    // Mostrar loading
    const loading = await this.loadingController.create({
      message: 'Agendando cita...',
    });
    await loading.present();

    // Crear el objeto de la cita
    const citaData = {
      fechaHora: slot.horaInicio,
      usuarioId: this.datosUsuario.id,
      medicoId: this.selectedHorario.medicoId,
      horarioId: this.selectedHorario.id,
      estado: 'PENDIENTE',
      slotId: slot.id
    };

    try {
      // Usar el servicio para agendar la cita
      await this.usuarioService.agendarCita(citaData).toPromise();
      
      await loading.dismiss();
      
      const alert = await this.alertController.create({
        header: '¡Éxito!',
        message: 'La cita se ha agendado correctamente.',
        buttons: ['OK']
      });
      
      await alert.present();
      
      // Actualizar la lista de horarios
      this.cargarHorarios();
      
    } catch (error: any) {
      console.error('Error al agendar cita:', error);
      await loading.dismiss();
      
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No se pudo agendar la cita. Por favor, intente nuevamente.',
        buttons: ['OK']
      });
      
      await alert.present();
    }
  }

  async verDetalleCita(cita: any) {
    const alert = await this.alertController.create({
      header: 'Detalles de la cita',
      subHeader: `Dr(a). ${cita.medico?.nombre}`,
      message: `
        <p><strong>Especialidad:</strong> ${cita.medico?.especialidad || 'No especificada'}</p>
        <p><strong>Fecha:</strong> ${new Date(cita.fechaHora).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p><strong>Hora:</strong> ${new Date(cita.fechaHora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
        <p><strong>Estado:</strong> ${cita.estado}</p>
        <p><strong>Día de atención:</strong> ${cita.horario?.diaSemana || 'No especificado'}</p>
        <p><strong>Horario de atención:</strong> ${cita.horario ? 
          `${new Date(cita.horario.horaInicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - ${new Date(cita.horario.horaFin).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}` : 
          'No especificado'}</p>
      `,
      buttons: ['Cerrar'],
      cssClass: 'custom-alert'
    });
    await alert.present();
  }

  async cancelarCita(cita: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar cancelación',
      message: '¿Está seguro de que desea cancelar esta cita?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Sí, cancelar',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Cancelando cita...',
            });
            await loading.present();

            try {
              // Llamada al servicio para cancelar la cita
              await this.usuarioService.cancelarCita(cita.id).toPromise();
              
              // Mostrar mensaje de éxito
              const successAlert = await this.alertController.create({
                header: '¡Listo!',
                message: 'La cita ha sido cancelada correctamente.',
                buttons: ['OK']
              });
              
              // Actualizar la lista de citas
              await this.cargarCitas();
              await loading.dismiss();
              await successAlert.present();
              
            } catch (error: any) {
              console.error('Error al cancelar cita:', error);
              const errorAlert = await this.alertController.create({
                header: 'Error',
                message: 'No se pudo cancelar la cita. Por favor, intente nuevamente.',
                buttons: ['OK']
              });
              await loading.dismiss();
              await errorAlert.present();
            }
          }
        }
      ]
    });
    await alert.present();
  }
}
