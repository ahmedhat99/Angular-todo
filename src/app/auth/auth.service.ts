import {
  HttpClient,
  HttpErrorResponse,
  HttpHandlerFn,
  HttpHeaders,
  HttpRequest,
} from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { User } from './user.model';
import { Router, UrlTree } from '@angular/router';

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}
export function tokenHeaderInterceptor(
  req: HttpRequest<any>,
  next: HttpHandlerFn
) {
  const authService = inject(AuthService);
  if (!authService.getUser()) {
    return next(req);
  }
  const token = authService.getUser()?.token;
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`,
  });
  const modifiedRequest = req.clone({ headers: headers });
  return next(modifiedRequest);
}
export function authGuard(): boolean | UrlTree {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isLoggedIn = authService.getUser() !== null;

  return isLoggedIn ? true : router.createUrlTree(['/auth']);
}


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _user = signal<User | null>(null);
  getUser(): User | null {
    return this._user();
  }
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly token = computed(() => this._user()?.token);
  private tokenExpirationTimer: any;
  setUser(user: User | null) {
    this._user.set(user);
  }

  clearUser() {
    this._user.set(null);
  }

  httpClient = inject(HttpClient);
  router = inject(Router);

  signup(
    email: string | null | undefined,
    password: string | null | undefined
  ) {
    return this.httpClient
      .post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBqofImdjb69xj4uqAboly-Ui2E-9D9SN8',
        {
          email: email,
          password: password,
          returnSecureToken: true,
        }
      )
      .pipe(
        catchError(this.handleError),
        tap((resData) => {
          this.handleAuthentication(
            resData.email,
            resData.localId,
            resData.idToken,
            +resData.expiresIn
          );
        })
      );
  }

  login(email: string | null | undefined, password: string | null | undefined) {
    return this.httpClient
      .post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBqofImdjb69xj4uqAboly-Ui2E-9D9SN8',
        {
          email: email,
          password: password,
          returnSecureToken: true,
        }
      )
      .pipe(
        catchError(this.handleError),
        tap((resData) => {
          this.handleAuthentication(
            resData.email,
            resData.localId,
            resData.idToken,
            +resData.expiresIn
          );
        })
      );
  }

  logout() {
    this._user.set(null);
    this.router.navigate(['/auth']);
    localStorage.removeItem('userAuth');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }
  }
  autoLogin() {
    const userAuth = localStorage.getItem('userAuth');
    if (!userAuth) {
      return;
    }
    const parsedUser: {
      email: string;
      id: string;
      _token: string;
      _tokenExpirationDate: string;
    } = JSON.parse(userAuth);
    const loadedUser = new User(
      parsedUser.email,
      parsedUser.id,
      parsedUser._token,
      new Date(parsedUser._tokenExpirationDate)
    );
    if (loadedUser.token) {
      this._user.set(loadedUser);
      const expirationDuration =
        new Date(parsedUser._tokenExpirationDate).getTime() -
        new Date().getTime();
      this.autoLogout(expirationDuration);
    }
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  private handleAuthentication(
    email: string,
    localId: string,
    token: string,
    expiresIn: number
  ) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const newUser = new User(email, localId, token, expirationDate);
    this._user.set(newUser);
    this.autoLogout(expiresIn * 1000);
    localStorage.setItem('userAuth', JSON.stringify(newUser));
  }
  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An Unknown error Occured!';
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(() => new Error(errorMessage));
    }
    switch (errorRes.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'This email exists already';
        break;
      case 'INVALID_LOGIN_CREDENTIALS':
        errorMessage = 'Invalid Credentials';
        break;
    }
    return throwError(() => new Error(errorMessage));
  }
}
