import { Injectable } from '@angular/core';
import { config } from '../utils/config';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { saveAs} from 'file-saver'

@Injectable({
  providedIn: 'root'
})
export class UtilitiesService {
  url = config.API_URL

  constructor(private http: HttpClient, private router:Router) { }

  employeeData: any = [];

public setData(data:any) { // call this method from the component and pass the result you get from the API to set it in the service
  this.employeeData = data;
}


public getData() { // call this method from the component to get the already set data
  return this.employeeData;
}


// this method makes https post request for contact us data
public contactiiest(data: Object): Observable<any>{
  const url = `${this.url}/contact-us`;
  return this.http.post<any>(url, {...data}).pipe(catchError(this.handleError));
}

public downloadFile(fileType:String): void {
  const fileURL = `../assets/${fileType}.xlsx`;
  this.http.get(fileURL, {responseType: 'blob'}).subscribe((res:Blob) => {
    const blob = new Blob([res],{type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    saveAs(blob, `${fileType}.xlsx`);
  });
}

private handleError(err: HttpErrorResponse): Observable<never> {
  // just a test ... more could would go here
  return throwError(() => err);
}

}
