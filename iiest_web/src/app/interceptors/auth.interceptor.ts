import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegisterService } from '../services/register.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private _registerServices:RegisterService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    //if(request instanceof HttpResponse)
    const token = this._registerServices.getToken();
    const req = request.clone({ headers: request.headers.set('auth-token', `${token}`), withCredentials: true});
    return next.handle(req);
  }
}
