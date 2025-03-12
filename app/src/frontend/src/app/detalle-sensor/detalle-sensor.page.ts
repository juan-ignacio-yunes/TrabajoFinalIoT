import { Component, OnInit } from '@angular/core';
import { GetMedicionService } from '../services/get-medicion.service';
import { ActivatedRoute} from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { posteadoresService } from '../services/posts.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-detalle-sensor',
  templateUrl: './detalle-sensor.page.html',
  styleUrls: ['./detalle-sensor.page.scss'],
})
export class DetalleSensorPage implements OnInit {
  
  id: number = 0;
  listado: any[] = [];
  private unsubscribe$ = new Subject<void>();
  value = 0;
  elemento: any
  medicion: any;
  private estadoApertura: number = 0;
  private medicionSubscription?: Subscription;
  private logSubscription?: Subscription;

  constructor(
    private _actRouter: ActivatedRoute,
    private router: Router,
    private medicionService: GetMedicionService,
    private postService: posteadoresService) { }
    

  ngOnInit() {
    this.id = Number(this._actRouter.snapshot.paramMap.get('id'));
    this.medicionService.getUltimaMedicion(this.id)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((data: any[]) => {
      console.log(data)

      //genero número aleatorio entre 10 y 60
      const nuevoValor = (Math.floor(Math.random() * 51) + 10).toString();

      //reemplazo por uno nuevo aleatorio para simular una nueva medición 
      data[0].valor = nuevoValor;
      
      this.listado = data;
    });
  }

 

  irAInicio() {
    console.log("vamos a Inicio");
    this.router.navigate(['/home']);
  }

  irAMediciones() {
    console.log("vamos a Mediciones del sensor");
    this.router.navigate(['mediciones',this.id]);
  }

  irALog() {
    console.log("vamos a Mediciones del sensor");
    this.router.navigate(['logs',this.id]);
  }

  accionarElectrovalvula() {
    const medicion = {
      medicionId: null,
      fecha: new Date().toISOString().slice(0, 19).replace('T', ' '),
      valor: this.listado[0].valor,
      dispositivoId: this.router.url.split('/').pop()
    };
  
    this.medicionSubscription = this.postService.enviarMedicion(medicion).subscribe(res => {
      console.log(res);
    }, err => {
      console.error(err);
    });
  
    const log = {
      logRiegoId: null,
      apertura: this.estadoApertura,//  estado inicial/actual de la electrovalvula
      fecha: new Date().toISOString().slice(0, 19).replace('T', ' '),
      electrovalvulaId: this.router.url.split('/').pop()
    };
  
    this.logSubscription = this.postService.enviarLog(log).subscribe(res => {
      console.log(res);
      // Alterna el estado de la electrovalvula después de enviar el log
      this.estadoApertura = this.estadoApertura === 0 ? 1 : 0;
    }, err => {
      console.error(err);
    });
  }


  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    if (this.medicionSubscription) {
      this.medicionSubscription.unsubscribe();
    }
    if (this.logSubscription) {
      this.logSubscription.unsubscribe();
    }
  }


}
