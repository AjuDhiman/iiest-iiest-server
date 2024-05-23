import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Employee,bo, fbo, fboRecipient, loginEmployee, fboShop, areaAllocation, editUserFiles, fostacVerification, fostacEnrollment, operGeneralSection, fostacAttendance, reportingManager, foscosVerification, hraVerification} from 'src/app/utils/registerinterface';
import { Observable, throwError} from 'rxjs';
import { catchError} from 'rxjs/operators'
import { config } from 'src/app/utils/config'
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

  public fboPayment(objId: string, addFbo: fbo, foscosGST: number, fostacGST: number, hygieneGST: number, foscosFixedCharge: number): Observable<any> {
    const url = `${this.url}/fbopayment/${objId}`;
    return this.http.post<any>(url, {...addFbo, foscosGST, fostacGST, hygieneGST, foscosFixedCharge}).pipe(
      catchError(
        this.handleError
      ));
  }
  
  public addFbo(objId: string, addFbo: fbo, foscosGST: number, fostacGST: number, hygieneGST: number, foscosFixedCharge: number): Observable<any> {
    const url = `${this.url}/fboregister/${objId}`
    return this.http.post<any>(url, {...addFbo, foscosGST, fostacGST,hygieneGST, foscosFixedCharge}).pipe(
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

  public addFboShop(objId: string, formInterface: any): Observable<any> {
    const url = `${this.url}/fbo/addshop/${objId}`;
    formInterface.append('byExcel', false)
    return this.http.post<any>(url, formInterface ).pipe(
      catchError(
        this.handleError
      ));
  }

  public addHygieneShop(objId: string, formInterface: any): Observable<any> {
    const url = `${this.url}/fbo/addhygieneshop/${objId}`;
    formInterface.append('byExcel', false)
    return this.http.post<any>(url, formInterface ).pipe(
      catchError(
        this.handleError
      ));
  }

  public addFboShopByExcel(objId: string, formInterface: any): Observable<any> {
    const url = `${this.url}/fbo/addshopbyexcel/${objId}`
    let shopData = {formInterface, byExcel: true}
    return this.http.post<any>(url, shopData).pipe(
      catchError(
        this.handleError
      ));
  }

  public uploadEbill(objId: string, formInterface: FormData): Observable<any> {
    const url = `${this.url}/fbo/uploadebill/${objId}`
    return this.http.put<any>(url, formInterface).pipe(
      catchError(
        this.handleError
      ));
  }

  public uploadOwnerPhoto(objId: string, formInterface: FormData): Observable<any> {
    const url = `${this.url}/fbo/uploadownerphoto/${objId}`
    return this.http.put<any>(url, formInterface).pipe(
      catchError(
        this.handleError
      ));
  }

  public uploadShopPhoto(objId: string, formInterface: FormData): Observable<any> {
    const url = `${this.url}/fbo/uploadshophoto/${objId}`
    return this.http.put<any>(url, formInterface).pipe(
      catchError(
        this.handleError
      ));
  }

  public uploadAadharPhoto(objId: string, formInterface: FormData): Observable<any> {
    const url = `${this.url}/fbo/uploadaadharphoto/${objId}`
    return this.http.put<any>(url, formInterface).pipe(
      catchError(
        this.handleError
      ));
  }

  public uploadFostacCertificate(objId: string, formInterface: FormData): Observable<any> {
    const url = `${this.url}/fbo/uploadfostaccertificate/${objId}`
    return this.http.put<any>(url, formInterface).pipe(
      catchError(
        this.handleError
      ));
  }

  public uploadFoscosLicense(objId: string, formInterface: FormData): Observable<any> {
    const url = `${this.url}/fbo/uploadfoscoslicense/${objId}`
    return this.http.put<any>(url, formInterface).pipe(
      catchError(
        this.handleError
      ));
  }

  //This service is written by chandan kumar for Business Owner
  public addbo(formInterface: any): Observable<any> {
    const url = `${this.url}/boregister`
    return this.http.post<any>(url, {...formInterface}).pipe(
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

  public forgotPassword(email: string): Observable<any> {
    const endpoint = `${this.url}/forgot-password`;
    return this.http.post<any>(endpoint, { email }).pipe(
      catchError(this.handleError)
    );
  }

  public resetPassword( username : string, email: string, temporaryPassword: string, newPassword: string): Observable<any> {
    const endpoint = `${this.url}/reset-password`;
    return this.http.post<any>(endpoint, { username, email, temporaryPassword, newPassword }).pipe(
      catchError(this.handleError)
    );
  }
  
  public deleteFbo(id: string, deletedBy: string): Observable<any> {
    const url = `${this.url}/deleteFbo/${id}`;
    return this.http.delete<any>(url, {body: {deletedBy}}).pipe(catchError(this.handleError));
  } 

  public deleteEmployee(id: string, deletedBy: string): Observable<any> {
    const url = `${this.url}/deleteEmployee/${id}`;
    return this.http.delete<any>(url, {body: {deletedBy}}).pipe(catchError(this.handleError));
  } 

  public deleteDoc(oid:string, docInfo: string): Observable<any> {
    const url = `${this.url}/deletedoc/${oid}`;
    return this.http.delete<any>(url, {body: {docInfo}}).pipe(catchError(this.handleError));
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

  public verifyMail(OId: string){
    const url = `${this.url}/verifymail/${OId}`;
    return this.http.post<any>(url,'').pipe(catchError(this.handleError));
  }

  public closeTicket(recpId: string, certificate: any){
    const url = `${this.url}/closeticket/${recpId}`;
    return this.http.post<any>(url, certificate).pipe(catchError(this.handleError));
  }

  public existingFboSale(objId: string, addFbo: fbo, foscosGST: number, fostacGST: number, hygieneGST:number, foscosFixedCharge: number, existingFboId: string): Observable<any> {
    const url = `${this.url}/existingfbosale/${objId}`
    return this.http.post<any>(url, {...addFbo, foscosGST, fostacGST, hygieneGST, foscosFixedCharge, existingFboId}).pipe(
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
    console.log(formInterface);
    const url = `${this.url}/foscosverification/${shopId}`
    return this.http.post<any>(url, formInterface).pipe(
      catchError(
        this.handleError
    ));
  }

  public verifyHra(shopId: string, formInterface: hraVerification){
    console.log(formInterface);
    const url = `${this.url}/hraverification/${shopId}`
    return this.http.post<any>(url, formInterface).pipe(
      catchError(
        this.handleError
    ));
  }

  public enrollRecipient(verId: string, formInterface: any){
    const url = `${this.url}/fostacenrollment/${verId}`
    return this.http.post<any>(url, formInterface).pipe(
      catchError(
        this.handleError
    ));
  }

  public filefoscos(verId: string, formInterface: FormData){
    const url = `${this.url}/foscosfilling/${verId}`
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

  public regiterRevert(shopId: string, formInterface: Object){
    const url = `${this.url}/registerrevert/${shopId}`
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

  public saveFoscosDocument(objId: string, formInterface: FormData){ // this service helps on posting data related to recipient attendance
    const url = `${this.url}/savefoscosdocuments/${objId}`
    console.log(objId, formInterface);
    return this.http.post<any>(url, formInterface).pipe(
      catchError(
        this.handleError
    ));
  }

  public saveHraDocument(objId: string, formInterface: FormData){ // this service helps on posting data related to recipient attendance
    const url = `${this.url}/savehradocuments/${objId}`
    console.log(objId, formInterface);
    return this.http.post<any>(url, formInterface).pipe(
      catchError(
        this.handleError
    ));
  }

  //for training batch
  public updateTrainingBatch(objId: string, editedData: Object): Observable<any>{
    const url = `${this.url}/updatetraingbatch/${objId}`;
    console.log(url);
    return this.http.put<any>(url, editedData).pipe(catchError(this.handleError));
  }

  public existingFboPayPage(objId: string, addFbo: fbo, foscosGST: number, fostacGST: number, hygieneGST:number, foscosFixedCharge: number, existingFboId: string): Observable<any> {
    const url = `${this.url}/existingfbo-paypage/${objId}`
    return this.http.post<any>(url, {...addFbo, foscosGST, fostacGST, hygieneGST, foscosFixedCharge, existingFboId}).pipe(
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
