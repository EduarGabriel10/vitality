import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Nl2BrPipe } from '../../pipes/nl2br.pipe';
import { IonicModule } from '@ionic/angular';
import { ChangeDetectorRef } from '@angular/core';
import { GraficoConsultasComponent } from '../../components/grafico-consultas/grafico-consultas.component';

@Component({
  selector: 'app-grafico',
  templateUrl: './grafico.page.html',
  styleUrls: ['./grafico.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Nl2BrPipe,
    GraficoConsultasComponent
  ]
})
export class GraficoPage implements OnInit, AfterViewInit {
  @ViewChild('pieChart') pieChartRef!: ElementRef<HTMLCanvasElement>;

  resumen: { tipo: string; cantidad: number; porcentaje: string }[] = [];
  totalConsultas = 0;
  pieChart: any;
  chartData: any[] = [];
  filteredData: any[] = [];
  vistaSeleccionada: string = 'grafico';
  loading = true;
  error: string | null = null;
  viewReady = false;
  selectedView: 'pie' | 'line' = 'pie';

  // IA
  aiAnalysis: string = '';
  isAnalyzing: boolean = false;
  analysisError: string | null = null;
  private genAI: any;
  private apiKey = 'AIzaSyAQ_pZAfPU7bVIFU-pmkmW_KFCiMR7M8SY';

  // Filtros
  selectedYear: number | null = null;
  selectedMonth: number | null = null;
  availableYears: number[] = [];
  months = [
    { name: 'Enero', value: 1 }, { name: 'Febrero', value: 2 }, { name: 'Marzo', value: 3 },
    { name: 'Abril', value: 4 }, { name: 'Mayo', value: 5 }, { name: 'Junio', value: 6 },
    { name: 'Julio', value: 7 }, { name: 'Agosto', value: 8 }, { name: 'Septiembre', value: 9 },
    { name: 'Octubre', value: 10 }, { name: 'Noviembre', value: 11 }, { name: 'Diciembre', value: 12 }
  ];

  selectedSection: string = 'Tos y Flema';

  urlMap: Record<string, string> = {
    'Tos y Flema': 'https://vitality-bzt5.onrender.com/api/respuestas/tipo2/fecha',
    'Dificultad Respiratoria': 'https://vitality-bzt5.onrender.com/api/respuestas/tipo4/fecha',
    'Sintomas Generales': 'https://vitality-bzt5.onrender.com/api/respuestas/tipo7/fecha',
    'Otros Indicadores': 'https://vitality-bzt5.onrender.com/api/respuestas/tipo11/fecha',
  };

  detalleMap: Record<string, string[]> = {
    'Tos y Flema': ['Seca', 'Con flema', 'Con sangre'],
    'Dificultad Respiratoria': ['En reposo', 'Al caminar', 'Durante el ejercicio', 'Al dormir'],
    'Sintomas Generales': ['Menos de 38°C', 'Entre 38°C y 39°C', 'Más de 39°C'],
    'Otros Indicadores': ['Por la noche', 'Durante el ejercicio', 'Con cambios de clima'],
  };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {
    this.selectedView = 'pie'; // Default view
    Chart.register(...registerables);
    this.genAI = new GoogleGenerativeAI(this.apiKey);
  }

  ngOnInit() {}

  ngAfterViewInit() {
    // Esperar que Angular haya renderizado completamente
    setTimeout(() => {
      this.viewReady = true;
      this.loadChartData();
    }, 100);
  }

  onSectionChange(section: string) {
    this.selectedSection = section;
    this.loadChartData(this.urlMap[section]);
  }

  refreshData(event: any) {
    this.loadChartData();
    setTimeout(() => event.target.complete(), 500);
  }

  resetFilters() {
    this.selectedYear = null;
    this.selectedMonth = null;
    this.loadChartData();
  }

  onViewChange(event: any) {
    this.selectedView = event.detail.value;
  }

  loadChartData(url?: string) {
    if (!this.viewReady) return;

    this.loading = true;
    this.error = null;
    this.aiAnalysis = '';

    const apiUrl = url || this.urlMap[this.selectedSection];

    this.http.get<any[]>(apiUrl).subscribe({
      next: (data) => {
        this.chartData = data;
        this.availableYears = Array.from(
          new Set(this.chartData.map(r => new Date(r.consulta.fecha).getFullYear()))
        ).sort();

        this.filteredData = data.filter(item => {
          const fecha = new Date(item.consulta.fecha);
          const cumpleAnio = !this.selectedYear || fecha.getFullYear() === this.selectedYear;
          const cumpleMes = !this.selectedMonth || fecha.getMonth() + 1 === this.selectedMonth;
          return cumpleAnio && cumpleMes;
        });

        this.analyzeWithAI(this.filteredData);

        const detallesEsperados = this.detalleMap[this.selectedSection] || [];
        const contador: Record<string, number> = {};
        detallesEsperados.forEach(det => contador[det] = 0);

        this.filteredData.forEach(item => {
          const tipo = item.detalles?.trim();
          if (contador.hasOwnProperty(tipo)) {
            contador[tipo]++;
          }
        });

        this.totalConsultas = this.filteredData.length;

        this.resumen = detallesEsperados.map(tipo => ({
          tipo,
          cantidad: contador[tipo],
          porcentaje: this.totalConsultas ? ((contador[tipo] / this.totalConsultas) * 100).toFixed(1) : '0'
        }));

        // Forzar detección de cambios para asegurar que el canvas esté disponible
        this.cdr.detectChanges();

        // Esperar que canvas esté presente antes de crear el gráfico
        setTimeout(() => this.createPieChart(), 100);
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar los datos del gráfico';
        this.loading = false;
      }
    });
  }

  createPieChart() {
    const canvas = this.pieChartRef?.nativeElement;
    if (!canvas) {
      console.warn('Canvas no disponible todavía');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.pieChart) this.pieChart.destroy();

    const resumenData = this.resumen.filter(r => r.cantidad > 0);
    const labels = resumenData.map(r => r.tipo);
    const data = resumenData.map(r => r.cantidad);

    const backgroundColors = [
      'rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)',
      'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)'
    ];

    this.pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: backgroundColors.slice(0, labels.length),
          borderColor: '#fff',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: `Distribución: ${this.selectedSection}`
          }
        }
      }
    });
  }

  async analyzeWithAI(data: any[]) {
    if (!data || data.length === 0) return;

    this.isAnalyzing = true;
    this.analysisError = null;

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'text/plain' }
      });

      const prompt = this.generateAnalysisPrompt(data);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      this.aiAnalysis = response.text();
    } catch (error) {
      console.error('Error al analizar con IA:', error);
      this.analysisError = 'Error al generar el análisis. Intente nuevamente.';
    } finally {
      this.isAnalyzing = false;
    }
  }

  private generateAnalysisPrompt(data: any[]): string {
    const total = data.length;
    const resumen = this.procesarDatosParaResumen(data);
    const fechaInicio = data.length > 0 ? new Date(data[data.length - 1].consulta.fecha).toLocaleDateString() : '';
    const fechaFin = data.length > 0 ? new Date(data[0].consulta.fecha).toLocaleDateString() : '';

    const distribucion = resumen
      .map((item: any) => `${item.tipo} (${item.porcentaje}%)`)
      .join(', ');

    return `
    <div class="analysis-content">
      <div class="analysis-header">
        <h3><ion-icon name="analytics"></ion-icon> ${this.selectedSection}</h3>
        <p class="meta">${fechaInicio} al ${fechaFin} • ${total} casos</p>
      </div>
      
      <div class="key-findings">
        <p>Distribución: <strong>${distribucion}</strong></p>
        <p>Analiza brevemente los datos y dame un analisis breve sobre los datos.</p>
      </div>
    </div>
    `;
  }

  procesarDatosParaResumen(data: any[]): any[] {
    const resumenMap = new Map<string, number>();

    data.forEach(item => {
      const tipo = item.detalles || item.respuesta;
      resumenMap.set(tipo, (resumenMap.get(tipo) || 0) + 1);
    });

    const total = data.length;
    const resultado: any[] = [];

    resumenMap.forEach((cantidad, tipo) => {
      resultado.push({
        tipo: tipo || 'Sin especificar',
        cantidad,
        porcentaje: total > 0 ? ((cantidad / total) * 100).toFixed(1) : '0.0'
      });
    });

    return resultado.sort((a, b) => b.cantidad - a.cantidad);
  }
}
