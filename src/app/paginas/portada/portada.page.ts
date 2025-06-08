import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-portada',
  templateUrl: './portada.page.html',
  styleUrls: ['./portada.page.scss'],
  standalone: false
})
export class PortadaPage implements OnInit {

  constructor(
    private navCtrl: NavController,
    private router: Router
  ) { 

  }

  ngOnInit() {
    // Código de inicialización si es necesario
  }

  // Método para navegar a la página de creación de cuenta
  goToCreateAccount() {
    console.log('Navegando a creación de cuenta');
    // Usa uno de estos métodos de navegación según tu configuración de rutas
    // this.navCtrl.navigateForward('/register');
    this.router.navigate(['/registrarse']);
  }

  // Método para navegar a la página de inicio de sesión
  goToLogin() {
    console.log('Navegando a login');
    // this.navCtrl.navigateForward('/login');
    this.router.navigate(['/login']);
  }

  // Método para manejar los inicios de sesión con redes sociales
  socialLogin(platform: string) {
    console.log(`Iniciando sesión con ${platform}`);
    
    // Aquí irían las implementaciones reales de inicio de sesión con redes sociales
    // Por ejemplo, usando Firebase Authentication, Auth0, o tu propio backend
    
    switch(platform) {
      case 'facebook':
        // Implementación de login con Facebook
        break;
      case 'twitter':
        // Implementación de login con Twitter
        break;
      case 'linkedin':
        // Implementación de login con LinkedIn
        break;
      case 'instagram':
        // Implementación de login con Instagram
        break;
    }
    
    // Prevenir el comportamiento predeterminado del enlace
    return false;
  }

  goToInfo() {
    console.log('Navegando a información');
    this.router.navigate(['/informacion']);
  }

}
