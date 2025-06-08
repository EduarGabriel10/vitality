import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AlertService } from 'src/app/services/alert.service';
import { MedicoService } from 'src/app/services/medico.service';

@Component({
  selector: 'app-diagmedico',
  templateUrl: './diagmedico.page.html',
  styleUrls: ['./diagmedico.page.scss'],
  standalone: false
})
export class DiagmedicoPage implements OnInit {

  consultaId: number = 0;
  diagnostico: string = '';
  recomendaciones: string = '';
  comentarios: string = '';
  gravedad: string = 'BAJA'; // valor por defecto
  usuario: any;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private alertService: AlertService,
    private medicoService: MedicoService
  ) {}

  ngOnInit() {
    this.consultaId = Number(this.route.snapshot.paramMap.get('id'));
    this.usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  }

  updateGravedad() {
    // This method is called when the severity level changes
    console.log('Gravedad actualizada a:', this.gravedad);
  }

  enviarDiagnostico() {
    const datos = {
      diagnostico: this.diagnostico,
      recomendaciones: this.recomendaciones,
      comentarios: this.comentarios,
      gravedad: this.gravedad,
      medicoId: this.usuario.id,
      consultaId: this.consultaId
    };

    this.medicoService.enviarDiagnostico(datos).subscribe({
      next: (res) => {
        console.log('Diagnóstico enviado:', res);
        this.alertService.presentAlert('Éxito', 'Diagnóstico enviado correctamente');
        this.navCtrl.navigateBack('/principal/dashboardm');
      },
      error: (err) => {
        console.error('Error al enviar diagnóstico:', err);
        this.alertService.presentAlert('Error', 'No se pudo enviar el diagnóstico');
      }
    });
  }
}
