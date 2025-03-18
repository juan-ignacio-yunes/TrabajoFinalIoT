import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreacionPage } from './creacion.page';

describe('RegistroPage', () => {
  let component: CreacionPage;
  let fixture: ComponentFixture<CreacionPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(CreacionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
