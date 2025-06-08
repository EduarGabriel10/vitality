import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { PrincipalPageRoutingModule } from './principal-routing.module';


import { PrincipalPage } from './principal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    IonicModule,
    PrincipalPageRoutingModule
  ],
  declarations: [PrincipalPage]
})
export class PrincipalPageModule {}
