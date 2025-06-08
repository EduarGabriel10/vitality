import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { App } from '@capacitor/app';

App.addListener('appUrlOpen', (data) => {
  const url = new URL(data.url);
  const oobCode = url.searchParams.get('oobCode');

  if (oobCode) {
    // Redirige dentro de la app a la página de reset-password con el código
    window.location.href = `/resetearcontrasena?oobCode=${oobCode}`;
  }
});


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
