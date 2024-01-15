import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Employee, fbo, fboRecipient, loginEmployee, fboShop, areaAllocation} from '../utils/registerinterface';
import { Observable, throwError} from 'rxjs';
import { catchError} from 'rxjs/operators'
import { config } from '../utils/config'
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  msg: string = "Hello Welcome";
  url = config.API_URL
  constructor(private http: HttpClient, private router:Router) { }

  public addEmployee(addemployee: Employee): Observable<any> {
    const url = `${this.url}/empregister`
    return this.http.post<any>(url, addemployee).pipe(
      catchError(
        this.handleError
      ));
  }

  public fboPayment(objId: string, addFbo: fbo, foscosGST: number, fostacGST: number, foscosFixedCharge: number): Observable<any> {
    const url = `${this.url}/fbopayment/${objId}`;
    return this.http.post<any>(url, {...addFbo, foscosGST, fostacGST, foscosFixedCharge}).pipe(
      catchError(
        this.handleError
      ));
  }
  
  public addFbo(objId: string, addFbo: fbo, foscosGST: number, fostacGST: number, foscosFixedCharge: number): Observable<any> {
    const url = `${this.url}/fboregister/${objId}`
    return this.http.post<any>(url, {...addFbo, foscosGST, fostacGST, foscosFixedCharge}).pipe(
      catchError(
        this.handleError
    ));
  }

  public addFboRecipent(objId: string, addFboRecipent: fboRecipient[]): Observable<any> {
    const url = `${this.url}/fbo/addrecipient/${objId}`
    console.log(addFboRecipent);
    console.log(objId);
    return this.http.post<any>(url, addFboRecipent).pipe(
      catchError(
        this.handleError
      ));
  }

  public addFboShop(objId: string, addFboShop: fboShop[]): Observable<any> {
    const url = `${this.url}/fbo/addshop/${objId}`
    return this.http.post<any>(url, addFboShop).pipe(
      catchError(
        this.handleError
      ));
  }

  public loginEmployee(loginemployee: loginEmployee): Observable<any> {
    const url = `${this.url}/login`;
    return this.http.post<any>(url, loginemployee).pipe(catchError(this.handleError));
  } 
  
  public deleteFbo(id: string, deletedBy: string): Observable<any> {
    const url = `${this.url}/deleteFbo/${id}`;
    return this.http.delete<any>(url, {body: {deletedBy}}).pipe(catchError(this.handleError));
  } 

  public deleteEmployee(id: string, deletedBy: string): Observable<any> {
    const url = `${this.url}/deleteEmployee/${id}`;
    return this.http.delete<any>(url, {body: {deletedBy}}).pipe(catchError(this.handleError));
  } 

  public updateEmployee(objId: string, employee: Employee, editedBy: string): Observable<any>{
    const url = `${this.url}/editEmployee/${objId}`;
    return this.http.put<any>(url, {...employee, editedBy}).pipe(catchError(this.handleError));
  }

  public updateFbo(objId: string, editedData: Object, editedBy: string): Observable<any>{
    const url = `${this.url}/editFbo/${objId}`;
    return this.http.put<any>(url, {...editedData, editedBy}).pipe(catchError(this.handleError));
  }

  public registerArea(objId: string, areaAllocation: areaAllocation){
    const url = `${this.url}/registerarea/${objId}`;
    return this.http.post<any>(url, areaAllocation).pipe(catchError(this.handleError));
  }


  private handleError(err: HttpErrorResponse): Observable<never> {
    // just a test ... more could would go here
    return throwError(() => err);
  }

  storeToken(currentUser:any){
    sessionStorage.setItem('issLoggedIn', 'true')
    sessionStorage.setItem('token', currentUser.authToken)
    sessionStorage.setItem("LoggedInUser", JSON.stringify(currentUser.employee_user));
    
  }

  getToken(){
    return sessionStorage.getItem('token')
  }
  LoggedInUserData(){
    return sessionStorage.getItem('LoggedInUser')
  }

  isLoggedIn(){
    return !!sessionStorage.getItem('token')
  }
  signout(){
    sessionStorage.clear();
    this.router.navigate([''])
  }
}
