import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SensorPage } from './sensor.page';

describe('SensorPage', () => {
  let component: SensorPage;
  let fixture: ComponentFixture<SensorPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SensorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
