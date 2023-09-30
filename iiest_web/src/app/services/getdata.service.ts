import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError} from 'rxjs';
import { catchError} from 'rxjs/operators'
import { config } from '../utils/config'
import { Router } from '@angular/router';import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GetdataService {
  url = config.API_URL
  constructor(private http: HttpClient, private router:Router) { }


 getEmployeeData():Observable<any>{
  const url = `${this.url}/allemployees`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
 }

 getGeneralData():Observable<any>{
  const url = `${this.url}/generaldata`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
 }

 private handleError(err: HttpErrorResponse): Observable<never> {
  // just a test ... more could would go here
  return throwError(() => err);
}

}
