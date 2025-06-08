import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PrincipalmPageRoutingModule } from './principalm-routing.module';

import { PrincipalmPage } from './principalm.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PrincipalmPageRoutingModule
  ],
  declarations: [PrincipalmPage]
})
export class PrincipalmPageModule {}
