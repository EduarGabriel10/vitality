import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-buscar',
  templateUrl: './buscar.page.html',
  styleUrls: ['./buscar.page.scss'],
  standalone: false
})
export class BuscarPage {
  inputUsuario: string = '';
  cargando: boolean = false;
  descripcionGeneral: string = '';
  paraQueSirve: string = '';
  indicaciones: string = '';
  efectosSecundarios: string = '';
  comoSeUsa: string = '';

  // Variable para controlar cuál sección está expandida
  seccionActiva: string | null = null;

  constructor(private http: HttpClient) {}

  async consultarIA() {
    const apiKey = 'AIzaSyB55emO_dxz-mFDBUzpj-d8Eheyi7smkNw';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Dame una descripción breve pero detallada en español del medicamento o pastilla: ${this.inputUsuario}.
              1. ¿Para qué sirve?
              2. Indicaciones
              3. Efectos secundarios
              4. Cómo se debe usar.`
            }
          ]
        }
      ]
    };

    try {
      const response = await this.http.post<any>(url, body).toPromise();
      const contenidoRespuesta: string = response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      if (contenidoRespuesta) {
        this.limpiarYSepararRespuesta(contenidoRespuesta);
      } else {
        this.descripcionGeneral = 'No se encontró una respuesta adecuada.';
      }
    } catch (error) {
      console.error('Error al consultar la IA:', error);
      this.descripcionGeneral = 'Error al consultar la IA.';
    }
  }

  limpiarYSepararRespuesta(texto: string) {
    const textoLimpio = texto.replace(/\*\*/g, '').trim();
    const partes = textoLimpio.split(/\n\n/);

    this.descripcionGeneral = partes[0] || '';

    partes.forEach(parte => {
      if (parte.includes('1. ¿Para qué sirve?')) {
        this.paraQueSirve = parte.replace('1. ¿Para qué sirve?', '').trim();
      }
      if (parte.includes('2. Indicaciones:')) {
        this.indicaciones = parte.replace('2. Indicaciones:', '').trim();
      }
      if (parte.includes('3. Efectos secundarios:')) {
        this.efectosSecundarios = parte.replace('3. Efectos secundarios:', '').trim();
      }
      if (parte.includes('4. Cómo se debe usar:')) {
        this.comoSeUsa = parte.replace('4. Cómo se debe usar:', '').trim();
      }
    });
  }

  toggleSeccion(seccion: string) {
    this.seccionActiva = this.seccionActiva === seccion ? null : seccion;
  }

  limpiarBusqueda() {
    this.inputUsuario = '';
    this.descripcionGeneral = '';
    this.paraQueSirve = '';
    this.indicaciones = '';
    this.efectosSecundarios = '';
    this.comoSeUsa = '';
    this.seccionActiva = null;
  }
}
