import { Injectable, Inject } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

import { UserService } from '../services/user.service';

@Injectable()
export class MainHttpInterceptor implements HttpInterceptor {

  constructor(
    private userService: UserService,
    @Inject('BASE_API_URL') private baseUrl: string
  ) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.userService.token;

    if (request.url.match(this.baseUrl)) { // apiBaseUrl call
      if (token !== undefined) {
        const authReq = request.clone({
          headers: request.headers.set('Authorization', `Bearer ${token}`),
          withCredentials: true
        });
        return next.handle(authReq);
      } else {
        return next.handle(request);
      }
    } else { // excludes rd server (apiBaseUrl)
      return next.handle(request);
    }

  }
}