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

  activeSlide: number = 0;

  constructor(public activeModal: NgbActiveModal,
    private sanitizer: DomSanitizer) {

  }
  ngOnInit(): void {
    if (this.doc !== 'image') {
      this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(`http://localhost:3000/${this.doc.src}`);
    }
  }

  next() {
    const len: number = this.doc.src.length;

    this.activeSlide ++;
    if(this.activeSlide >= len){
      this.activeSlide = 0;
    }
  }

  prev() {
    const len: number = this.doc.src.length;

    this.activeSlide--;
    if(this.activeSlide < 0){
      this.activeSlide = (len - 1);
    }
  }
}
