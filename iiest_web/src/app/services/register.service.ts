import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Employee, fbo, fboRecipient, loginEmployee, fboShop, areaAllocation, editUserFiles, fostacVerification, fostacEnrollment, operGeneralSection, fostacAttendance, reportingManager, foscosVerification} from '../utils/registerinterface';
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

  public addFboShop(objId: string, addFboShop: any): Observable<any> {
    const url = `${this.url}/fbo/addshop/${objId}`
    return this.http.post<any>(url, addFboShop).pipe(
      catchError(
        this.handleError
      ));
  }

  public addFboShopByExcel(objId: string, addFboShop: any): Observable<any> {
    const url = `${this.url}/fbo/addshopbyexcel/${objId}`
    return this.http.post<any>(url, addFboShop).pipe(
      catchError(
        this.handleError
      ));
  }

  public editEmployeeFiles(editForm: editUserFiles):  Observable<any> {
    const url = `${this.url}/edituserfiles`
    return this.http.post<any>(url, editForm).pipe(
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

  public assignManager(empId: string, areaAllocation: reportingManager){
    const url = `${this.url}/assignmanager/${empId}`;
    return this.http.post<any>(url, areaAllocation).pipe(catchError(this.handleError));
  }

  public closeTicket(recpId: string, certificate: any){
    const url = `${this.url}/closeticket/${recpId}`;
    return this.http.post<any>(url, certificate).pipe(catchError(this.handleError));
  }

  public existingFboSale(objId: string, addFbo: fbo, foscosGST: number, fostacGST: number, foscosFixedCharge: number, existingFboId: string): Observable<any> {
    const url = `${this.url}/existingfbosale/${objId}`
    return this.http.post<any>(url, {...addFbo, foscosGST, fostacGST, foscosFixedCharge, existingFboId}).pipe(
      catchError(
        this.handleError
    ));
  }

  public verifyFostac(recId: string, formInterface: fostacVerification){
    const url = `${this.url}/fostacverification/${recId}`
    return this.http.post<any>(url, formInterface).pipe(
      catchError(
        this.handleError
    ));
  }

  public verifyFoscos(shopId: string, formInterface: foscosVerification){
    const url = `${this.url}/foscosverification/${shopId}`
    return this.http.post<any>(url, formInterface).pipe(
      catchError(
        this.handleError
    ));
  }

  public enrollRecipient(verId: string, formInterface: fostacEnrollment){
    const url = `${this.url}/fostacenrollment/${verId}`
    return this.http.post<any>(url, formInterface).pipe(
      catchError(
        this.handleError
    ));
  }

  public postOperGenData(recId: string, formInterface: operGeneralSection){
    const url = `${this.url}/postopergendata/${recId}`
    return this.http.post<any>(url, formInterface).pipe(
      catchError(
        this.handleError
    ));
  }

  public submitAttenSec(enrId: string, formInterface: fostacAttendance){ // this service helps on posting data related to recipient attendance
    const url = `${this.url}/fostacattendance/${enrId}`
    return this.http.post<any>(url, formInterface).pipe(
      catchError(
        this.handleError
    ));
  }

  public existingFboPayPage(objId: string, addFbo: fbo, foscosGST: number, fostacGST: number, foscosFixedCharge: number, existingFboId: string): Observable<any> {
    const url = `${this.url}/existingfbo-paypage/${objId}`
    return this.http.post<any>(url, {...addFbo, foscosGST, fostacGST, foscosFixedCharge, existingFboId}).pipe(
      catchError(
        this.handleError
    ));
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

  replaceToken(userUpdated: any){
    sessionStorage.removeItem('token');
    sessionStorage.setItem('token', userUpdated.newToken)
    sessionStorage.removeItem('LoggedInUser');
    sessionStorage.setItem('LoggedInUser', JSON.stringify(userUpdated.newData))
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
