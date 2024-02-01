import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';

@Component({
  selector: 'app-general-section',
  templateUrl: './general-section.component.html',
  styleUrls: ['./general-section.component.scss']
})
export class GeneralSectionComponent implements OnInit {

  @Input() candidateId: string = ''

  firstUpdate:boolean=true;

  generalForm: FormGroup = new FormGroup({
    recipient_status: new FormControl('ongoing'),
    officer_note: new FormControl(''),
  });

  constructor(private formBuilder: FormBuilder,
    private _registerService: RegisterService,
    private _getDataService: GetdataService,
    private _toastrService:ToastrService) {

  }

  ngOnInit(): void {
    this.generalForm = this.formBuilder.group({
      recipient_status: ['ongoing'],
      officer_note: ['']
    });

    this.getGenSecData()
  }

  get generalform(): { [key: string]: AbstractControl } {
    return this.generalForm.controls;
  }

  onUpdate() {
    if (this.generalForm.invalid) {
      return;
    }

    if(this.firstUpdate){
      this._registerService.postOperGenData(this.candidateId, this.generalForm.value).subscribe({
        next: res => {
          this._toastrService.success('Record Updated', 'Updated')
        },
        error: err => {
          
        }
      })
    } else {
     this._registerService.updateOperGenData(this.candidateId, this.generalForm.value).subscribe({
      next: res => {
        this._toastrService.success('Record Updated', 'Updated')
      }
     })
    }
    
  }

  getGenSecData() {
    this._getDataService.getOperGenSecData(this.candidateId).subscribe({
      next: res => {
        if (res) {
          this.generalForm.patchValue({ recipient_status: res.genSecData.recipientStatus });
          this.generalForm.patchValue({ officer_note: res.genSecData.officerNote });
          this.firstUpdate=false;
        }
      }
    })
  }
}
