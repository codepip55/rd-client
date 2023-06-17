import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { Subscription } from 'rxjs';

import { Alert, AlertService } from '../../services/alert.service';
import { faBan, faCheckCircle, faCircleExclamation, faExclamationTriangle, faInfo } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  animations: [
    trigger('toast', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateX(100%)',
        }),
        animate('500ms ease', style({
          opacity: 1,
          transform: 'translateX(0%)',
        })),
      ]),
    ]),
  ],
})

export class AlertComponent implements OnInit, OnDestroy {
  faExclamationTriangle = faExclamationTriangle;
  faInfo = faInfo;
  faCheckCirle = faCheckCircle;
  faCircleExclamation = faCircleExclamation;

  alerts: Alert[] = [];
  alertSub: Subscription;

  constructor(
    private alertService: AlertService
  ) { }

  icon(type: string) {
    switch (type) {
      case 'success':
        return faCheckCircle;
      case 'warning':
        return faExclamationTriangle;
      case 'danger':
        return faCircleExclamation;
      default:
        return faInfo;
    }
  }

  textDark(type: string): string {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'danger':
        return 'text-red-400';
      default:
        return 'text-sky-400';
    }
  }

  // textLight(type: string): string {
  //   switch (type) {
  //     case 'success':
  //       return 'text-green-200';
  //     case 'warning':
  //       return 'text-yellow-200';
  //       case 'danger':
  //       return 'text-red-200';
  //     default:
  //       return 'text-sky-200';
  //   }
  // }

  ngOnInit(): void {
    this.alertSub = this.alertService.alerts$.subscribe(a => {
      this.alerts.push(a);
      setTimeout(() => this.remove(a), 5000);
    });
  }

  remove(alert: Alert): void {
    this.alerts = this.alerts.filter(a => a !== alert);
  }

  ngOnDestroy(): void {
    this.alertSub.unsubscribe();
  }
}