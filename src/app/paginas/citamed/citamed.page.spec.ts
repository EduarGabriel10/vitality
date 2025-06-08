import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CitamedPage } from './citamed.page';

describe('CitamedPage', () => {
  let component: CitamedPage;
  let fixture: ComponentFixture<CitamedPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CitamedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
