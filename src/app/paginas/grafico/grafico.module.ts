import { NgModule } from '@angular/core';
import { GraficoPage } from './grafico.page';
import { GraficoPageRoutingModule } from './grafico-routing.module';
import { NgChartsModule } from 'ng2-charts';
import { IonicModule } from '@ionic/angular';
import { GraficoConsultasComponent } from 'src/app/components/grafico-consultas/grafico-consultas.component';
@NgModule({
  imports: [
    GraficoPage,
    GraficoPageRoutingModule,
    NgChartsModule,
    IonicModule,
    GraficoConsultasComponent
  ]
})
export class GraficoPageModule {}
