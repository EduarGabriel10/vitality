import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = 'AIzaSyAccBhJqUDuO9rwvtO4A6uPOoanXup5QRI';

@Component({
  selector: 'app-chat-medico',
  templateUrl: './chat-medico.component.html',
  styleUrls: ['./chat-medico.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class ChatMedicoComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  messages: Message[] = [];
  newMessage = '';
  isLoading = false;
  isOpen = false;

  private geminiAI: any;
  private model: any;
  private isDestroyed = false;

  private readonly WELCOME_MESSAGE = '¡Hola! Soy tu asistente médico virtual. ¿En qué puedo ayudarte hoy?';

  constructor() {
    this.geminiAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    this.model = this.geminiAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  ngOnInit(): void {
    this.addBotMessage(this.WELCOME_MESSAGE);
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      // Wait for the chat to open before scrolling to bottom
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  closeChat(): void {
    this.isOpen = false;
  }

  async sendMessage(): Promise<void> {
    if (!this.newMessage.trim() || this.isLoading) return;

    const userMessage = this.newMessage.trim();
    this.addMessage(userMessage, 'user');
    this.newMessage = '';
    this.isLoading = true;

    try {
      const isMedicalQuery = await this.isMedicalQuery(userMessage);

      if (!isMedicalQuery) {
        this.addBotMessage('Solo puedo responder preguntas relacionadas con salud y medicina. Por favor, haz una consulta médica.');
        return;
      }

      const prompt = `
        Eres un asistente médico virtual. Proporciona una respuesta clara y concisa a la siguiente consulta médica: "${userMessage}".

        Por favor, sigue estas pautas:
        1. Sé profesional pero amigable
        2. Proporciona información general, no diagnóstico específico
        3. Siempre recomienda consultar con un profesional de la salud
        4. Si la consulta no es médica, indícalo amablemente
        5. Limita la respuesta a 2-3 oraciones
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      await new Promise(resolve => setTimeout(resolve, 500));
      this.addBotMessage(text);
    } catch (error) {
      console.error('Error al generar respuesta:', error);
      this.addBotMessage('Lo siento, ha ocurrido un error al procesar tu consulta. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      this.isLoading = false;
    }
  }

  private async isMedicalQuery(query: string): Promise<boolean> {
    try {
      const prompt = `¿La siguiente consulta es sobre salud, medicina o enfermedades? Responde solo con "sí" o "no": ${query}`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const answer = response.text().trim().toLowerCase();
      return answer === 'sí' || answer === 'si';
    } catch (error) {
      console.error('Error al verificar consulta médica:', error);
      return false;
    }
  }

  private addMessage(text: string, sender: 'user' | 'bot') {
    this.messages.push({
      text,
      sender,
      timestamp: new Date()
    });
    this.scrollToBottom();
  }

  private addBotMessage(text: string) {
    this.addMessage(text, 'bot');
  }

  private scrollToBottom(): void {
    if (!this.messagesContainer) return;
    
    try {
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}

// Interface fuera del decorador
export interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}
