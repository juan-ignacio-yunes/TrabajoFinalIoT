import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { AlertController } from '@ionic/angular';

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
  private alertaMostrada = false; // variable para evitar alertas repetidas

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private alertController: AlertController
  ) {}

  // Método para redirigir a la página de inicio. Se usará en el botón Inicio
  irAInicio(): void {
    this.router.navigate(['/home']); // Asegurate de que '/home' es la ruta correcta a la página de inicio
  }

  ngOnInit(): void {
    // Se toman parámetros de la URL, si existen
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

  async alertaFechas(mensaje: string)  {
    if (this.alertaMostrada) {
      return; // Evita mostrar alertas repetidas
    }

    this.alertaMostrada = true; // Marcamos que la alerta se está mostrando

    const alert = await this.alertController.create({
      header: 'Error',
      message: mensaje,
      buttons: ['Aceptar'],
    });

    await alert.present();

    // Cuando se cierre la alerta, permitimos que vuelva a mostrarse en el futuro
    alert.onDidDismiss().then(() => {
      this.alertaMostrada = false;
    });
  }

  actualizarFechas(): void {
    // Se verifica que la fechaInicio sea menor o igual a fechaFin
    const inicioDate = new Date(this.fechaInicio);
    const finDate = new Date(this.fechaFin);

    if (inicioDate > finDate) {
      // Se espera un breve momento para que se cierre el selector de fechas y luego se muestra el Alert (una alternativa searía un Toast) y un console.error
      setTimeout(() => {
        this.alertaFechas('La fecha de inicio no puede ser posterior a la fecha de fin');
      }, 300); // 300ms es suficiente para que el selector se cierre 
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

    // Se define un tipo para la respuesta esperada
    interface RespuestaMediciones {
      datos: Array<{ fecha: string; peso_promedio: number }>;
      ultimo_peso: number | null;
    }

    this.http.get<RespuestaMediciones>(url).subscribe(
      (res) => {
        console.log('Respuesta de la API:', res);
        this.datos = res.datos.map(item => ({
          fecha: item.fecha.split('T')[0], // Removiendo la hora de la fecha
          peso_promedio: item.peso_promedio
        }));
        this.ultimoPeso = res.ultimo_peso;
        this.crearGrafico();
      },
      (error) => {
        console.error('Error al obtener mediciones:', error);
      }
    );
  }

  private crearGrafico(): void {
    // Si ya existe un gráfico previo, se lo destruye para evitar superposiciones
    if (this.myChart) {
      this.myChart.destroy();
    }

    // Se preparan arrays para el eje X (labels) y el eje Y (data)
    const labels = this.datos.map((item) => item.fecha);
    const data = this.datos.map((item) => item.peso_promedio);

    // Se obtiene el elemento <canvas> del DOM
    const canvas = document.getElementById('myChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('No se encontró el elemento <canvas> con id="myChart".');
      return;
    }

    // Se obtiene el contexto 2D. Si es null, detenemos.
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('No se pudo obtener el contexto 2D del canvas.');
      return;
    }

    // Se crea la instancia de Chart.js
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
        plugins: {
          tooltip: {
            callbacks: {
              label: (tooltipItem) => `Peso: ${tooltipItem.raw} kg` // Formato del tooltip
            }
          }
        }
      },
    });
  }
}