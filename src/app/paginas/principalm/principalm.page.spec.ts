import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrincipalmPage } from './principalm.page';

describe('PrincipalmPage', () => {
  let component: PrincipalmPage;
  let fixture: ComponentFixture<PrincipalmPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PrincipalmPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
