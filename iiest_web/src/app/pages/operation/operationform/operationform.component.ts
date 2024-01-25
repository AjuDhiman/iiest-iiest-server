import { Component, OnInit } from '@angular/core';
import { faCircleCheck, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-operationform',
  templateUrl: './operationform.component.html',
  styleUrls: ['./operationform.component.scss']
})
export class OperationformComponent implements OnInit{
  candidateId:string;

  constructor(
              private activatedRoute:ActivatedRoute
              ){
  }

  ngOnInit(): void {
    this.candidateId=this.activatedRoute.snapshot.params['id'];
  }
}
