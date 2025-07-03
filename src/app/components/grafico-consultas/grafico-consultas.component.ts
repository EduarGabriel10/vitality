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
  private readonly apiKey = 'AIzaSyBGjpUvI2XQIghy4KoQoGEYAxUP3uQsR_o';
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

    // Gradient for the area under the line
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(56, 128, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(56, 128, 255, 0.05)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: fechas,
        datasets: [{
          label: 'Número de Consultas',
          data: totales,
          borderColor: '#3880ff',
          backgroundColor: gradient,
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#3880ff',
          pointBorderWidth: 2,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#3880ff',
          pointHoverBorderWidth: 2,
          pointHitRadius: 10,
          pointStyle: 'circle',
          pointRadius: totales.length > 30 ? 0 : 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#666',
              font: {
                size: 12,
                family: 'Roboto, "Helvetica Neue", sans-serif'
              },
              padding: 20
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: {
              size: 13,
              weight: 'bold',
              family: 'Roboto, "Helvetica Neue", sans-serif'
            },
            bodyFont: {
              size: 13,
              family: 'Roboto, "Helvetica Neue", sans-serif'
            },
            padding: 12,
            displayColors: false,
            callbacks: {
              label: function(context) {
                return ` ${context.parsed.y} consulta${context.parsed.y !== 1 ? 's' : ''}`;
              },
              title: function(context) {
                return `Fecha: ${context[0].label}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false,
              drawBorder: false
            },
            ticks: {
              color: '#666',
              maxRotation: 45,
              minRotation: 45,
              padding: 10,
              font: {
                size: 11,
                family: 'Roboto, "Helvetica Neue", sans-serif'
              }
            },
            title: {
              display: true,
              text: 'Fechas',
              color: '#666',
              font: {
                size: 12,
                weight: 'bold',
                family: 'Roboto, "Helvetica Neue", sans-serif'
              },
              padding: { top: 10, bottom: 5 }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
              drawBorder: false
            },
            ticks: {
              color: '#666',
              padding: 8,
              font: {
                size: 11,
                family: 'Roboto, "Helvetica Neue", sans-serif'
              },
              callback: function(value) {
                return Number.isInteger(value as number) ? value : '';
              }
            },
            title: {
              display: true,
              text: 'Número de Consultas',
              color: '#666',
              font: {
                size: 12,
                weight: 'bold',
                family: 'Roboto, "Helvetica Neue", sans-serif'
              },
              padding: { bottom: 10, top: 5 }
            }
          }
        },
        animation: {
          duration: 1500,
          easing: 'easeInOutQuart'
        },
        elements: {
          line: {
            borderCapStyle: 'round',
            borderJoinStyle: 'round'
          }
        },
        layout: {
          padding: {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
          }
        }
      }
    });
  }
}
