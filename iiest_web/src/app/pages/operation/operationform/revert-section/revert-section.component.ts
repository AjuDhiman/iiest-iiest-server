import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { faCircleCheck, faCircleExclamation, faFileArrowUp } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';
import { days, months } from 'src/app/utils/config';

@Component({
  selector: 'app-revert-section',
  templateUrl: './revert-section.component.html',
  styleUrls: ['./revert-section.component.scss']
})
export class RevertSectionComponent implements OnInit {

  completedStatus: boolean = false;

  faCircleCheck = faCircleCheck;

  faCircleExclamation = faCircleExclamation;

  faFileArrowUp = faFileArrowUp;

  reverts: string[] = [];

  @Input() customerId: string;

  revertForm: FormGroup = new FormGroup({
    fssai_revert: new FormControl('')
  });

  constructor(private formBuilder: FormBuilder,
    private _registerService: RegisterService,
    private _toastrService: ToastrService,
    private _getDataService: GetdataService) {

  }

  ngOnInit(): void {
    this.revertForm = this.formBuilder.group({
      fssai_revert: [''],
    });

    this.getReverts();
  }

  onUpdate() {
    console.log(this.revertForm.value.fssai_revert);
    if (this.revertForm.value.fssai_revert != '') {
      this._registerService.regiterRevert(this.customerId, this.revertForm.value).subscribe({
        next: res => {
          console.log(res);
          this._toastrService.success('Revert Updated');
          this.revertForm.patchValue({ fssai_revert: '' });
        }
      });
    }
  }

  getReverts(): void {
    this._getDataService.getReverts(this.customerId).subscribe({
      next: res => {
        console.log(res);
        this.formatReverts(res.reverts);
      }
    })
  }

  //this methord formats the logs in a better presentational form from a object form
  formatReverts(logs: any) {

    logs.forEach((log: any) => {
      let revert: string = `${log.fssaiRevert} by ${log.operatorInfo.employee_name} (${log.operatorInfo.employee_id}) on ${this.getFormatedDate(log.createdAt.toString())} at ${this.getFormattedTime(log.createdAt)}`;

      this.reverts.push(revert);
    });
  }

  getFormatedDate(date: string): string {
    const originalDate = new Date(date);
    const year = originalDate.getFullYear();
    let formattedDate;
    if (Math.floor((new Date().getTime() - originalDate.getTime()) / (24 * 60 * 60 * 1000)) < 7) {
      formattedDate = days[originalDate.getDay()];
    } else {
      const month = months[originalDate.getMonth()];
      const day = String(originalDate.getDate()).padStart(2, '0');
      formattedDate = `${day}-${month}-${year}`;
    }
    return formattedDate;
  }

  getFormattedTime(dateString: string) {
    const originalDate = new Date(dateString);
    let hours = String(originalDate.getHours() % 12).padStart(2, '0');
    const minutes = String(originalDate.getMinutes()).padStart(2, '0');
    const meridiem = originalDate.getHours() >= 12 ? 'PM' : 'AM';
    const formattedTime = `${hours}:${minutes} ${meridiem}`;
    return formattedTime;
  }

}
