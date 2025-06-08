import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { AlertService } from 'src/app/services/alert.service';
import { MedicoService } from 'src/app/services/medico.service';
import { Auth, signInWithPopup, GoogleAuthProvider, UserCredential, sendPasswordResetEmail } from '@angular/fire/auth';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {
  datosUsuario: any;
  email: string = '';
  clave: string = '';
  passwordType: string = 'password';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private alertService: AlertService,
    private navCtrl: NavController,
    private medicoService: MedicoService,
    private alertController: AlertController,
    private auth: Auth,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit() {}

  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result: UserCredential = await signInWithPopup(this.auth, provider);

      if (!result.user) {
        throw new Error('No se pudo obtener información del usuario.');
      }

      const user = result.user;
      console.log("Usuario logeado con Google:", user);

      if (!user.email || !user.displayName) {
        throw new Error('No se pudo obtener correo o nombre del usuario.');
      }

      this.datosUsuario = {
        nombre: user.displayName,
        email: user.email
      };

      this.usuarioService.registerFromGoogle(this.datosUsuario).subscribe(
        (response) => {
          console.log('Usuario registrado:', response);
          localStorage.setItem('usuario', JSON.stringify(response.usuario)); // Guardar en localStorage
          console.log('Usuario registrado:', response);
          this.alertService.presentAlert('Registro exitoso', 'Usuario registrado exitosamente');
          this.navCtrl.navigateForward('/principal/dashboard');
        },
        (error) => {
          console.error('Error en el registro:', error);
          this.alertService.presentAlert('Error al registrarse', 'Error al registrarse. Intente de nuevo.');
        }
      );
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      this.alertService.presentAlert('Error al iniciar sesión', 'Error desconocido.');
    }
  }


  togglePasswordVisibility() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }

 async loginUsuario() {
  if (!this.email || !this.clave) {
    this.alertService.presentAlert('Error al iniciar sesión', 'Todos los campos son obligatorios');
    return;
  }

  // 1. Intentar login como MÉDICO
  const datosLogin = { email: this.email, contrasena: this.clave };

  this.medicoService.loginMedico(datosLogin).subscribe(
    (response) => {
      if (response.medico) {
        localStorage.setItem('usuario', JSON.stringify(response.medico));
        //imprime el usuario
        console.log('Usuario logeado:', response.medico);
        this.alertService.presentAlert('Inicio de sesión exitoso', 'Bienvenido, médico.');
        this.navCtrl.navigateForward('/principalm/dashboardm');
      } else {
        this.continuarConLoginUsuario();
      }
    },
    (error) => {
      // Si el login como médico falla, intentar como usuario
      this.continuarConLoginUsuario();
    }
  );
}

// Función auxiliar para continuar con el login normal de usuario
continuarConLoginUsuario() {
  if (this.clave === 'TempAIV-2025!') {
    this.usuarioService.getUsuarioPorEmail(this.email).subscribe(
      (response) => {
        if (!response.usuario) {
          this.alertService.presentAlert('Error al iniciar sesión', 'Usuario no encontrado con ese correo.');
          return;
        }

        localStorage.setItem('usuario', JSON.stringify(response.usuario));
        this.alertService.presentAlert('Acceso con contraseña temporal', 'Has iniciado sesión con acceso temporal.');
        this.navCtrl.navigateForward('/principal/usuario');
      },
      (error) => {
        console.error('Error al recuperar usuario:', error);
        this.alertService.presentAlert('Error', 'No se pudo recuperar el usuario. Inténtalo nuevamente.');
      }
    );
    return;
  }

  const datosUsuario = { email: this.email, contrasena: this.clave };

  this.usuarioService.loginUsuario(datosUsuario).subscribe(
    (response) => {
      if (!response.usuario) {
        this.alertService.presentAlert('Error al iniciar sesión', 'Usuario no encontrado. Verifica tus credenciales.');
        return;
      }

      localStorage.setItem('usuario', JSON.stringify(response.usuario));
      this.alertService.presentAlert('Inicio de sesión exitoso', 'Bienvenido');
      this.navCtrl.navigateForward('/principal/analisis');
    },
    (error) => {
      console.error('Error en el inicio de sesión:', error);
      this.alertService.presentAlert('Error al iniciar sesión', 'Ocurrió un problema. Intente nuevamente.');
    }
  );
}

  

  async recuperarContrasena() {
    if (!this.email) {
      this.alertService.presentAlert('Recuperar contraseña', 'Por favor ingresa tu correo electrónico.');
      return;
    }

    try {
      await sendPasswordResetEmail(this.auth, this.email);
      this.alertService.presentAlert('Recuperar contraseña', 'Se ha enviado un correo con una contraseña temporal.');
    } catch (error: any) {
      console.error('Error al enviar el correo de recuperación:', error);
      let mensaje = 'Ocurrió un error. Inténtalo de nuevo.';

      if (error.code === 'auth/user-not-found') {
        mensaje = 'No existe una cuenta asociada a ese correo.';
      } else if (error.code === 'auth/invalid-email') {
        mensaje = 'El correo electrónico ingresado no es válido.';
      }

      this.alertService.presentAlert('Recuperar contraseña', mensaje);
    }
  }
}
