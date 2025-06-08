import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { HorarioPageRoutingModule } from './horario-routing.module';
import { HorarioPage } from './horario.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule,
    HorarioPageRoutingModule
  ],
  declarations: [HorarioPage]
})
export class HorarioPageModule {}
