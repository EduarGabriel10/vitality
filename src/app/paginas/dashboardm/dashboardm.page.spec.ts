import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardmPage } from './dashboardm.page';

describe('DashboardmPage', () => {
  let component: DashboardmPage;
  let fixture: ComponentFixture<DashboardmPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardmPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
