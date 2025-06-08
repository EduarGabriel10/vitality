import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DiagmedicoPageRoutingModule } from './diagmedico-routing.module';

import { DiagmedicoPage } from './diagmedico.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DiagmedicoPageRoutingModule
  ],
  declarations: [DiagmedicoPage]
})
export class DiagmedicoPageModule {}
