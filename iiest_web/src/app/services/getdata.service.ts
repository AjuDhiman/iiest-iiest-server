import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError} from 'rxjs';
import { catchError} from 'rxjs/operators'
import { config } from '../utils/config'
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GetdataService {
  url = config.API_URL
  constructor(private http: HttpClient, private router:Router) { }


 public getEmployeeData():Observable<any>{
  const url = `${this.url}/allemployees`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
 }

 public getGeneralData():Observable<any>{
  const url = `${this.url}/empgeneraldata`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
 }

 public getUserImage(): Observable<any>{
  const url = `${this.url}/getuserimage`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
 }

 public getFboGeneralData():Observable<any>{
  const url = `${this.url}/fbogeneraldata`;
  return this.http.get<any>(url).pipe(catchError(this.handleError));
 }

 public getAllocatedAreas(objId: string): Observable<any>{
  const url = `${this.url}/allocatedareas/${objId}`;
  return this.http.get<any>(url).pipe(catchError(this.handleError));
 }

 public getSalesList():Observable<any>{
  const url = `${this.url}/employeesaleslist`;
  return this.http.get<any>(url).pipe(catchError(this.handleError));
 }

 public getProductData():Observable<any>{
  const url = `${this.url}/getproductdata`;
  return this.http.get<any>(url).pipe(catchError(this.handleError));
 }

 public getSaleRecipients(salesId: String): Observable<any>{
  const url = `${this.url}/salerecipients/${salesId}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
 }

 public getSaleShops(salesId: String): Observable<any>{
  const url = `${this.url}/saleshops/${salesId}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
 }
 
 public getPostData():Observable<any>{
  const url = `${this.url}/getpostdata`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
 }

 public getFbolist():Observable<any>{
  const url = `${this.url}/allfbolist`;
  return this.http.get<any>(url).pipe(catchError(this.handleError));
 }

 public getUserRecord():Observable<any>{
  const url = `${this.url}/employeeRecord`;
  return this.http.get<any>(url).pipe(catchError(this.handleError));
 }

 public getPincodesData(stateName:string):Observable<any>{
  const url = `${this.url}/getPincodesData/${stateName}`;
  return this.http.get<any>(url).pipe(catchError(this.handleError));
 }

 private handleError(err: HttpErrorResponse): Observable<never> {
  // just a test ... more could would go here
  return throwError(() => err);
}


}
