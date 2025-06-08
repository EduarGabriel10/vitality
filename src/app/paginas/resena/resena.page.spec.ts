import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResenaPage } from './resena.page';

describe('ResenaPage', () => {
  let component: ResenaPage;
  let fixture: ComponentFixture<ResenaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ResenaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
