import { Component } from '@angular/core';
import { UsuarioService } from 'src/app/services/usuario.service'; // Importa el servicio
import { NavController } from '@ionic/angular';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-registrarse',
  templateUrl: './registrarse.page.html',
  styleUrls: ['./registrarse.page.scss'],
  standalone: false
})
export class RegistrarsePage  {
  nombre: string = '';
  email: string = '';
  clave: string = '';
  telefono: string = '';
  showPassword: boolean = false;
  passwordType: string = 'password';

  constructor(
    private usuarioService: UsuarioService, // Inyecta el servicio
    private navCtrl: NavController,
    private alertService: AlertService
  ) {}

  registrarUsuario() {
    if (!this.nombre || !this.email || !this.clave || !this.telefono) {
      this.alertService.presentAlert('Error', 'Todos los campos son obligatorios');
      return;
    }

    // Cifrado de la contraseña antes de enviarla

    const datosUsuario = {
      nombre: this.nombre,
      email: this.email,
      contrasena: this.clave,
      telefono: this.telefono
    };

    // Llama al servicio para registrar al usuario
    this.usuarioService.registrarUsuario(datosUsuario).subscribe(
      (response) => {
        console.log('Usuario registrado:', response);
        this.alertService.presentAlert('Registro exitoso', 'Usuario registrado exitosamente');
        this.navCtrl.navigateForward('/login');  // Redirige al login
      },
      (error) => {
        console.error('Error en el registro:', error);
        this.alertService.presentAlert('Error', 'Error al registrarse. Intente de nuevo.');
      }
    );
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
    this.passwordType = this.showPassword ? 'text' : 'password';
  }
}
