import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { faLocationDot, faPhone, faPaperPlane, faGlobe, faClose } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-contactusform',
  templateUrl: './contactusform.component.html',
  styleUrls: ['./contactusform.component.scss']
})
export class ContactusformComponent implements OnInit {
  submitted: boolean = false;
  contactData: object = new Object();
  success:boolean;
  error: any;
  hidden = true;
  faLocationDot = faLocationDot;
  faPhone = faPhone;
  faPaperPlane = faPaperPlane;
  faGlobe = faGlobe;
  faClose = faClose;

  ContactUsForm: FormGroup = new FormGroup({
    contact_ft_name: new FormControl(''),
    contact_lt_name: new FormControl(''),
    contact_email: new FormControl(''),
    contact_phone: new FormControl(''),
    contact_state: new FormControl('delhi'),
    contact_zipcode: new FormControl(''),
    contact_subject: new FormControl(''),
    contact_message: new FormControl('')
  });

  constructor(private formBuider: FormBuilder,
    private _utilitiuesservice: UtilitiesService) {
  }

  ngOnInit(): void {
    this.ContactUsForm = this.formBuider.group(
      {
        contact_ft_name: ['', Validators.required],
        contact_lt_name: ['', Validators.required],
        contact_email: ['', [Validators.required, Validators.email]],
        contact_phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
        contact_state: ['delhi', Validators.required],
        contact_zipcode: ['', Validators.required,],
        contact_subject: ['', Validators.required],
        contact_message: ['', [Validators.required, Validators.minLength(15)]]
      });
  }

  get contactusform(): { [key: string]: AbstractControl } {
    return this.ContactUsForm.controls;
  }

  submissionCheck() {
    this.success = true;
  }

  onSubmit(): void {
    console.log(this.ContactUsForm);
    this.submitted= true;
    if (this.ContactUsForm.valid) {

      this.contactData = this.ContactUsForm.value;
     // for resting the form after submission
      this.submitted = false

      this._utilitiuesservice.contactiiest(this.contactData).subscribe(
        (response) => {
          this.success = response.sucess;
          this.hidden = false;
        },
        (err) => {
          this.error = err.error
          this.hidden = false;
        }
      );
    }
  }

  hideResponse(){
    this.hidden = true;
    console.log('11');
  }
}
