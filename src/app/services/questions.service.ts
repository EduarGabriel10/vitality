import { Injectable } from '@angular/core';
import { Question } from '../modelo/question.model';

@Injectable({
  providedIn: 'root'
})
export class QuestionsService {
  private respiratoryQuestions: Question[] = [
    // Datos Personales
    {
      id: 1,
      text: '¿Cuál es su edad? (Opcional)',
      responseType: 'text',
      section: 'Datos Personales'
    },
    // Síntomas de Tos y Flema
    {
      id: 2,
      text: '¿Tiene tos? ¿Es seca, con flema o con sangre?',
      responseType: 'yesnodetail',
      section: 'Tos y Flema',
      detailOptions: ['Seca', 'Con flema', 'Con sangre']
    },
    {
      id: 3,
      text: '¿Ha notado cambios en el color de la flema (amarilla, verde, con sangre)?',
      responseType: 'yesnodetail',
      section: 'Tos y Flema',
      detailOptions: ['Amarilla', 'Verde', 'Con sangre']
    },
    // Dificultad Respiratoria
    {
      id: 4,
      text: '¿Tiene dificultad para respirar o sensación de falta de aire?',
      responseType: 'yesnodetail',
      section: 'Dificultad Respiratoria',
      detailOptions: ['En reposo', 'Al caminar', 'Durante el ejercicio', 'Al dormir']
    },
    {
      id: 5,
      text: '¿Escucha silbidos al respirar (sibilancias)?',
      responseType: 'yesnodetail',
      section: 'Dificultad Respiratoria',
      detailOptions: ['Solo al dormir', 'Durante el ejercicio', 'Todo el día']
    },
    {
      id: 6,
      text: '¿Siente dolor u opresión en el pecho? ¿En qué zona exactamente?',
      responseType: 'yesnodetail',
      section: 'Dificultad Respiratoria',
      detailOptions: ['Parte central del pecho', 'Lado izquierdo', 'Lado derecho', 'Difuso']
    },
    // Síntomas Generales
    {
      id: 7,
      text: 'Tiene o ha tenido fiebre? ¿Y qué tan alta ha sido?',
      responseType: 'yesnodetail',
      section: 'Síntomas Generales',
      detailOptions: ['Menos de 38°C', 'Entre 38°C y 39°C', 'Más de 39°C']
    },
    {
      id: 8,
      text: '¿Experimenta fatiga o cansancio inusual?',
      responseType: 'yesnodetail',
      section: 'Síntomas Generales',
      detailOptions: ['Durante el día', 'Al hacer esfuerzo mínimo', 'Constante']
    },
    {
      id: 12,
      text: '¿Desde hace cuánto tiempo tiene estos síntomas?',
      responseType: 'directOptions',
      section: 'Síntomas Generales',
      detailOptions: ['Menos de 1 semana', '1-4 semanas', 'Más de 4 semanas']
    },
    // Factores de Riesgo
    {
      id: 9,
      text: '¿Fuma o ha estado expuesto a sustancias irritantes (como polvo, químicos, humo)?',
      responseType: 'yesnodetail',
      section: 'Factores de Riesgo',
      detailOptions: ['Fuma actualmente', 'Ex fumador', 'Exposición a químicos', 'Ambiente con humo o polvo', 'Exposición laboral']
    },
    {
      id: 10,
      text: '¿Tiene antecedentes familiares de asma, EPOC u otras enfermedades respiratorias?',
      responseType: 'yesnodetail',
      section: 'Factores de Riesgo',
      detailOptions: ['Asma', 'EPOC', 'Fibrosis quística', 'Otra enfermedad respiratoria']
    },
    {
      id: 13,
      text: '¿Ha tenido recientemente fiebre, resfriado o contacto con personas enfermas?',
      responseType: 'yesnodetail',
      section: 'Factores de Riesgo',
      detailOptions: ['Fiebre reciente', 'Resfriado reciente', 'Contacto con enfermos']
    },
    {
      id: 14,
      text: '¿Tiene alergias conocidas o síntomas que empeoran con polvo, polen o animales?',
      responseType: 'yesnodetail',
      section: 'Factores de Riesgo',
      detailOptions: ['Polvo', 'Polen', 'Animales', 'Otros alérgenos']
    },
    // Otros Indicadores
    {
      id: 11,
      text: '¿Sus síntomas empeoran en algún momento específico (por la noche, durante el ejercicio, con cambios de clima)?',
      responseType: 'yesnodetail',
      section: 'Otros Indicadores',
      detailOptions: ['Por la noche', 'Durante el ejercicio', 'Con cambios de clima']
    }
  ];

  constructor() { }

  getQuestions(): Question[] {
    return this.respiratoryQuestions;
  }

  saveAnswers(questions: Question[]) {
    // Encontrar la pregunta de edad (ID 1) y obtener su respuesta
    const edadPregunta = questions.find(q => q.id === 1);
    const edad = edadPregunta?.answer || '0';

    const respuestas = questions.map(q => ({
      id: q.id,
      pregunta: q.text,
      respuesta: q.answer,
      detalles: q.additionalInfo || '',
      seccion: q.section || ''
    }));

    const blob = new Blob([JSON.stringify(respuestas, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'respuestas_sintomas.json';
    a.click();

    window.URL.revokeObjectURL(url);
  }
}
