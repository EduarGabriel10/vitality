import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ResenaPageRoutingModule } from './resena-routing.module';

import { ResenaPage } from './resena.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResenaPageRoutingModule
  ],
  declarations: [ResenaPage]
})
export class ResenaPageModule {}
