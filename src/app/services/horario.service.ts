import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HorarioService {
  private apiUrl = 'https://vitality-bzt5.onrender.com/api/horarios-atencion';

  constructor(private http: HttpClient) {}

  getHorarios(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getHorariosByMedico(medicoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/medico/${medicoId}`);
  }

  createHorario(horarioData: any): Observable<any> {
    return this.http.post(this.apiUrl, horarioData);
  }

  deleteHorario(horarioId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${horarioId}`);
  }
  
}
