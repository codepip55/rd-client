import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, filter, first, of, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { AuthApiResponse } from '../models/api-response';
import { AlertService } from './alert.service';

const apiUrl = environment.apiBaseUrl;

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject: BehaviorSubject<User | null>;
  private tokenSubject: BehaviorSubject<string>;
  private loadingSubject: BehaviorSubject<boolean>;
  // private silentLoadingSubject: BehaviorSubject<boolean>;
  private refreshTimeout: ReturnType<typeof setTimeout>;

  public token$: Observable<string>;
  public currentUser$: Observable<User | null>;
  public loading$: Observable<boolean>;
  public silentLoading$: Observable<boolean>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private alertService: AlertService
  ) {
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.tokenSubject = new BehaviorSubject<string>('');
    this.loadingSubject = new BehaviorSubject<boolean>(true);

    this.token$ = this.tokenSubject.asObservable();
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.loading$ = this.loadingSubject.asObservable();
  }

  public login(redirectTo: string = '/') {
    this.loadingSubject.next(true);

    const nonce = 'rd_redirect_' + Math.random().toString(36).replace(/[^a-z]+/g, '');
    const state = { redirectTo };

    window.sessionStorage.setItem(nonce, JSON.stringify(state));

    document.location.href = environment.loginUrl + `?state=${nonce}`;
  }

  public logout() {
    this.loadingSubject.next(true);
    this.http.get<any>(`${apiUrl}/auth/logout`).pipe(
      catchError(err => {
        console.error(err);
        this.alertService.add({ type: 'warning', message: 'Could not remove refresh cookie' });
        return of();
      }),
      tap(_ => {
        this.currentUserSubject.next(null);
        this.tokenSubject.next('');

        if (this.refreshTimeout) clearTimeout(this.refreshTimeout);

        this.router.navigate(['']);
        this.loadingSubject.next(false);
      })
    ).subscribe();
  }

  public handleCallback() {
    let nonce: string;
    this.loadingSubject.next(true);
    this.route.queryParamMap.pipe(
      tap(qs => nonce = qs.get('state') || ''),
      filter(qs => !!qs.get('code')),
      first(),
      switchMap(qs => this.http.get<AuthApiResponse>(`${apiUrl}/auth/vatsim?code=${qs.get('code')}`))
    ).subscribe(
      res => {
        this.currentUserSubject.next(res.user);
        this.tokenSubject.next(res.token);
        // Attempt to refresh 1 min before token expires
        clearTimeout(this.refreshTimeout);
        this.refreshTimeout = setTimeout(() => this.silentAuth(), res.expiresIn - 60 * 1000);

        if (nonce !== '') {
          const state = window.sessionStorage.getItem(nonce);
          if (state !== null) {
            const stateObj = JSON.parse(state);
            const redirectTo = this.router.parseUrl(stateObj.redirectTo);
            this.router.navigateByUrl(redirectTo);
            this.loadingSubject.next(false);
            return;
          }
        }
        // this.router.navigate(['/']);
        this.loadingSubject.next(false);
      }, err => {
        console.error(err);
        this.alertService.add({ type: 'warning', message: 'Could not log in. Please try again' });
        this.router.navigate(['']);
        this.loadingSubject.next(false);
      }
    );
  }

  public silentAuth(initialLoad: boolean = false) {
    this.loadingSubject.next(true);
    this.http.get<AuthApiResponse>(`${apiUrl}/auth/silent`, { withCredentials: true }).pipe(
      first()
    ).subscribe(
      res => {
        this.currentUserSubject.next(res.user);
        this.tokenSubject.next(res.token);
        clearTimeout(this.refreshTimeout);
        this.refreshTimeout = setTimeout(() => this.silentAuth(), res.expiresIn - 60 * 1000);
        this.loadingSubject.next(false);

      }, _err => {
        if (!initialLoad) this.alertService.add({ type: 'warning', message: 'Couldn\'t refresh session. Please save your work and reload the page' });
        this.loadingSubject.next(false);
      }
    );
  }

  public get currentUser(): User | null { return this.currentUserSubject.value; }
  public get token(): String { return this.tokenSubject.value; }
  public get loggedIn(): boolean { return this.currentUser !== null; }
}
