import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
})
export class SpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | string = 'lg';
  @Input() color: '' | string = '#e7ebe5';
  @Input() fill: '' | string = '#38bdf8';
  get dimension() { return this.size === 'sm' ? '1em' : this.size === 'md' ? '2em' : this.size === 'lg' ? '3em' : this.size === 'xl' ? '4em' : this.size; }
}