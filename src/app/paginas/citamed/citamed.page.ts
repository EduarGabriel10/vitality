import { Component, OnInit } from '@angular/core';
import { LoadingController, AlertController } from '@ionic/angular';
import { MedicoService, Cita } from 'src/app/services/medico.service';

@Component({
  selector: 'app-citamed',
  templateUrl: './citamed.page.html',
  styleUrls: ['./citamed.page.scss'],
  standalone: false,
})
export class CitamedPage implements OnInit {
  citas: Cita[] = [];

  constructor(
    private medicoService: MedicoService,
    private loadingCtrl: LoadingController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.obtenerCitas();
  }

  async obtenerCitas() {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando citas...',
    });
    await loading.present();

    this.medicoService.obtenerCitas().subscribe({
      next: (data) => {
        this.citas = data;
        console.log('Citas obtenidas:', this.citas);
        loading.dismiss();
      },
      error: async (error) => {
        console.error('Error al obtener las citas:', error);
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'No se pudieron cargar las citas. Por favor, intente nuevamente.',
          buttons: ['OK']
        });
        await alert.present();
        loading.dismiss();
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Fecha no disponible';
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  }

  formatTime(dateString: string): string {
    if (!dateString) return '--:--';
    const options: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    };
    return new Date(dateString).toLocaleTimeString('es-ES', options);
  }

  getBadgeColor(estado: string): string {
    if (!estado) return 'medium';
    switch(estado.toLowerCase()) {
      case 'pendiente':
        return 'warning';
      case 'aceptada':
        return 'success';
      case 'rechazada':
      case 'cancelada':
        return 'danger';
      default:
        return 'medium';
    }
  }

  async actualizarEstado(citaId: number, event: any) {
    const nuevoEstado = event.detail.value;
    const loading = await this.loadingCtrl.create({
      message: 'Actualizando estado...',
    });
    await loading.present();

    this.medicoService.actualizarEstadoCita(citaId, nuevoEstado).subscribe({
      next: () => {
        const citaIndex = this.citas.findIndex(c => c.id === citaId);
        if (citaIndex > -1) {
          this.citas[citaIndex].estado = nuevoEstado;
        }
        loading.dismiss();
        this.mostrarMensaje(`Estado actualizado a: ${nuevoEstado}`, 'success');
      },
      error: async (error) => {
        console.error('Error al actualizar el estado:', error);
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'No se pudo actualizar el estado de la cita. Por favor, intente nuevamente.',
          buttons: ['OK']
        });
        await alert.present();
        loading.dismiss();
      }
    });
  }

  private async mostrarMensaje(mensaje: string, color: string) {
    const toast = document.createElement('ion-toast');
    toast.message = mensaje;
    toast.duration = 2000;
    toast.color = color;
    toast.position = 'top';
    
    document.body.appendChild(toast);
    await toast.present();
  }

  private async mostrarLoading(mensaje: string) {
    const loading = await this.loadingCtrl.create({
      message: mensaje,
      spinner: 'crescent',
      duration: 5000, // Tiempo máximo de espera
      cssClass: 'custom-loading'
    });
    
    await loading.present();
    return loading;
  }
}
