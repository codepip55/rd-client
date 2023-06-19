import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AlertService } from './alert.service';
import { Observable, catchError, of } from 'rxjs';
import { UserService } from './user.service';
import { Aircraft } from '../models/aircraft.model';

const baseUrl = environment.apiBaseUrl;

@Injectable({
  providedIn: 'root'
})
export class RdService {

  constructor(
    private http: HttpClient,
    private alertService: AlertService,
    private userService: UserService
  ) { }

  private handleError<T>(err: any, res: T, action: string): Observable<T> {
    console.error(err);
    this.alertService.add({ type: 'warning', message: err.error.message ? err.error.message : `Could not ${action}` });
    return of(res);
  }

  logonPosition() {
    return this.http.post(`${baseUrl}/positions/logon`, {}).pipe(
      catchError(err => this.handleError(err, { user: null }, 'logon position'))
    )
  }

  findControllerByCurrentUser() {
    return this.http.get(`${baseUrl}/positions?cid=${this.userService.currentUser?.cid}`).pipe(
      catchError(err => this.handleError(err, { user: null }, 'get connected position'))
    )
  }

  logoffPosition() {
    return this.http.post(`${baseUrl}/positions/logoff`, {}).pipe(
      catchError(err => this.handleError(err, { user: null }, 'logoff position'))
    )
  }

  sendAircraftByCode(code: string) {
    return this.http.post(`${baseUrl}/rd/aircraft?code=${code}`, {}).pipe(
      catchError(err => this.handleError(err, { rd: null, vatsim: {} }, 'send aircraft'))
    )
  }

  sendAircraftByCallsign(callsign: string) {
    return this.http.post(`${baseUrl}/rd/aircraft?callsign=${callsign}`, {}).pipe(
      catchError(err => this.handleError(err, { rd: null, vatsim: {} }, 'send aircraft'))
    )
  }

  getControllerList() {
    return this.http.get<{ count: number, data: Aircraft[] | null }>(`${baseUrl}/rd/list/${this.userService.currentUser?._id}`).pipe(
      catchError(err => this.handleError(err, { count: 0, data: null }, 'get rd list'))
    )
  }
}
