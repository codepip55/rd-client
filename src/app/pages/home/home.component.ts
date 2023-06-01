import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/shared/services/api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  constructor (
    private fb: FormBuilder,
    private apiService: ApiService
  ) {}

  rdForm: FormGroup = this.fb.group({
    input: ['RD ', Validators.required]
  })

  get rawInput() { return this.rdForm.value.input.toString().slice(3) }

  send() {
    const input = this.rdForm.value.input.toString().slice(3)

    this.apiService.sendAircraft(input)
  }

}
