import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImagenMedidorPage } from './imagen-medidor.page';

describe('ImagenMedidorPage', () => {
  let component: ImagenMedidorPage;
  let fixture: ComponentFixture<ImagenMedidorPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ImagenMedidorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
