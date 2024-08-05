import { Injectable } from '@angular/core';
import { config } from 'src/app/utils/config';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { saveAs } from 'file-saver'
import * as JSZip from 'jszip';

@Injectable({
  providedIn: 'root'
})
export class UtilitiesService {
  url = config.API_URL;
  DOC_URL = config.DOC_URL;

  constructor(private http: HttpClient, private router: Router) { }

  employeeData: any = [];

  public setData(data: any) { // call this method from the component and pass the result you get from the API to set it in the service
    this.employeeData = data;
  }

  public getData() { // call this method from the component to get the already set data
    return this.employeeData;
  }

  // this method makes https post request for contact us data
  public contactiiest(data: Object): Observable<any> {
    const url = `${this.url}/contact-us`;
    return this.http.post<any>(url, { ...data }).pipe(catchError(this.handleError));
  }

  public downloadFile(fileType: String): void {
    const fileURL = `assets/${fileType}.xlsx`;
    this.http.get(fileURL, { responseType: 'blob' }).subscribe((res: Blob) => {
      const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${fileType}.xlsx`);
    });
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    // just a test ... more could would go here
    return throwError(() => err);
  }

  public async downloadDoc(allDocument: string, contentTypes: string) {
    const documentIds = Array.from(allDocument);
    const zip = new JSZip();

    console.log(documentIds);

    if (documentIds.length <= 1) {
      const documentId = documentIds;
      this.http.get(documentId[0], { responseType: 'blob' }).subscribe((data: Blob) => {
        console.log(data)
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(data);
        a.href = objectUrl;
        a.download = `${new Date().getTime()}.pdf`; // Replace with the desired filename and extension
        a.click();
        URL.revokeObjectURL(objectUrl);
      }, error => {
        console.error('Download failed:', error);
      });
    } else {
      // Fetch and add each document to the zip file
      await Promise.all(documentIds.map(async (documentId, index) => {
        const contentType = contentTypes[index];
        const response = await this.http.get(documentId, { responseType: 'blob' }).toPromise();

        if (response instanceof Blob) {
          zip.file(`document`, response, { binary: true });
        } else {
          console.error(`Error fetching document ${documentId}`);
        }
      }));

      // Generate and download the zip file
      zip.generateAsync({ type: 'blob' }).then((blob) => {
        saveAs(blob, 'documents.zip');
      });
    }
  }

  public trimObjectStrings(inputObj: any) {
    Object.keys(inputObj).forEach(key => {
      if (typeof inputObj[key] === 'string') {
        inputObj[key] = inputObj[key].trim();
      } else if (typeof inputObj[key] === 'object' && inputObj[key] !== null) {
        this.trimObjectStrings(inputObj[key]);
      }
    });
  }


  //methord for getting extention from file name 
  public getExtention(filename: string): string {

    const nameArr: string[] = filename.split('.');
    const ext: string = nameArr[nameArr.length - 1];

    return ext;
  }

}
