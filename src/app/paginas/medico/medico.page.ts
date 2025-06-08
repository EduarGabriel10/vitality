import { Component, OnInit } from '@angular/core';
import { UsuarioService } from 'src/app/services/usuario.service';
import { AlertService } from 'src/app/services/alert.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-medico',
  templateUrl: './medico.page.html',
  styleUrls: ['./medico.page.scss'],
  standalone: false
})
export class MedicoPage implements OnInit {
 usuario: any = null;
  editarModo: boolean = false;
  passwordType: string = 'password';  // Definir tipo de contraseña para el toggle

  constructor(
    private usuarioService: UsuarioService,
    private alertController: AlertController,
    private alertservice: AlertService,
  ) {}

  ngOnInit() {
    this.obtenerUsuario();
  }

  obtenerUsuario() {
    const datos = localStorage.getItem('usuario');
    if (datos) {
      this.usuario = JSON.parse(datos);
    }
  }

  editarUsuario() {
    this.editarModo = true;
  }

  cancelarEdicion() {
    this.editarModo = false;
    this.obtenerUsuario(); // Recarga los datos del usuario
  }


guardarEdiciones() {
  const medico = this.usuario;
  const id = medico.id;

  // Asegúrate de excluir campos no permitidos si es necesario
  const datosActualizados = {
    nombre: medico.nombre,
    telefono: medico.telefono,
    especialidad: medico.especialidad,
    contrasena: medico.contrasena, // solo si se va a cambiar
  };

  this.usuarioService.actualizarMedico(id, datosActualizados).subscribe({
    next: (respuesta) => {
      this.alertservice.presentAlert('Éxito', 'Datos actualizados correctamente.');
      localStorage.setItem('usuario', JSON.stringify(respuesta.usuario)); // Actualiza en local
      this.editarModo = false;
    },
    error: (err) => {
      this.alertservice.presentAlert('Error', 'No se pudo actualizar el usuario.');
      console.error(err);
    },
  });
}


  togglePasswordVisibility() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
    window.location.href = '/login'; // Redirige al login
    //alerta que se cierra sesion
    this.alertservice.presentAlert('Sesión cerrada', 'Has cerrado la sesión.');

  }
  
}
