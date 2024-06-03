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
  selector: 'ngx-add-button',
  template: `
    <a href="#" class="ngx__add__button" (click)="onClickHandler($event)">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="8px"
        height="8px"
        viewBox="0 0 24 24"
      >
        <path d="M24 10h-10v-10h-4v10h-10v4h10v10h4v-10h10z" />
      </svg>
    </a>
  `,
  styles: [
    `
      .ngx__add__button svg path {
        fill: #fff;
      }

      .ngx__add__button {
        margin: 16px 0 auto 0;
        cursor: pointer;
        width: 32px;
        height: 32px;
        background: #0072a3;
        box-shadow: 1px 1px 1px rgb(114, 110, 110);
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
      }

      .ngx__add__button:hover {
        background: #004b6b;
        box-shadow: 1px 1px 1px rgb(68, 64, 64);
      }

      :host {
        display: 'inline';
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddButtonComponent {
  //#region Component outputs
  @Output() click = new EventEmitter<Event>();
  //#endregion Component outputs

  onClickHandler(event: Event) {
    this.click.emit(event);
    event.preventDefault();
    event.stopPropagation();
  }
}
