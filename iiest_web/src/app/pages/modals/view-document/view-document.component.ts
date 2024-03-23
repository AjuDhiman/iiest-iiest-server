import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-view-document',
  templateUrl: './view-document.component.html',
  styleUrls: ['./view-document.component.scss']
})
export class ViewDocumentComponent implements OnInit {

  doc: any;
  pdfSrc: any;

  constructor(public activeModal: NgbActiveModal,
    private sanitizer: DomSanitizer) {

  }
  ngOnInit(): void {
    if (this.doc !== 'image') {
      this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(`http://localhost:3000/${this.doc.src}`);
    }
  }
}
