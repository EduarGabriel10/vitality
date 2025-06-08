import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { QuestionsService } from '../../../services/questions.service';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { firstValueFrom } from 'rxjs';

interface Pregunta {
  id: number;
  text: string;
}

interface ResumenSintoma {
  tipoRespuesta: number;
  respuestas: {
    valor: string;
    cantidad: number;
  }[];
}

@Component({
  selector: 'app-grafico',
  templateUrl: './grafico.component.html',
  styleUrls: ['./grafico.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgChartsModule
  ]
})
export class GraficoComponent implements OnInit, OnDestroy {
  isLoading = false;
  error: string | null = null;
  preguntasDisponibles: Pregunta[] = [];
  selectedQuestionId: number | null = null;
  resumenPorSintoma: { [key: number]: ResumenSintoma } = {};

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {},
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true
      }
    }
  };

  barChartType: ChartType = 'bar';
  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Respuestas',
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1
    }]
  };

  constructor(
    private http: HttpClient,
    @Inject(QuestionsService) private questionsService: QuestionsService
  ) {}

  ngOnInit() {
    this.loadQuestions();
    this.loadSummaryData();
  }

  ngOnDestroy() {}

  loadQuestions() {
    this.preguntasDisponibles = this.questionsService.getQuestions()
      .filter(q => q.id !== 1)
      .map(q => ({ id: q.id, text: q.text }));

    if (this.preguntasDisponibles.length > 0) {
      this.selectedQuestionId = this.preguntasDisponibles[0].id;
    }
  }

  async loadSummaryData() {
    this.isLoading = true;
    this.error = null;

    try {
      const data = await firstValueFrom(
        this.http.get<ResumenSintoma[]>('http://localhost:3000/api/respuestas/resumen/sintomas')
      );

      if (data) {
        this.resumenPorSintoma = data.reduce((acc, item) => {
          acc[item.tipoRespuesta] = item;
          return acc;
        }, {} as { [key: number]: ResumenSintoma });

        if (this.selectedQuestionId !== null) {
          this.updateChartData(this.selectedQuestionId);
        }
      }
    } catch (err) {
      console.error('Error al cargar el resumen de síntomas:', err);
      this.error = 'No se pudo cargar la información. Por favor, intente de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  onQuestionChange() {
    if (this.selectedQuestionId !== null) {
      this.updateChartData(this.selectedQuestionId);
    }
  }

  private updateChartData(questionId: number) {
    const sintoma = this.resumenPorSintoma[questionId];

    if (sintoma && sintoma.respuestas.length > 0) {
      const colores = [
        'rgba(60, 141, 188, 0.8)',
        'rgba(0, 192, 239, 0.8)',
        'rgba(0, 166, 90, 0.8)',
        'rgba(243, 156, 18, 0.8)',
        'rgba(221, 75, 57, 0.8)'
      ];
      const bordes = [
        'rgba(60, 141, 188, 1)',
        'rgba(0, 192, 239, 1)',
        'rgba(0, 166, 90, 1)',
        'rgba(243, 156, 18, 1)',
        'rgba(221, 75, 57, 1)'
      ];

      this.barChartData = {
        labels: sintoma.respuestas.map(r => r.valor),
        datasets: [{
          data: sintoma.respuestas.map(r => r.cantidad),
          label: 'Respuestas',
          backgroundColor: colores,
          borderColor: bordes,
          borderWidth: 1
        }]
      };
    } else {
      this.barChartData = {
        labels: ['Sin datos'],
        datasets: [{
          data: [0],
          label: 'Sin datos',
          backgroundColor: 'rgba(200, 200, 200, 0.8)',
          borderColor: 'rgba(200, 200, 200, 1)',
          borderWidth: 1
        }]
      };
    }
  }
}
