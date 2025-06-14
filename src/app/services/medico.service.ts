import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ResumenSintoma {
  tipoRespuesta: number;
  conteos: { [key: string]: number };
}

export interface Horario {
  id: number;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  duracionCita: number;
  activo: boolean;
  medicoId: number;
}

export interface Slot {
  id: number;
  horaInicio: string;
  horaFin: string;
  disponible: boolean;
  horarioId: number;
  horario: Horario;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

export interface Medico {
  id: number;
  nombre: string;
  especialidad: string;
}

export interface Cita {
  id: number;
  fechaHora: string;
  estado: string;
  usuarioId: number;
  medicoId: number;
  slotId: number;
  usuario: Usuario;
  medico: Medico;
  slot: Slot;
}

@Injectable({
  providedIn: 'root'
})
export class MedicoService {
  private apiUrl = 'https://vitality-bzt5.onrender.com';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todas las citas médicas
   * @returns Observable con la lista de citas
   */
  obtenerCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/api/citas`);
  }

  /**
   * Actualiza el estado de una cita
   * @param citaId ID de la cita a actualizar
   * @param estado Nuevo estado de la cita
   * @returns Observable con la respuesta del servidor
   */
  actualizarEstadoCita(citaId: number, estado: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/api/citas/${citaId}`, { estado });
  }

  /**
   * Obtiene las consultas médicas
   * @returns Observable con las consultas y estadísticas
   */
  obtenerConsultas(): Observable<{consultas: any[], estadisticas: any}> {
    return this.http.get<{consultas: any[], estadisticas: any}>(`${this.apiUrl}/api/consultas`);
  }

  /**
   * Elimina una consulta médica
   * @param consultaId ID de la consulta a eliminar
   * @returns Observable con la respuesta del servidor
   */
  eliminarConsulta(consultaId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/consultas/${consultaId}`);
  }

  /**
   * Obtiene una consulta médica por su ID
   * @param consultaId ID de la consulta a obtener
   * @returns Observable con la consulta
   */
  obtenerConsultaPorId(consultaId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/consultas/${consultaId}`);
  }

  /**
   * Obtiene el resumen de síntomas
   * @returns Observable con el resumen de síntomas
   */
  obtenerResumenSintomas(): Observable<{resumenPorSintoma: { [key: number]: ResumenSintoma }}> {
    return this.http.get<{resumenPorSintoma: { [key: number]: ResumenSintoma }}>(
      `${this.apiUrl}/api/respuestas/resumen/sintomas`
    );
  }

  /**
   * Inicia sesión como médico
   * @param credenciales Objeto con email y contrasena
   * @returns Observable con la respuesta del servidor
   */
  loginMedico(credenciales: { email: string, contrasena: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/medico/login`, credenciales);
  }

  /**
   * Obtiene todas las reseñas
   * @returns Observable con la lista de reseñas
   */
  obtenerResenas(): Observable<{ message: string; resenas: any[] }> {
    return this.http.get<{ message: string; resenas: any[] }>(`${this.apiUrl}/api/resena`);
  }

  /**
   * Crea una nueva reseña
   * @param resena Datos de la reseña a crear
   * @returns Observable con la respuesta del servidor
   */
  crearResena(resena: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/resena`, resena);
  }

  /**
   * Envía un diagnóstico médico
   * @param datos Datos del diagnóstico a enviar
   * @returns Observable con la respuesta del servidor
   */
  enviarDiagnostico(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/enviar-diagnostico`, datos);
  }

  // Obtiene la lista de médicos
  // @returns Observable con la lista de médicos
  obtenerMedicos(): Observable<{message: string, medicos: Medico[]}> {
    return this.http.get<{message: string, medicos: Medico[]}>(`${this.apiUrl}/api/medico`);
  }
}
