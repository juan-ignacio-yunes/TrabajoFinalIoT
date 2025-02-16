import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-dispositivo',
  templateUrl: './dispositivo.page.html',
  styleUrls: ['./dispositivo.page.scss'],
})
export class DispositivoPage implements OnInit {

  constructor() { }

  @Input()
  dispositivo: any;

  ngOnInit() {
  }
}
