import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';

@Component({
  selector: 'ngx-smart-form-array-child',
  template: `
    <div class="ngx__form_array__card">
      <a
        href="#"
        class="ngx__form_array__card__close_btn"
        (click)="onCloseButtonClicked($event)"
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
      <div class="ngx__form_array__card__card_block">
        <ng-container *ngIf="formGroup">
          <ngx-smart-form-group
            [formGroup]="formGroup"
            [controls]="controls"
            [template]="template"
            [autoupload]="autoupload"
            [submitupload]="submitupload"
          ></ngx-smart-form-group>
        </ng-container>
      </div>
    </div>
  `,
  styles: [
    `
      .ngx__form_array__card {
        position: relative;
        border: 1px solid #e6e6e6;
        border-radius: 2px;
        display: inline-block;
        margin-top: 0.8rem;
        display: block;
        background-color: white;
        background-color: white;
        background-color: var(--clr-card-bg-color, white);
        width: 100%;
        margin-top: 1.2rem;
        border-bottom: 1px solid #f3f3f3;
      }

      .ngx__form_array__card__card_block {
        padding: 0.6rem 0.9rem;
        border-bottom-width: 0.05rem;
        border-bottom-style: solid;
        border-bottom-color: #dedede;
      }

      .ngx__form_array__card__close_btn {
        position: absolute;
        top: 4px;
        right: 4px;
      }
      .ngx__form_array__card__close_btn svg path {
        fill: #707070;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxSmartFormArrayChildComponent {
  //#region Component inputs
  @Input() formGroup!: FormGroup;
  @Input() controls!: InputConfigInterface[];
  @Input() template!: TemplateRef<HTMLElement>;
  @Input() autoupload: boolean = false;
  @Input() submitupload: boolean = false;
  //#endregion Component inputs

  // #region Component outputs
  @Output() componentDestroyer = new EventEmitter();
  // #endregion Component outputs

  onCloseButtonClicked(event: Event) {
    this.componentDestroyer.emit();
    event.preventDefault();
  }
}
