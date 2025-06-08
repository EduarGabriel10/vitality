import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ResenamPageRoutingModule } from './resenam-routing.module';

import { ResenamPage } from './resenam.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResenamPageRoutingModule
  ],
  declarations: [ResenamPage]
})
export class ResenamPageModule {}
