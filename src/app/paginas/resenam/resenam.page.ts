import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { MedicoService } from '../../services/medico.service';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
}

interface Resena {
  id: number;
  usuarioId: number;
  comentario: string;
  calificacion: number;
  fecha: string;
  usuario: Usuario;
}

@Component({
  selector: 'app-resenam',
  templateUrl: './resenam.page.html',
  styleUrls: ['./resenam.page.scss'],
  standalone: false
})
export class ResenamPage implements OnInit {
  allResenas: Resena[] = [];
  usuarioId: number = 0;
  comentario: string = '';
  calificacion: number = 0;
  usuarioActual: any = null;
  popoverOpen = false;
  popoverEvent: any;

  // Propiedades para el resumen de valoraciones
  calificacionPromedio: number = 0;
  totalResenas: number = 0;
  estrellasPorcentaje: number[] = [0, 0, 0, 0, 0]; // Porcentaje de cada estrella (1-5)

  constructor(
    private medicoService: MedicoService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.cargarUsuarioDeLocalStorage();
    this.obtenerResenas();
  }

  cargarUsuarioDeLocalStorage() {
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      this.usuarioActual = JSON.parse(usuarioString);
      this.usuarioId = this.usuarioActual.id;
      console.log('Usuario cargado:', this.usuarioActual);
    } else {
      console.warn('No hay usuario almacenado en localStorage');
      // Podrías redirigir al login aquí si es necesario
    }
  }

  obtenerResenas() {
    this.medicoService.obtenerResenas().subscribe({
      next: (response) => {
        this.allResenas = response.resenas;
        this.calcularEstadisticas();
      },
      error: (error) => {
        console.error('Error al obtener reseñas:', error);
        this.mostrarAlerta('Error', 'No se pudieron cargar las reseñas');
      }
    });
  }

  // Método para calcular estadísticas de valoraciones
  calcularEstadisticas() {
    if (this.allResenas.length === 0) {
      this.calificacionPromedio = 0;
      this.totalResenas = 0;
      this.estrellasPorcentaje = [0, 0, 0, 0, 0];
      return;
    }

    this.totalResenas = this.allResenas.length;

    // Calcular promedio de calificaciones
    const sumaCalificaciones = this.allResenas.reduce((suma, resena) => suma + resena.calificacion, 0);
    this.calificacionPromedio = parseFloat((sumaCalificaciones / this.totalResenas).toFixed(1));

    // Calcular porcentaje de cada estrella
    const conteoEstrellas = [0, 0, 0, 0, 0]; // Contador para estrellas 1-5

    this.allResenas.forEach(resena => {
      const indice = resena.calificacion - 1;
      if (indice >= 0 && indice < 5) {
        conteoEstrellas[indice]++;
      }
    });

    // Convertir a porcentajes
    this.estrellasPorcentaje = conteoEstrellas.map(count =>
      Math.round((count / this.totalResenas) * 100)
    );
  }

  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  // Obtener texto descriptivo basado en la calificación
  getRatingText(rating: number): string {
    switch (rating) {
      case 1: return 'Muy malo';
      case 2: return 'Malo';
      case 3: return 'Regular';
      case 4: return 'Bueno';
      case 5: return 'Excelente';
      default: return '';
    }
  }

  enviarResena() {
    if (this.calificacion === 0) {
      this.mostrarAlerta('Error', 'Por favor, selecciona una calificación');
      return;
    }

    if (!this.comentario.trim()) {
      this.mostrarAlerta('Error', 'Por favor, escribe un comentario');
      return;
    }

    // Crear fecha en zona horaria de Ecuador (UTC-5)
    const fechaEcuador = new Date();
    fechaEcuador.setHours(fechaEcuador.getHours() - 5); // Ajustar a UTC-5 (Ecuador)

    const nuevaResena = {
      comentario: this.comentario,
      calificacion: this.calificacion,
      usuarioId: this.usuarioId,
      fecha: fechaEcuador.toISOString()
    };

    console.log('Enviando reseña:', nuevaResena);

    this.medicoService.crearResena(nuevaResena).subscribe({
      next: () => {
        this.comentario = '';
        this.calificacion = 0;
        this.popoverOpen = false; // Cerrar el popover después de enviar
        this.obtenerResenas();
        this.mostrarAlerta('Éxito', 'Tu reseña ha sido publicada');
      },
      error: (error) => {
        console.error('Error al crear reseña:', error);
        this.mostrarAlerta('Error', 'No se pudo publicar tu reseña');
      }
    });
  }

  // Método para verificar si el usuario actual es el autor de la reseña
  esAutorDeResena(resena: Resena): boolean {
    return this.usuarioId === resena.usuarioId;
  }
  
  abrirPopover(ev: any) {
    this.popoverEvent = ev;
    this.popoverOpen = true;
  }
  
  seleccionarEstrella(valor: number) {
    this.calificacion = valor;
  }
  
  enviarResenaYCerrarPopover() {
    if (!this.comentario || this.calificacion === 0) {
      this.mostrarAlerta('Error', 'Por favor ingresa una calificación y un comentario.');
      return;
    }
  
    this.enviarResena();
  }
  
  // Generar un array con el número de estrellas llenas para el promedio
  get estrellasPromedio(): number[] {
    const estrellas = [];
    const entero = Math.floor(this.calificacionPromedio);
    const decimal = this.calificacionPromedio - entero;
    
    // Añadir estrellas completas
    for (let i = 0; i < entero; i++) {
      estrellas.push(1); // 1 = estrella completa
    }
    
    // Añadir media estrella si es necesario
    if (decimal >= 0.25 && decimal < 0.75) {
      estrellas.push(0.5); // 0.5 = media estrella
    } else if (decimal >= 0.75) {
      estrellas.push(1); // 1 = estrella completa
    }
    
    // Completar con estrellas vacías
    while (estrellas.length < 5) {
      estrellas.push(0); // 0 = estrella vacía
    }
    
    return estrellas;
  }
}