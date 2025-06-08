import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiagmedicoPage } from './diagmedico.page';

describe('DiagmedicoPage', () => {
  let component: DiagmedicoPage;
  let fixture: ComponentFixture<DiagmedicoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DiagmedicoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
