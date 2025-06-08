import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private apiUrl = 'https://libretranslate.de/translate'; // Servidor público

  constructor(private http: HttpClient) {}

  translateText(text: string, targetLanguage: string): Observable<any> {
    const body = {
      q: text,
      source: 'auto',  // Detecta automáticamente el idioma original
      target: targetLanguage,
      format: 'text'
    };

    return this.http.post(this.apiUrl, body);
  }
}
