import { Component, OnInit } from '@angular/core';
import { GetLogService } from '../services/get-log.service';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.page.html',
  styleUrls: ['./logs.page.scss'],
})
export class LogsPage implements OnInit {
  
  id: number = 0;
  listado: any[] = [];
  private unsubscribe$ = new Subject<void>();

  constructor(private _actRouter: ActivatedRoute, private logService: GetLogService, private router: Router) { }

  ngOnInit() {
    this.id = Number(this._actRouter.snapshot.paramMap.get('id'));
    this.logService.getLogs(this.id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: any[]) => {
        console.log(data);
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