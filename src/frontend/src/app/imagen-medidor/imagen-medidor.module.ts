import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ImagenMedidorPageRoutingModule } from './imagen-medidor-routing.module';

import { ImagenMedidorPage } from './imagen-medidor.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ImagenMedidorPageRoutingModule
  ],
  declarations: [ImagenMedidorPage],
  exports: [ImagenMedidorPage]
})
export class ImagenMedidorPageModule {}
