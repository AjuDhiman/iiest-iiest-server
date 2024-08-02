import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators'
import { config } from 'src/app/utils/config'
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GetdataService {
  url = config.API_URL
  constructor(private http: HttpClient, private router: Router) { }


  //api for getting lsit of all employees and their details
  public getEmployeeData(): Observable<any> {
    const url = `${this.url}/allemployees`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  //api for getting general data related to eployee registration
  public getGeneralData(): Observable<any> {
    const url = `${this.url}/empgeneraldata`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  //api for getting user image
  public getUserImage(objId: string): Observable<any> {
    const url = `${this.url}/getuserimage/${objId}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  //api for getting user sign
  public getUserSign(objId: string): Observable<any> {
    const url = `${this.url}/getusersign/${objId}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  //api for getting upload url forn uploading dos to s3 bucket
  public getEmployeeDocUploadURL(name: string, format: string): Observable<any> {
    //convering image/jpg to image_jpg because "/" can effect route
    const url = `${this.url}/getemployeedocuploadurl/${name}?format=${format}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }


  //api for getting upload url forn uploading dos to s3 bucket
  public getSalesBasicDocUploadURL(name: string, format: string): Observable<any> {
    //convering image/jpg to image_jpg because "/" can effect route
    const url = `${this.url}/getsalesbasicdocuploadurl/${name}?format=${format}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }


  //api for getting upload url forn uploading dos to s3 bucket
  public generateFostacDocUrl(info: { name: string, format: string }): Observable<any> {
    const url = `${this.url}/generatefostacdocuploadurl`;
    return this.http.post<any>(url, { info }).pipe(catchError(this.handleError));
  }


  //api for getting upload url forn uploading dos to s3 bucket
  public generateFoscosDocUrl(info: { name: string, format: string }): Observable<any> {
    const url = `${this.url}/generatefoscosdocuploadurl`;
    return this.http.post<any>(url, { info }).pipe(catchError(this.handleError));
  }


  //api for getting upload url forn uploading dos to s3 bucket
  public generateHRADocUrl(info: { name: string, format: string }): Observable<any> {
    const url = `${this.url}/generatehradocuploadurl`;
    return this.http.post<any>(url, { info }).pipe(catchError(this.handleError));
  }


  //service for getting general data related to products
  public getFboGeneralData(): Observable<any> {
    const url = `${this.url}/fbogeneraldata`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  //service for getting invoice list
  public getInvoiceList(): Observable<any> {
    const url = `${this.url}/getinvoicelist`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  //service for getting cowork invoice list
  public getCoworkInvoiceList(): Observable<any> {
    const url = `${this.url}/getcoworkinvoicelist`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  //service for getting allocated area of a particular employee
  public getAllocatedAreas(objId: string): Observable<any> {
    const url = `${this.url}/allocatedareas/${objId}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getClientList(): Observable<any> {
    const url = `${this.url}/clientlist`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getSalesList(): Observable<any> {
    const url = `${this.url}/employeesaleslist`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getProductData(): Observable<any> {
    const url = `${this.url}/getproductdata`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  //api for getting notifications
  public getNotifications(purpose: string): Observable<any> {
    const url = `${this.url}/getnotifications?purpose=${purpose}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getSaleRecipients(salesId: String): Observable<any> {
    const url = `${this.url}/salerecipients/${salesId}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getSaleShops(salesId: String): Observable<any> {
    const url = `${this.url}/saleshops/${salesId}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getHygieneSaleShops(salesId: String): Observable<any> {
    const url = `${this.url}/hygienesaleshops/${salesId}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getPostData(): Observable<any> {
    const url = `${this.url}/getpostdata`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getFbolist(): Observable<any> {
    const url = `${this.url}/allfbolist`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getbolist(): Observable<any> {
    const url = `${this.url}/allbolist`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getUserRecord(): Observable<any> {
    const url = `${this.url}/employeeRecord`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getTicketVerificationData(): Observable<any> {
    const url = `${this.url}/ticketverificationdata`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getEbill(billId: string): Observable<any> {
    const url = `${this.url}/shop/ebill/${billId}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getInvoice(invoiceId: string): Observable<any> {
    const url = `${this.url}/fbo/invoice/${invoiceId}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  //service for getting cowork invoice 
  public getCoworkInvoice(invoiceId: string) {
    const url = `${this.url}/getcoworkinvoice/${invoiceId}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getPincodesData(stateName: string): Observable<any> {
    const url = `${this.url}/getPincodesData/${stateName}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getEmpCount(): Observable<any> {
    const url = `${this.url}/empcountbydept`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getCaseList(): Observable<any> {
    const url = `${this.url}/getcaseslist`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getRecipientList(): Observable<any> {
    const url = `${this.url}/getrecipientlist`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getMoreCaseInfo(product: string, candidateId: string): Observable<any> {
    const url = `${this.url}/morecaseinfo/${product}/${candidateId}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getEmpCountDeptWise(deptName: string): Observable<any> {
    const url = `${this.url}/employeelistdeptwise/${deptName}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getFostacVerifedData(candidateId: string): Observable<any> {
    const url = `${this.url}/getfostacverifieddata/${candidateId}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getFoscosVerifedData(candidateId: string): Observable<any> {
    const url = `${this.url}/getfoscosverifieddata/${candidateId}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getHraVerifedData(candidateId: string): Observable<any> {
    const url = `${this.url}/gethraverifieddata/${candidateId}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getFostacEnrolledData(verifiedDataId: string): Observable<any> {
    const url = `${this.url}/getfostacenrolleddata/${verifiedDataId}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getFoscosFiledData(verifiedDataId: string): Observable<any> {
    const url = `${this.url}/getfoscosfileddata/${verifiedDataId}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getOperGenSecData(candidateId: string): Observable<any> {
    const url = `${this.url}/getopergensecdata/${candidateId}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getAttenSecData(enrolledDataId: string): Observable<any> {
    const url = `${this.url}/getfostacattendata/${enrolledDataId}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getAuditLogs(candidateId: string): Observable<any> {
    const url = `${this.url}/getauditlogs/${candidateId}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getReverts(candidateId: string): Observable<any> {
    const url = `${this.url}/getreverts/${candidateId}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getEmpHiringData(): Observable<any> {
    const url: string = `${this.url}/getemphiringdata`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getProductSaledata(): Observable<any> {
    const url: string = `${this.url}/getproductsaledata`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getAreaWiseSaleData(): Observable<any> {
    const url: string = `${this.url}/getareawisesaledata`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getPersonWiseSaleData(): Observable<any> {
    const url: string = `${this.url}/getpersonwisesaledata`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getClientTypeSaleData(): Observable<any> {
    const url: string = `${this.url}/getclienttypesaledata`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getMonthWisesaleData(): Observable<any> {
    const url: string = `${this.url}/getmothwisesale`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getRepeatedCustomerData(): Observable<any> {
    const url: string = `${this.url}/getrepeatedcustdata`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }


  public getTicketDeliveryChartData(): Observable<any> {
    const url: string = `${this.url}/getticketdeliverychartdata`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getEmployeeUnderManager(): Observable<any> {
    const url: string = `${this.url}/getemployeeundermanager`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getEmpUnderManager(): Observable<any> {
    const url: string = `${this.url}/getempundermanager`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getTopSalesPersons(): Observable<any> {
    const url: string = `${this.url}/gettopsalespersons`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getTopProducts(): Observable<any> {
    const url: string = `${this.url}/gettopproducts`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getMostRepeatedCust(): Observable<any> {
    const url: string = `${this.url}/getmostrepeatedcust`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getKobData(): Observable<any> {
    const url: string = `${this.url}/getkobdata`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getTicketDeliveryData(recId: string): Observable<any> { // for geting delivery status of a recipient
    const url: string = `${this.url}/getticketdeliverydata/${recId}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getEmpNameNIdList(): Observable<any> { // for geting delivery status of a recipient
    const url: string = `${this.url}/getempnamelist`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getUnapprovedChequeSale(): Observable<any> { // for geting delivery status of a recipient
    const url: string = `${this.url}/getunapprovedchequesale`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getDocs(oid: string): Observable<any> { // for getting batchlist data from training
    oid = oid.replace(/\//g, 'slash'); // replace '/' by word slash so we can pass it to as api endpoint
    console.log(oid);
    const url: string = `${this.url}/getdocs/${oid}`;
    console.log(url);
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  //training get sevices fot training batch list
  public getBatchListData(): Observable<any> { // for getting batchlist data from training
    const url: string = `${this.url}/getbatchlistdata`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  //Audit get sevices for audit batch list
  public getAuditBatchListData(): Observable<any> { // for getting batchlist data from training
    const url: string = `${this.url}/getauditbatchlistdata`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getCandidateAuditBatch(objId: string): Observable<any> { // for getting audit batch info for a particular candidate
    const url: string = `${this.url}/getcandidateauditbatch/${objId}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  public getAreaWiseFboData(): Observable<any> { // for getting batchlist data from training
    const url: string = `${this.url}/getareawisefbo`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    // just a test ... more could would go here
    return throwError(() => err);
  }

  // for getting business_owner information
  public getboDetails(): Observable<any> {
    const url: string = `${this.url}/getbodata`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }
}