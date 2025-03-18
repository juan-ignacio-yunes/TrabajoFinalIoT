import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CreacionPageRoutingModule } from './creacion-routing.module';
import { CreacionPage } from './creacion.page';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    CreacionPageRoutingModule,
    HttpClientModule
  ],
  declarations: [CreacionPage]
})
export class CreacionPageModule {}