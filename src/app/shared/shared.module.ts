import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { GraficoComponent } from './components/grafico/grafico.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    GraficoComponent
  ],
  exports: [
    GraficoComponent
  ]
})
export class SharedModule { }
