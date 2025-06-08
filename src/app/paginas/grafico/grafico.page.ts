import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-grafico',
  templateUrl: './grafico.page.html',
  styleUrls: ['./grafico.page.scss'],
  standalone: false,
})
export class GraficoPage implements OnInit, AfterViewInit {
  @ViewChild('pieChart') pieChartRef!: ElementRef<HTMLCanvasElement>;
  resumen: { tipo: string; cantidad: number; porcentaje: string }[] = [];
  totalConsultas = 0;

  pieChart: any;
  chartData: any[] = [];
  filteredData: any[] = [];

  loading = true;
  error: string | null = null;
  viewReady = false;

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

  constructor(private http: HttpClient) {
    Chart.register(...registerables);
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.viewReady = true;
    this.loadChartData();
  }

  selectedSection: string = 'Tos y Flema';

  urlMap: Record<string, string> = {
    'Tos y Flema': 'http://localhost:3000/api/respuestas/tipo2/fecha',
    'Dificultad Respiratoria': 'http://localhost:3000/api/respuestas/tipo4/fecha',
    'Sintomas Generales': 'http://localhost:3000/api/respuestas/tipo7/fecha',
    'Otros Indicadores': 'http://localhost:3000/api/respuestas/tipo11/fecha',
  };

  detalleMap: Record<string, string[]> = {
    'Tos y Flema': ['Seca', 'Con flema', 'Con sangre'],
    'Dificultad Respiratoria': ['En reposo', 'Al caminar', 'Durante el ejercicio', 'Al dormir'],
    'Sintomas Generales': ['Menos de 38°C', 'Entre 38°C y 39°C', 'Más de 39°C'],
    'Otros Indicadores': ['Por la noche', 'Durante el ejercicio', 'Con cambios de clima'],
  };

  loadChartData(url?: string) {
    if (!this.viewReady) return;

    this.loading = true;
    this.error = null;
    const apiUrl = url || this.urlMap[this.selectedSection];

    this.http.get<any[]>(apiUrl).subscribe({
      next: (data) => {
        this.chartData = data;
        this.availableYears = Array.from(
          new Set(this.chartData.map(r => new Date(r.consulta.fecha).getFullYear()))
        ).sort();

        this.filteredData = this.chartData.filter(item => {
          const fecha = new Date(item.consulta.fecha);
          const cumpleAnio = !this.selectedYear || fecha.getFullYear() === this.selectedYear;
          const cumpleMes = !this.selectedMonth || (fecha.getMonth() + 1) === this.selectedMonth;
          return cumpleAnio && cumpleMes;
        });

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

        setTimeout(() => this.createPieChart(), 300);
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar los datos del gráfico';
        this.loading = false;
      }
    });
  }

  createPieChart() {
    if (!this.pieChartRef || !this.pieChartRef.nativeElement) {
      console.warn('Canvas no disponible todavía');
      return;
    }

    const ctx = this.pieChartRef.nativeElement.getContext('2d');
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

  refreshData(event: any) {
    this.loadChartData();
    setTimeout(() => event.target.complete(), 500);
  }

  resetFilters() {
    this.selectedYear = null;
    this.selectedMonth = null;
    this.loadChartData();
  }

  getIcon(tipo: string): string {
    return 'medkit'; // Puedes personalizar por tipo si deseas
  }

  getColor(tipo: string): string {
    return 'primary'; // O usar un mapa por tipo
  }

  getBackgroundColor(tipo: string): string {
    return 'var(--ion-color-primary)'; // O usar un mapa por tipo
  }

  onSectionChange(section: string) {
    const url = this.urlMap[section];
    this.selectedSection = section;
    this.loadChartData(url);
  }
}
