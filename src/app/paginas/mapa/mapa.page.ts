import { Component, ElementRef, ViewChild } from '@angular/core';
import { AlertController } from '@ionic/angular';

declare var google: any;

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
  standalone: false
})
export class MapaPage {
  @ViewChild('map', { static: false }) mapElement!: ElementRef;
  map: any;
  userCoords = { lat: -2.219125, lng: -80.853010 }; // Santa Elena

  constructor(private alertCtrl: AlertController) {}

  ionViewDidEnter() {
    this.loadMap(this.userCoords);
  }

  loadMap(coords: { lat: number; lng: number }) {
    const latLng = new google.maps.LatLng(coords.lat, coords.lng);
    const mapOptions = {
      center: latLng,
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    new google.maps.Marker({
      position: latLng,
      map: this.map,
      title: 'Ubicación Inicial',
    });
  }

  async elegirTipoCentro(coords: { lat: number; lng: number }) {
    const alert = await this.alertCtrl.create({
      header: '¿Qué deseas buscar?',
      buttons: [
        {
          text: 'Hospitales',
          handler: () => this.buscarLugaresCercanos(coords, 'hospital'),
        },
        {
          text: 'Farmacias',
          handler: () => this.buscarLugaresCercanos(coords, 'farmacia'),
        },
        {
          text: 'Centros de Salud',
          handler: () => this.buscarLugaresCercanos(coords, 'centro de salud'),
        },
        {
          text: 'Cancelar',
          role: 'cancel',
        },
      ],
    });
    await alert.present();
  }

  buscarLugaresCercanos(coords: { lat: number; lng: number }, tipo: string) {
    const location = new google.maps.LatLng(coords.lat, coords.lng);
    const request = {
      location,
      radius: 5000,
      query: tipo
    };

    const service = new google.maps.places.PlacesService(this.map);
    service.textSearch(request, async (results: any[], status: string) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
        const lugares = results.map((lugar: any) => ({
          name: lugar.name,
          location: lugar.geometry.location,
          distancia: this.calcularDistancia(coords.lat, coords.lng, lugar.geometry.location.lat(), lugar.geometry.location.lng())
        })).sort((a, b) => a.distancia - b.distancia);

        const botones = lugares.slice(0, 5).map((lugar) => ({
          text: `🏥 ${lugar.name} (${lugar.distancia.toFixed(2)} km)`,
          handler: () => this.centrarEnLugar(lugar)
        }));

        const alert = await this.alertCtrl.create({
          header: 'Resultados más cercanos',
          subHeader: 'Selecciona uno para ver su ubicación',
          buttons: [...botones, { text: 'Cancelar', role: 'cancel' }],
        });
        await alert.present();
      } else {
        this.presentAlert('Sin resultados', `No se encontraron ${tipo}s cercanos.`);
      }
    });
  }

  centrarEnLugar(lugar: any) {
    this.map.setCenter(lugar.location);
    this.map.setZoom(16);

    new google.maps.Marker({
      position: lugar.location,
      map: this.map,
      title: lugar.name,
      icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
    });
  }

  calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRad(value: number): number {
    return value * Math.PI / 180;
  }

  async presentAlert(titulo: string, mensaje: string) {
    const alert = await this.alertCtrl.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present();
  }

  buscarConUbicacionFija() {
    this.elegirTipoCentro(this.userCoords);
  }

  buscarConUbicacionActual() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          this.loadMap(coords);
          this.elegirTipoCentro(coords);
        },
        () => {
          this.presentAlert('Error', 'No se pudo obtener tu ubicación.');
        }
      );
    } else {
      this.presentAlert('Error', 'Geolocalización no soportada.');
    }
  }
}
