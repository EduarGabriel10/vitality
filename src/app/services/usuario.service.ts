import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'https://vitality-bzt5.onrender.com';  // URL base

  constructor(private http: HttpClient) {}

  /**
   * Registra un nuevo usuario.
   * @param usuario Datos del usuario a registrar
   * @returns Observable con la respuesta del servidor
   */
  registrarUsuario(usuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/usuario/create`, usuario);  // El endpoint específico
  }

  loginUsuario(usuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/usuario/login`, usuario );
  }
  
  registerFromGoogle(usuario: { email: string, nombre: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/usuario/createFromGoogle`, usuario);
  }

  actualizarUsuario(usuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/usuario/update`, usuario);
  }

  getUsuarioPorEmail(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/usuario/get/${email}`);
  }

    actualizarMedico(id: number, data: any) {
    return this.http.put<any>(`${this.apiUrl}/api/medico/actualizar/${id}`, data);
  }

  /**
   * Obtiene las citas de un usuario específico
   * @param usuarioId ID del usuario
   * @returns Observable con la lista de citas del usuario
   */
  obtenerCitasPorUsuario(usuarioId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/citas/usuario/${usuarioId}`);
  }

  /**
   * Obtiene las consultas de un usuario específico
   * @param usuarioId ID del usuario
   * @returns Observable con la lista de consultas del usuario
   */
  obtenerConsultasPorUsuario(usuarioId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/consultas/usuario/${usuarioId}`);
  }

  /**
   * Guarda una nueva consulta de diagnóstico
   * @param payload Datos de la consulta a guardar
   * @returns Observable con la respuesta del servidor
   */
  guardarConsulta(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/consultas/create`, payload);
  }

  /**
   * Agenda una nueva cita
   * @param citaData Datos de la cita a agendar
   * @returns Observable con la respuesta del servidor
   */
  agendarCita(citaData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/citas`, citaData);
  }

  /**
   * Cancela una cita existente
   * @param citaId ID de la cita a cancelar
   * @returns Observable con la respuesta del servidor
   */
  cancelarCita(citaId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/citas/${citaId}`);
  }

  /**
   * Elimina una consulta del historial
   * @param consultaId ID de la consulta a eliminar
   * @returns Observable con la respuesta del servidor
   */
  eliminarConsulta(consultaId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/consultas/${consultaId}`);
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
   * Elimina una reseña
   * @param id ID de la reseña a eliminar
   * @param usuarioId ID del usuario que realiza la acción
   * @returns Observable con la respuesta del servidor
   */
  eliminarResena(id: number, usuarioId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/resena/eliminar/${id}`, { usuarioId });
  }
}
