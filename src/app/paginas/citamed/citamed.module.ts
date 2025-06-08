import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CitamedPageRoutingModule } from './citamed-routing.module';

import { CitamedPage } from './citamed.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CitamedPageRoutingModule
  ],
  declarations: [CitamedPage]
})
export class CitamedPageModule {}
