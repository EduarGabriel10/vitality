import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResenamPage } from './resenam.page';

describe('ResenamPage', () => {
  let component: ResenamPage;
  let fixture: ComponentFixture<ResenamPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ResenamPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
