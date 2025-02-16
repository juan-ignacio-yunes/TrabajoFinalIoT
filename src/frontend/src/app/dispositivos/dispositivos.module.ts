import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DispositivosPageRoutingModule } from './dispositivos-routing.module';

import { DispositivosPage } from './dispositivos.page';
import { DispositivoPageModule } from '../dispositivo/dispositivo.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DispositivosPageRoutingModule,
    DispositivoPageModule
  ],
  declarations: [DispositivosPage]
})
export class DispositivosPageModule {}
