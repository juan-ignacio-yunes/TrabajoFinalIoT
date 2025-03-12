import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetalleSensorPage } from './detalle-sensor.page';

const routes: Routes = [
  {
    path: '',
    component: DetalleSensorPage
  },
  {
    path: ':id',
    component: DetalleSensorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalleSensorPageRoutingModule {}
