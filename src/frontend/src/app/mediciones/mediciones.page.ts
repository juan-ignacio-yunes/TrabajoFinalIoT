/* import { Component, OnInit } from '@angular/core';
import { GetMedicionService } from '../services/get-medicion.service';
import { ActivatedRoute, Router} from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-mediciones',
  templateUrl: './mediciones.page.html',
  styleUrls: ['./mediciones.page.scss'],
})
export class MedicionesPage implements OnInit {
  
  id: number = 0;
  listado: any[] = [];
  private unsubscribe$ = new Subject<void>();

  constructor(private _actRouter: ActivatedRoute, private medicionService: GetMedicionService, private router: Router) { }

  ngOnInit() {
    this.id = Number(this._actRouter.snapshot.paramMap.get('id'));
    this.medicionService.getMediciones(this.id)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((data: any[]) => {
      this.listado = data;
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  irAInicio() {
    console.log("vamos a Inicio");
    this.router.navigate(['/home']);
  }
}
 */

import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-mediciones',
  templateUrl: './mediciones.page.html',
  styleUrls: ['./mediciones.page.scss'],
})

export class MedicionesPage implements OnInit {
  idMascota: number = 2;  // Debería venir de la sesión o user logueado
  datos: Array<{ fecha: string; peso_promedio: number }> = [];
  ultimoPeso: number | null = null;
  fechaInicio: string = '';
  fechaFin: string = '';

  private myChart: Chart | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Tomamos parámetros de la URL, si existen
    const params = this.route.snapshot.queryParams;

    // Fecha por defecto: hoy para fin
    this.fechaFin = params['fin'] || new Date().toISOString().split('T')[0];

    // Fecha por defecto: 3 meses atrás para inicio
    const inicio = new Date();
    inicio.setMonth(inicio.getMonth() - 3);
    this.fechaInicio = params['inicio'] || inicio.toISOString().split('T')[0];

    // ID de la mascota (hardcodeado en 2 si no se pasa)
    this.idMascota = params['id'] || 2;

    this.obtenerMediciones();
  }

  actualizarFechas(): void {
    // Verificamos que la fechaInicio sea menor o igual a fechaFin
    const inicioDate = new Date(this.fechaInicio);
    const finDate = new Date(this.fechaFin);

    if (inicioDate > finDate) {
      // Podés mostrar un Toast, Alert o simplemente un console.error
      console.error('La fecha de inicio no puede ser posterior a la fecha de fin');
      return; // Evitamos continuar
    }

    // Actualiza la URL con las nuevas fechas sin recargar la página
    this.router.navigate([], {
      queryParams: {
        id: this.idMascota,
        inicio: this.fechaInicio,
        fin: this.fechaFin
      },
      queryParamsHandling: 'merge',
    });
    
    // Vuelve a consultar la API con el nuevo rango
    this.obtenerMediciones();
  }

  private obtenerMediciones(): void {
    // Ruta al backend
    const url = `http://localhost:8000/mediciones?id=${this.idMascota}&inicio=${this.fechaInicio}&fin=${this.fechaFin}`;

    // Definimos un tipo para la respuesta esperada
    interface RespuestaMediciones {
      datos: Array<{ fecha: string; peso_promedio: number }>;
      ultimo_peso: number | null;
    }

    this.http.get<RespuestaMediciones>(url).subscribe(
      (res) => {
        console.log('Respuesta de la API:', res);
        this.datos = res.datos;
        this.ultimoPeso = res.ultimo_peso;
        this.crearGrafico();
      },
      (error) => {
        console.error('Error al obtener mediciones:', error);
      }
    );
  }

  private crearGrafico(): void {
    // Si ya existe un gráfico previo, lo destruimos para evitar superposiciones
    if (this.myChart) {
      this.myChart.destroy();
    }

    // Preparamos arrays para el eje X (labels) y el eje Y (data)
    const labels = this.datos.map((item) => item.fecha);
    const data = this.datos.map((item) => item.peso_promedio);

    // Obtenemos el elemento <canvas> del DOM
    const canvas = document.getElementById('myChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('No se encontró el elemento <canvas> con id="myChart".');
      return;
    }

    // Obtenemos el contexto 2D. Si es null, detenemos.
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('No se pudo obtener el contexto 2D del canvas.');
      return;
    }

    // Creamos la instancia de Chart.js
    this.myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Peso promedio (kg)',
            data,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // Para que se adapte al tamaño del contenedor
      },
    });
  }
}

