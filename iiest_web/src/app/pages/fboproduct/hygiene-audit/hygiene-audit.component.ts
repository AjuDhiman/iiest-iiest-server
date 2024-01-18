import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';

@Component({
  selector: 'app-hygiene-audit',
  templateUrl: './hygiene-audit.component.html',
  styleUrls: ['./hygiene-audit.component.scss']
})
export class HygieneAuditComponent implements OnInit {
  @Input() formGroupName: string;
  @Input() submitted: boolean;
  hygiene_audit: FormGroup;

  constructor(private rootFormGroup: FormGroupDirective) { }

  ngOnInit(): void {
    this.hygiene_audit = this.rootFormGroup.control.get(this.formGroupName) as FormGroup;
  }

}
