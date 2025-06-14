import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ChatMedicoComponent } from './chat-medico.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ChatMedicoComponent  // standalone component se importa directamente
  ],
  exports: [ChatMedicoComponent]
})
export class ChatMedicoModule { }
