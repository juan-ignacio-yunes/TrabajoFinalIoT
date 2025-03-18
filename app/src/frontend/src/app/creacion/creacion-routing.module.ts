import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreacionPage } from './creacion.page';

const routes: Routes = [
  {
    path: '',
    component: CreacionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreacionPageRoutingModule {}