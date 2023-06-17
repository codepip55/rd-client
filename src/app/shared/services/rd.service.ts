import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AlertService } from './alert.service';
import { Observable, catchError, of } from 'rxjs';
import { UserService } from './user.service';

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
    this.alertService.add({ type: 'warning', message: `Could not ${action}` });
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

}
