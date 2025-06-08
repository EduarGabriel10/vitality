import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlertService {  
  constructor(private alertController: AlertController) {}

async presentAlert(header: string, message: string, buttons: string[] = ['OK']) {
  const alert = await this.alertController.create({
    header,
    message,
    buttons,
  });
  await alert.present();
}

async presentConfirm(
  header: string,
  message: string,
  confirmHandler: () => void,
  cancelHandler?: () => void
) {
  const alert = await this.alertController.create({
    header,
    message,
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
        handler: cancelHandler,
      },
      {
        text: 'Aceptar',
        handler: confirmHandler,
      },
    ],
  });
  await alert.present();
}

async presentInputAlert(header: string, inputs: any[], handler: (data: any) => void) {
  const alert = await this.alertController.create({
    header,
    inputs,
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
      },
      {
        text: 'Aceptar',
        handler,
      },
    ],
  });
  await alert.present();
}
}