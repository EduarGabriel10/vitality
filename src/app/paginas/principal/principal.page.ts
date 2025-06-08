import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-principal',
  templateUrl: './principal.page.html',
  styleUrls: ['./principal.page.scss'],
  standalone: false
})
export class PrincipalPage implements OnInit {

  idioma: string = 'es';

  constructor(
    private translate: TranslateService
  ) { }

  ngOnInit() {
  }
  ionViewWillEnter() {
    const idiomaGuardado = localStorage.getItem('idioma') || 'es';
    this.idioma = idiomaGuardado;
    this.translate.use(this.idioma);
  }

}
