import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Nl2BrPipe } from '../../pipes/nl2br.pipe';
import { 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent, 
  IonButton, 
  IonIcon, 
  IonSpinner 
} from "@ionic/angular/standalone";

declare const addIcons: (icons: { [key: string]: any }) => void;

Chart.register(...registerables);

@Component({
  selector: 'app-grafico-consultas',
  templateUrl: './grafico-consultas.component.html',
  styleUrls: ['./grafico-consultas.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    IonSpinner, 
    IonIcon, 
    IonButton, 
    IonCard, 
    IonCardHeader, 
    IonCardTitle, 
    IonCardContent,
    Nl2BrPipe
  ]
})
export class GraficoConsultasComponent implements OnInit, AfterViewInit {
  @ViewChild('lineChart') lineChartRef!: ElementRef<HTMLCanvasElement>;
  chart: any;
  
  // AI Analysis
  private readonly apiKey = 'AIzaSyC1AWWszMJAK14n3znaDX-nkIOsvexZC8c';
  private genAI: GoogleGenerativeAI;
  
  // UI State
  isAnalyzing = false;
  analysisError: string | null = null;
  aiAnalysis = '';

  constructor(private http: HttpClient) {
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    if (typeof addIcons === 'function') {
      addIcons({
        'analytics': 'analytics',
        'refresh': 'refresh',
        'warning': 'warning'
      });
    }
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.obtenerDatos();
  }

  async analyzeData() {
    this.isAnalyzing = true;
    this.analysisError = null;
    this.aiAnalysis = '';

    try {
      const data = await this.obtenerDatosParaAnalisis();
      if (!data.length) {
        this.analysisError = 'No hay datos suficientes para generar el análisis.';
        return;
      }
      const prompt = this.crearPromptParaAnalisis(data);
      await this.generarAnalisis(prompt);
    } catch (error) {
      console.error('Error al analizar datos:', error);
      this.analysisError = 'Error al analizar los datos. Intente nuevamente.';
    } finally {
      this.isAnalyzing = false;
    }
  }

  private async generarAnalisis(prompt: string) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { responseMimeType: 'text/plain' } });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      this.aiAnalysis = await response.text();
    } catch (error) {
      console.error('Error al generar análisis con IA:', error);
      this.analysisError = 'Error al generar el análisis. Intente nuevamente.';
      throw error;
    }
  }

  private crearPromptParaAnalisis(data: any[]): string {
    const totalConsultas = data.reduce((sum, item) => sum + (item.total || 0), 0);
    const fechasUnicas = [...new Set(data.map(item => item.fecha))];
    const promedioDiario = (totalConsultas / fechasUnicas.length).toFixed(2);
  
    // Días con más y menos consultas
    const maxDia = data.reduce((prev, curr) => (curr.total > prev.total ? curr : prev));
    const minDia = data.reduce((prev, curr) => (curr.total < prev.total ? curr : prev));
  
    return `
  Analiza brevemente los siguientes datos de consultas médicas por fecha:
  
  ${data.map(d => `- ${d.fecha}: ${d.total} consultas`).join('\n')}
  
  Resumen estadístico:
  - Total: ${totalConsultas} consultas
  - Promedio diario: ${promedioDiario} consultas/día
  - Día con más consultas: ${maxDia.fecha} (${maxDia.total})
  - Día con menos consultas: ${minDia.fecha} (${minDia.total})
  
  Genera un resumen breve (máximo 3 líneas) con los principales hallazgos y posibles recomendaciones.`;
  }
  

  private async obtenerDatosParaAnalisis(): Promise<any[]> {
    const url = 'https://vitality-bzt5.onrender.com/api/consultas/estadisticas/porfecha';
    return this.http.get<any[]>(url).toPromise()
      .then(data => data || [])
      .catch(error => {
        console.error('Error al obtener datos para análisis:', error);
        this.analysisError = 'Error al cargar los datos para análisis.';
        return [];
      });
  }

  obtenerDatos() {
    const url = 'https://vitality-bzt5.onrender.com/api/consultas/estadisticas/porfecha';
    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.crearGrafico(data);
        this.analyzeData();
      },
      error: (error) => {
        console.error('Error al obtener datos:', error);
        this.analysisError = 'Error al cargar los datos del gráfico.';
      }
    });
  }
  
  private crearGrafico(data: any[]) {
    if (!data || data.length === 0) {
      console.warn('No hay datos para graficar');
      return;
    }
    
    const fechas = data.map(d => d.fecha);
    const totales = data.map(d => d.total);
    this.generarGrafico(fechas, totales);
  }

  private generarGrafico(fechas: string[], totales: number[]) {
    const ctx = this.lineChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      console.warn('No se pudo obtener el contexto 2D del canvas');
      return;
    }

    if (this.chart) this.chart.destroy();

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: fechas,
        datasets: [{
          label: 'Consultas por Fecha',
          data: totales,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.3,
          fill: true,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Fecha'
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Total de Consultas'
            }
          }
        }
      }
    });
  }
}
