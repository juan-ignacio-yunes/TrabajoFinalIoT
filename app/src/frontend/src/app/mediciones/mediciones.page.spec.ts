import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MedicionesPage } from './mediciones.page';

describe('MedicionesPage', () => {
  let component: MedicionesPage;
  let fixture: ComponentFixture<MedicionesPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(MedicionesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
