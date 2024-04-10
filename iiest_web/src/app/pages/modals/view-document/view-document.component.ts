import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { IconDefinition, faDownload, faArrowAltCircleLeft, faArrowAltCircleRight } from '@fortawesome/free-solid-svg-icons';
import { UtilitiesService } from '../../../services/utilities.service';

@Component({
  selector: 'app-view-document',
  templateUrl: './view-document.component.html',
  styleUrls: ['./view-document.component.scss']
})
export class ViewDocumentComponent implements OnInit {

  faDownload: IconDefinition = faDownload;
  faArrowAltCircleLeft: IconDefinition = faArrowAltCircleLeft;
  faArrowAltCircleRight: IconDefinition = faArrowAltCircleRight;
  doc: any;
  pdfSrc: any;

  activeSlide: number = 0;

  constructor(public activeModal: NgbActiveModal,
    private sanitizer: DomSanitizer,
    private _utilService: UtilitiesService) {

  }
  ngOnInit(): void {
    if (this.doc === 'pdf') {
      if(this.doc.multipleDoc){
        this.pdfSrc = this.doc.src.map((src:any) => this.sanitizer.bypassSecurityTrustResourceUrl(src));
      } else {
        this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(`http://localhost:3000/${this.doc.src}`);
      }
    }
  }

  next() {
    const len: number = this.doc.src.length;

    this.activeSlide++;
    if (this.activeSlide >= len) {
      this.activeSlide = 0;
    }
  }

  prev() {
    const len: number = this.doc.src.length;

    this.activeSlide--;
    if (this.activeSlide < 0) {
      this.activeSlide = (len - 1);
    }
  }

  downloadDoc(documentId: any, contentType: any) {
    console.log(typeof(documentId));
    this._utilService.downloadDoc(documentId, contentType);
  }

}
