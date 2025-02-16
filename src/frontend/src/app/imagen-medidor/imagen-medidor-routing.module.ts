import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ImagenMedidorPage } from './imagen-medidor.page';

const routes: Routes = [
  {
    path: '',
    component: ImagenMedidorPage
  },
  {
    path: ':id',
    component: ImagenMedidorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ImagenMedidorPageRoutingModule {}
