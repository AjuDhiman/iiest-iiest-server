import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { IconDefinition, faDownload, faArrowAltCircleLeft, faArrowAltCircleRight } from '@fortawesome/free-solid-svg-icons';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { config } from 'src/app/utils/config';

@Component({
  selector: 'app-view-document',
  templateUrl: './view-document.component.html',
  styleUrls: ['./view-document.component.scss']
})
export class ViewDocumentComponent implements OnInit {

  //icons
  faDownload: IconDefinition = faDownload;
  faArrowAltCircleLeft: IconDefinition = faArrowAltCircleLeft;
  faArrowAltCircleRight: IconDefinition = faArrowAltCircleRight;

  //doc var will contain doc detail what type pf doc it is
  doc: any;
  pdfSrc: any;

  DOC_URL = config.DOC_URL;

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
        this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(`DOC_URL/${this.doc.src}`);
      }
    }
  }

  next() { //methord fpr changing to next pic in case of multidoc true
    const len: number = this.doc.src.length;

    this.activeSlide++;
    if (this.activeSlide >= len) {
      this.activeSlide = 0;
    }
  }

  prev() {  //methord for chnaging to previous pic in case of mutidoc true
    const len: number = this.doc.src.length;

    this.activeSlide--;
    if (this.activeSlide < 0) {
      this.activeSlide = (len - 1);
    }
  }

  downloadDoc(documentId: any, contentType: any) { //methord for downloading doc
    console.log(typeof(documentId));
    this._utilService.downloadDoc(documentId, contentType);
  }

}
