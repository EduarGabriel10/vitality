import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-diagnostico',
  templateUrl: './diagnostico.page.html',
  styleUrls: ['./diagnostico.page.scss'],
  standalone: false
})
export class DiagnosticoPage {
  diagnostico: string | null = null;
  isLoading = true;
  diagnosticoParsed: string | null = null;
  probabilidad: number = 0;
  recomendaciones: string[] = [];
  respuestasIA: any = null;
  respuestasBackend: any[] = [];
  gravedad: number = 0;
  edad: string = '';
  ApyKey: string = 'AIzaSyAQ_pZAfPU7bVIFU-pmkmW_KFCiMR7M8SY';
  selectedAIModel: string = 'gemini-1.5-flash';

  constructor(
    private router: Router, 
    private usuarioService: UsuarioService
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as { 
      respuestas: { 
        pregunta: string;
        tipoRespuesta: string;
        respuesta: string;
        detalles?: string;
        seccion?: string;
        id?: number;
      }[];
      aiModel?: string;
    };

    if (state?.aiModel) {
      this.selectedAIModel = state.aiModel;
    }

    if (state?.respuestas) {
      const edadRespuesta = state.respuestas.find(r => r.id === 1);
      const edad = edadRespuesta ? edadRespuesta.respuesta : '0';

      const respuestasParaIA = state.respuestas.reduce((acc: any, r: any) => {
        acc[r.pregunta] = r.respuesta + (r.detalles ? ` (${r.detalles})` : '');
        return acc;
      }, {});

      this.respuestasBackend = state.respuestas;
      this.respuestasIA = respuestasParaIA;
      this.edad = edad;

      this.isLoading = true;
    } else {
      this.diagnostico = 'No se recibieron los datos.';
      this.isLoading = false;
    }
  }

  ngOnInit() {
    if (this.respuestasIA && this.respuestasBackend) {
      if (this.selectedAIModel === 'gemini-2.5-flash') {
        this.enviarConsultaConOtraApi(this.respuestasIA, this.respuestasBackend, this.edad);
        console.log('Usando Gemini 2.5');
      } else {
        this.enviarConsulta(this.respuestasIA, this.respuestasBackend, this.edad);
        console.log('Usando Gemini 1.5');
      }
    }
  }

  async enviarConsultaConOtraApi(respuestasIA: any, respuestasBackend: any[], edad: string): Promise<void> {
    const nuevaApiKey = 'AIzaSyCtZ6ndvLGYHcE5dm9z1FzeLewRpK6qcYk'; 
    const genAI = new GoogleGenerativeAI(nuevaApiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-preview-04-17',
      generationConfig: { responseMimeType: 'text/plain' }
    });
  
    const usuarioGuardado = localStorage.getItem('usuario');
    const usuarioId = usuarioGuardado ? JSON.parse(usuarioGuardado).id : null;
  
    const edadRespuesta = respuestasIA?.['¿Cuál es su edad? (Opcional)'];
    const edadInfo = edadRespuesta ? `Edad: ${edadRespuesta}` : 'Edad no especificada';
    const edadNum = edadRespuesta ? parseInt(edadRespuesta, 10) || 0 : 0;
  
    const prompt = `
      Analiza los siguientes síntomas reportados por el paciente:
      ${edadInfo}
      ${Object.entries(respuestasIA || {}).map(([pregunta, respuesta]) => `- ${pregunta}: ${respuesta}`).join('\n')}
  
      Considera la edad del paciente en tu análisis.
      Devuelve un diagnóstico preliminar en formato JSON con los campos:
      - "diagnostico"
      la probabilidad en numeros del 1 al 100
      - "probabilidad"
      - "recomendaciones"
      - "porcentaje_de_gravedad"
    `;
  
    this.isLoading = true;
  
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const resultadoIA = response.text();
  
      console.log('Resultado con segunda API:', resultadoIA);
      this.diagnostico = resultadoIA;
      this.extraerDiagnostico(resultadoIA);
  
      if (this.diagnosticoParsed) {
        const payload = {
          edad: edadNum,
          resultadoIA: this.diagnosticoParsed,
          usuarioId,
          respuestas: respuestasBackend,
          porcentaje: this.probabilidad,
          recomendaciones: this.recomendaciones,   
          gravedad: this.gravedad,       
          fecha: new Date().toISOString()
        };
  
        console.log('Payload con nueva API:', payload);
  
        try {
          const response = await this.usuarioService.guardarConsulta(payload).toPromise();
          console.log('Consulta guardada con éxito (segunda API):', response);
        } catch (error) {
          console.error('Error al guardar la consulta (segunda API):', error);
        }
      }
    } catch (error) {
      console.error('Error al usar la otra API:', error);
      this.diagnostico = 'Ocurrió un error al generar el diagnóstico con la segunda API.';
    } finally {
      this.isLoading = false;
    }
  }
  
  
  async enviarConsulta(respuestasIA: any, respuestasBackend: any[], edad: string) {
    const genAI = new GoogleGenerativeAI(this.ApyKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const usuarioGuardado = localStorage.getItem('usuario');
    const usuarioId = usuarioGuardado ? JSON.parse(usuarioGuardado).id : null;
    
    const edadRespuesta = respuestasIA['¿Cuál es su edad? (Opcional)'];
    const edadInfo = edadRespuesta ? `Edad: ${edadRespuesta}` : 'Edad no especificada';
    const edadNum = edadRespuesta ? parseInt(edadRespuesta, 10) || 0 : 0;

    const prompt = `
      Analiza los siguientes síntomas reportados por el paciente:
      ${edadInfo}
      ${Object.entries(respuestasIA).map(([pregunta, respuesta]) => `- ${pregunta}: ${respuesta}`).join('\n')}

      Considera la edad del paciente en tu análisis y diagnóstico.
      Ten en cuenta que la edad puede afectar la interpretación de los síntomas y el diagnóstico.
      Devuelve un diagnóstico preliminar en formato JSON. El JSON debe tener los siguientes campos:
      - "diagnostico"
      la probabilidad en numeros del 1 al 100
      - "probabilidad"
      - "recomendaciones"
      - "porcentaje de gravedad"
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const resultadoIA = response.text();
      this.diagnostico = resultadoIA;

      this.extraerDiagnostico(resultadoIA);
      
      if (this.diagnosticoParsed) {
        const payload = {
          edad: edadNum,
          resultadoIA: this.diagnosticoParsed,
          usuarioId,
          respuestas: respuestasBackend,
          porcentaje: this.probabilidad,
          recomendaciones: this.recomendaciones,   
          gravedad: this.gravedad,       
          fecha: new Date().toISOString()
        };
        console.log('Payload:', payload);

        try {
          const response = await this.usuarioService.guardarConsulta(payload).toPromise();
          console.log('Consulta guardada con éxito:', response);
        } catch (error) {
          console.error('Error al guardar la consulta:', error);
        }
      }

    } catch (error) {
      console.error('Error al generar el diagnóstico:', error);
      this.diagnostico = 'Ocurrió un error al generar el diagnóstico.';
    } finally {
      this.isLoading = false;
    }
  }


private extraerDiagnostico(texto: string): void {
    if (!texto) {
      this.diagnosticoParsed = 'No se pudo procesar la respuesta de la IA.';
      this.isLoading = false;
      return;
    }

    try {
      // Intenta extraer el JSON del texto
      const jsonMatch = texto.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const resultado = JSON.parse(jsonMatch[0]);
        this.diagnosticoParsed = resultado.diagnostico || 'Diagnóstico no disponible';
        this.probabilidad = resultado.probabilidad || 0;
        
        // Asegurarse de que las recomendaciones sean un array
        if (Array.isArray(resultado.recomendaciones)) {
          this.recomendaciones = resultado.recomendaciones;
        } else if (typeof resultado.recomendaciones === 'string') {
          // Si es un string, intentar dividirlo en un array
          this.recomendaciones = resultado.recomendaciones
            .split(/[\n\r]+/)
            .map((r: string) => r.trim())
            .filter((r: string) => r.length > 0);
        } else {
          this.recomendaciones = [];
        }
        
        this.gravedad = resultado.porcentaje_de_gravedad || 0;
      } else {
        this.diagnosticoParsed = texto;
        this.recomendaciones = [];
      }
    } catch (error) {
      console.error('Error al procesar la respuesta de la IA:', error);
      this.diagnosticoParsed = texto;
      this.recomendaciones = [];
    }
    this.isLoading = false;
  }

  getRecomendacionesArray(): string[] {
    // Ya manejamos la conversión en extraerDiagnostico
    return this.recomendaciones || [];
  }


getWidthForProgressBar(): string {
  if (this.probabilidad === null || this.probabilidad === undefined || isNaN(this.probabilidad)) {
    return '0%';
  }
  const safeValue = Math.max(0, Math.min(100, Number(this.probabilidad)));
  return safeValue + '%';
}

getProbabilidadDisplay(): string {
  if (this.probabilidad === null || this.probabilidad === undefined || isNaN(this.probabilidad)) {
    return '0%';
  }
  // Asegurar que esté entre 0 y 100
  const safeValue = Math.max(0, Math.min(100, Number(this.probabilidad)));
  return safeValue + '%';
}

getGravedadDisplay(): string {
  if (this.gravedad === null || this.gravedad === undefined || isNaN(this.gravedad)) {
    return '0%';
  }
  const safeValue = Math.max(0, Math.min(100, Number(this.gravedad)));
  return safeValue + '%';
}

getProbabilidadColor(): string {
  const prob = this.probabilidad === null || this.probabilidad === undefined || isNaN(this.probabilidad) 
    ? 0 
    : Number(this.probabilidad);
  
  if (prob < 30) {
    return 'success';
  } else if (prob < 70) {
    return 'warning';
  } else {
    return 'danger';
  }
}

getProbabilidadLabel(): string {
  if (this.probabilidad >= 70) return 'Alta probabilidad';
  if (this.probabilidad >= 30) return 'Probabilidad media';
  return 'Baja probabilidad';
}

getGravedadClass() {
  if (this.gravedad <= 30) return 'baja';
  if (this.gravedad <= 70) return 'media';
  return 'alta';
}

getGravedadIcon() {
  if (this.gravedad <= 30) return 'checkmark-circle';
  if (this.gravedad <= 70) return 'warning';
  return 'alert';
}

getGravedadColor() {
  if (this.gravedad <= 30) return 'success';
  if (this.gravedad <= 70) return 'warning';
  return 'danger';
}

getGravedadDescripcion() {
  if (this.gravedad <= 30) return 'Condición leve que puede ser monitoreada en casa';
  if (this.gravedad <= 70) return 'Condición moderada que podría requerir atención médica';
  return 'Condición grave que requiere atención médica inmediata';
}

}
