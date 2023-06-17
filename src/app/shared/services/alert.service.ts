import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Alert {
  type: 'success' | 'warning' | 'info' | 'danger';
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  alerts$: Subject<Alert>;

  constructor() {
    this.alerts$ = new Subject<Alert>();
  }

  add(alert: Alert): void {
    alert.type ? null : alert.type = 'warning';
    this.alerts$.next(alert);
  }
}