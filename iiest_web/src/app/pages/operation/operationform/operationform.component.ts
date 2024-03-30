import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GeneralSectionComponent } from './general-section/general-section.component';
import { RegisterService } from 'src/app/services/register.service';
import { IconDefinition, faFilePdf, faFileImage, faDownload } from '@fortawesome/free-solid-svg-icons';
import { ViewDocumentComponent } from '../../modals/view-document/view-document.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { UtilitiesService } from '../../../services/utilities.service';

@Component({
  selector: 'app-operationform',
  templateUrl: './operationform.component.html',
  styleUrls: ['./operationform.component.scss']
})

export class OperationformComponent implements OnInit {
  //global variables 
  customerId: string;
  candidateId: string = '';
  verifiedData: any;
  verifiedDataId: string;
  enrolledDataId: string;
  verifiedStatus: boolean;
  enrolledStatus: boolean;
  attendanceStatus: boolean;
  attenSecResult: string;
  salesDate: string;
  productType: string;
  conformationText: string;
  activeTab: string = 'form';
  faFilePdf: IconDefinition = faFilePdf;
  faFileImage: IconDefinition = faFileImage;
  faDownload: IconDefinition = faDownload;
  documents: { name: string, src: string, format: string }[] = [];
  isTrainer: boolean = false;

  @ViewChild(GeneralSectionComponent) generalsec: GeneralSectionComponent;

  constructor(
    private activatedRoute: ActivatedRoute,
    private _registerService: RegisterService,
    private modalService: NgbModal,
    private http: HttpClient,
    private _utilService: UtilitiesService
  ) {
  }

  ngOnInit(): void {
    this.candidateId = this.activatedRoute.snapshot.params['id'];
    this.getUserProductType();
  }

  //this methord for geting recipient customer id 
  getCustomerId($event: any): void {
    this.customerId = $event;
  }

  //this methord catch sales date from verification section which we will pass in enrollment section
  getSalesData($event: string) {
    this.salesDate = $event;
  }

  // this methord catch verification Id from verification section which we will pass in enrollment section
  getVerifiedDataId($event: string) {
    this.verifiedDataId = $event;
  }

  // this methord catch verification data from verification section 
  getVerifiedData($event: string) {
    this.verifiedData = $event;
  }

  // this methord catch verification sataus from verification section which we will pass in enrollment section
  getVerifiedStatus($event: boolean) {
    this.verifiedStatus = $event
  }

  // this methord catch enrollment Id from Enrollment section which we will pass in Attendance section
  getEnrolledDataId($event: string) {
    this.enrolledDataId = $event;
  }

  // this methord catch enrollment status from Enrollment section which we will pass in Attendance section
  getEnrolledStatus($event: boolean) {
    this.enrolledStatus = $event;
  }

  // this methord catch attendance status from Attendance section which we will pass in Certification section
  getAttendanceStatus($event: boolean) {
    this.attendanceStatus = $event;
  }

  // this methord catch attendance status from Attendance section which we will pass in Certification section
  getAttenSecResult($event: string) {
    this.attenSecResult = $event;
  }

  getDocuments($event: any): void {
    $event.forEach((item: any) => {
      if (!this.documents.find((elem: any) => (elem.name === item.name)) && item.src) {
        this.documents.push(item);
      }
    });
  }

  getFileIcon(type: string) {
    let fileIcon: IconDefinition = faFilePdf;
    switch (type) {
      case 'pdf':
        fileIcon = faFilePdf
        break;
      case 'image':
        fileIcon = faFileImage
        break;
    }
    return fileIcon
  }

  getUserProductType() {
    let user: any = this._registerService.LoggedInUserData();
    let parsedUser = JSON.parse(user);
    let panelType = parsedUser.panel_type;

    switch (panelType) {
      case 'Fostac Panel':
        this.productType = 'Fostac';
        break;
      case 'Foscos Panel':
        this.productType = 'Foscos';
        break;
      case 'Hygiene Panel':
        this.productType = 'Hygiene';
        break;
      case 'FSSAI Training Panel':
        this.productType = 'Fostac';
        this.isTrainer = true;
        break;
      default:
        this.productType = 'Fostac';
    }
  }

  toogleTabs(tab: string) {
    this.activeTab = tab;
  }

  viewDocument(res: any): void {
    const modalRef = this.modalService.open(ViewDocumentComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.doc = res;
  }

  downloadDoc(documentId: string, contentType: string) {
    // Make a request to the backend to download the document
    this.http.get(`http://localhost:3000/${documentId}`, { responseType: 'blob' })
      .subscribe((data: Blob) => {
        // Create a Blob URL for the downloaded document
        const downloadUrl = window.URL.createObjectURL(data);

        // Determine the file extension based on content type
        let fileExtension = '';
        switch (contentType) {
          case 'image/jpeg':
            fileExtension = 'jpg';
            break;
          case 'image/png':
            fileExtension = 'png';
            break;
          case 'application/pdf':
            fileExtension = 'pdf';
            break;
          default:
            fileExtension = 'file';
            break;
        }

        // Create a link element and trigger the download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `document_${documentId}`; // Set the filename with the appropriate file extension
        link.click();

        // Cleanup the Blob URL
        window.URL.revokeObjectURL(downloadUrl);
      });
  }
}
