import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatosmPage } from './datosm.page';

describe('DatosmPage', () => {
  let component: DatosmPage;
  let fixture: ComponentFixture<DatosmPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DatosmPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
