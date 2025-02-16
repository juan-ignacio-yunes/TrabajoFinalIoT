import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'estadoSuelo'
})
export class EstadoSueloPipe implements PipeTransform {

  transform(value: number): string {
    if (value < 10) {
      return 'suelo saturado';
    } else if (value < 30) {
      return 'CC';
    } else {
      return 'Seco. Regar URGENTE';
    }
  }

}
