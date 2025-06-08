import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DatosmPageRoutingModule } from './datosm-routing.module';

import { DatosmPage } from './datosm.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DatosmPageRoutingModule
  ],
  declarations: [DatosmPage]
})
export class DatosmPageModule {}
