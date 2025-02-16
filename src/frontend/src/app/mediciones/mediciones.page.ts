import { Component, OnInit } from '@angular/core';
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
