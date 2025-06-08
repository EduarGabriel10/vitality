import { Component, OnInit } from '@angular/core';
import { UsuarioService } from 'src/app/services/usuario.service';
import { AlertService } from 'src/app/services/alert.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.page.html',
  styleUrls: ['./usuario.page.scss'],
  standalone: false,
})
export class UsuarioPage implements OnInit {
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
    this.usuarioService.actualizarUsuario(this.usuario).subscribe(response => {
      console.log('Usuario actualizado', response);
      this.alertservice.presentAlert('Actualización exitosa', 'Los cambios se han guardado correctamente.');
      localStorage.setItem('usuario', JSON.stringify(response.usuario));
      this.editarModo = false;
    }, error => {
      console.error('Error al actualizar usuario', error);
      this.alertservice.presentAlert('Error al actualizar usuario', 'Hubo un error al actualizar los datos.');
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
