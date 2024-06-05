import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'ngx-close-button',
  template: `
    <a
      href="#"
      class="ngx__close_btn"
      (click)="onClickHandler($event)"
    >
      <svg
        version="1.1"
        width="24"
        height="24"
        viewBox="0 0 36 36"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
      >
        <title>window-close-line</title>
        <path
          d="M19.41,18l7.29-7.29a1,1,0,0,0-1.41-1.41L18,16.59,10.71,9.29a1,1,0,0,0-1.41,1.41L16.59,18,9.29,25.29a1,1,0,1,0,1.41,1.41L18,19.41l7.29,7.29a1,1,0,0,0,1.41-1.41Z"
        ></path>
        <rect x="0" y="0" width="36" height="36" fill-opacity="0" />
      </svg>
    </a>
  `,
  styles: [
    `
      .ngx__close_btn svg path {
        fill: #707070;
      }
      :host {
        display: 'inline';
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CloseButtonComponent {
  @Output() click = new EventEmitter<Event>();

  onClickHandler(event: Event) {
    this.click.emit(event);
    event.preventDefault();
    event.stopPropagation();
  }
}
