import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardPageRoutingModule } from './dashboard-routing.module';
import { NgChartsModule } from 'ng2-charts';

import { DashboardPage } from './dashboard.page';
import { ChatMedicoModule } from 'src/app/components/chat-medico/chat-medico.module'; // ajusta la ruta según tu estructura


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgChartsModule,
    DashboardPageRoutingModule,
    ChatMedicoModule
  ],
  declarations: [DashboardPage]
})
export class DashboardPageModule {}
