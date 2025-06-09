import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Question } from 'src/app/modelo/question.model';
import { QuestionsService } from 'src/app/services/questions.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-analisis',
  templateUrl: './analisis.page.html',
  styleUrls: ['./analisis.page.scss'],
  standalone: false
})
export class AnalisisPage {
  questions: Question[] = [];
  currentQuestionIndex = 0;
  selectedAIModel: string = 'gemini-1.5-flash'; // Default model
  showModelSelection: boolean = false;

  constructor(
    private questionsService: QuestionsService,
    private alertController: AlertController,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['refresh']) {
        this.resetForm();
      }
    });

    this.resetForm();
  }

  resetForm() {
    // Obtener las preguntas
    this.questions = this.questionsService.getQuestions().map(q => ({
      ...q,
      answer: '',
      additionalInfo: ''
    }));
  
    this.currentQuestionIndex = 0;
    this.selectedAIModel = 'gemini-1.5-flash';
    this.showModelSelection = false;
  }


  get currentQuestion(): Question {
    return this.questions[this.currentQuestionIndex];
  }

  get progress(): number {
    return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
  }

  selectAnswer(answer: string) {
    this.currentQuestion.answer = answer;

    // Si es "Sí" y requiere detalle, esperamos el input antes de continuar
    if (!(answer === 'Sí' && this.currentQuestion.responseType === 'yesnodetail')) {
      this.currentQuestion.additionalInfo = ''; // Limpiar si no aplica
    }
  }

  goToNextQuestion() {
    if (this.currentQuestion.answer === 'Sí' && this.currentQuestion.responseType === 'yesnodetail') {
      if (!this.currentQuestion.additionalInfo || this.currentQuestion.additionalInfo.trim() === '') {
        this.presentAlert('Por favor, proporciona más detalles antes de continuar.');
        return;
      }
    }

    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    } else {
      this.completeQuestionnaire();
    }
  }

  goToPreviousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }



  async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Atención',
      message,
      buttons: ['OK']
    });

    await alert.present();
  }

  toggleModelSelection() {
    this.showModelSelection = !this.showModelSelection;
  }

  selectAIModel(model: string) {
    this.selectedAIModel = model;
    this.showModelSelection = false;
  }

  async completeQuestionnaire() {
    const respuestas = this.questions.map(q => ({
      pregunta: q.text,
      tipoRespuesta: q.id.toString(),
      respuesta: q.answer,
      detalles: q.additionalInfo || '',
      seccion: q.section || ''
    }));

    this.router.navigate(['/principal/diagnostico'], {
      state: {
        respuestas,
        aiModel: this.selectedAIModel
      }
    });
    const alert = await this.alertController.create({
      header: 'Cuestionario Completado',
      message: 'Gracias por completar el cuestionario de síntomas.',
      buttons: ['OK']
    });
    await alert.present();
    
    // Redireccionar después de que la alerta se haya presentado
    await this.router.navigate(['principal/diagnostico'], {
      state: { respuestas }
    });
  }

  selectDetailOption(option: string) {
    this.currentQuestion.additionalInfo = option;
  }
}
