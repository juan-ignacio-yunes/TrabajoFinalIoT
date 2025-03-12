import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SensorPageRoutingModule } from './sensor-routing.module';
import { SensorPage } from './sensor.page';
import { DetalleSensorPageModule } from '../detalle-sensor/detalle-sensor.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SensorPageRoutingModule,
    DetalleSensorPageModule
  ],
  declarations: [SensorPage]
})
export class SensorPageModule {}
