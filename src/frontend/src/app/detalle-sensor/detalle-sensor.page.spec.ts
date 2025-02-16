import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleSensorPage } from './detalle-sensor.page';

describe('DetalleSensorPage', () => {
  let component: DetalleSensorPage;
  let fixture: ComponentFixture<DetalleSensorPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(DetalleSensorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
