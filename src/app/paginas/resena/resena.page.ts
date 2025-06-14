import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { UsuarioService } from '../../services/usuario.service';

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
  selector: 'app-resena',
  templateUrl: './resena.page.html',
  styleUrls: ['./resena.page.scss'],
  standalone: false,
})
export class ResenaPage implements OnInit {
  allResenas: Resena[] = [];
  usuarioId: number = 0;
  comentario: string = '';
  calificacion: number = 0;
  usuarioActual: any = null;
  popoverOpen = false;
  popoverEvent: any;

  calificacionPromedio: number = 0;
  totalResenas: number = 0;
  estrellasPorcentaje: number[] = [0, 0, 0, 0, 0];
  usuarioYaReseno: boolean = false;

  constructor(
    private usuarioService: UsuarioService,
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
    this.usuarioService.obtenerResenas().subscribe({
      next: (response) => {
        this.allResenas = response.resenas;
        this.calcularEstadisticas();
        // Verificar si el usuario actual ya ha dejado una reseña
        if (this.usuarioId) {
          this.usuarioYaReseno = this.allResenas.some(resena => resena.usuarioId === this.usuarioId);
        }
      },
      error: (error) => {
        console.error('Error al obtener reseñas:', error);
        this.mostrarAlerta('Error', 'No se pudieron cargar las reseñas');
      }
    });
  }

  calcularEstadisticas() {
    if (this.allResenas.length === 0) {
      this.calificacionPromedio = 0;
      this.totalResenas = 0;
      this.estrellasPorcentaje = [0, 0, 0, 0, 0];
      return;
    }

    this.totalResenas = this.allResenas.length;

    const sumaCalificaciones = this.allResenas.reduce((suma, resena) => suma + resena.calificacion, 0);
    this.calificacionPromedio = parseFloat((sumaCalificaciones / this.totalResenas).toFixed(1));

    const conteoEstrellas = [0, 0, 0, 0, 0];

    this.allResenas.forEach(resena => {
      const indice = resena.calificacion - 1;
      if (indice >= 0 && indice < 5) {
        conteoEstrellas[indice]++;
      }
    });

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
    if (this.usuarioYaReseno) {
      this.mostrarAlerta('Error', 'Ya has dejado una reseña. Puedes eliminarla para crear una nueva.');
      this.popoverOpen = false;
      return;
    }

    if (this.calificacion === 0) {
      this.mostrarAlerta('Error', 'Por favor, selecciona una calificación');
      return;
    }

    if (!this.comentario.trim()) {
      this.mostrarAlerta('Error', 'Por favor, escribe un comentario');
      return;
    }

    const fechaEcuador = new Date();
    fechaEcuador.setHours(fechaEcuador.getHours() - 5); 

    const nuevaResena = {
      comentario: this.comentario,
      calificacion: this.calificacion,
      usuarioId: this.usuarioId,
      fecha: fechaEcuador.toISOString()
    };

    console.log('Enviando reseña:', nuevaResena);

    this.usuarioService.crearResena(nuevaResena).subscribe({
      next: () => {
        this.comentario = '';
        this.calificacion = 0;
        this.popoverOpen = false; 
        this.obtenerResenas();
        this.mostrarAlerta('Éxito', 'Tu reseña ha sido publicada');
      },
      error: (error) => {
        console.error('Error al crear reseña:', error);
        this.mostrarAlerta('Error', 'No se pudo publicar tu reseña');
      }
    });
  }

  eliminarResena(id: number) {
    this.usuarioService.eliminarResena(id, this.usuarioId).subscribe({
      next: () => {
        this.usuarioYaReseno = false;
        this.obtenerResenas();
        this.mostrarAlerta('Éxito', 'Reseña eliminada correctamente');
      },
      error: (error) => {
        console.error('Error al eliminar reseña:', error);
        this.mostrarAlerta('Error', 'No se pudo eliminar la reseña');
      }
    });
  }

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
  
  get estrellasPromedio(): number[] {
    const estrellas = [];
    const entero = Math.floor(this.calificacionPromedio);
    const decimal = this.calificacionPromedio - entero;
    
    for (let i = 0; i < entero; i++) {
      estrellas.push(1); // 1 = estrella completa
    }
    
    if (decimal >= 0.25 && decimal < 0.75) {
      estrellas.push(0.5); 
    } else if (decimal >= 0.75) {
      estrellas.push(1); 
    }
    
    while (estrellas.length < 5) {
      estrellas.push(0); 
    }
    
    return estrellas;
  }
}