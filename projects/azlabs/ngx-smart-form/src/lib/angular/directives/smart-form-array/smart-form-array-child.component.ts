import { CommonModule } from '@angular/common';
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
import { NgxSmartFormGroupComponent } from '../smart-form-group';
import { CloseButtonComponent } from '../close-button';

@Component({
  standalone: true,
  imports: [CommonModule, CloseButtonComponent, NgxSmartFormGroupComponent],
  selector: 'ngx-smart-form-array-child',
  template: `
    <div class="ngx__form_array__card">
      <ngx-close-button (click)="onButtonClick($event)"></ngx-close-button>
      <div class="ngx__form_array__card__card_block">
        <ng-container *ngIf="formGroup">
          <ngx-smart-form-group
            [no-grid-layout]="noGridLayout"
            [formGroup]="formGroup"
            [controls]="controls"
            [template]="template"
            [autoupload]="autoupload"
          ></ngx-smart-form-group>
        </ng-container>
      </div>
    </div>
  `,
  styles: [
    `
      .ngx__form_array__card {
        position: relative;
        border-width: var(--ngx-form-array-card-border-width, 1px);
        border-style: var(--ngx-form-array-card-border-style, solid);
        border-color: var(--ngx-form-array-card-border-color, #e6e6e6);
        border-radius: 2px;
        display: inline-block;
        margin-top: var(--ngx-form-array-card-margin-top, 0.8rem);
        display: block;
        width: 100%;
        margin-top: var(--ngx-form-array-card-border-margin-top, 1.2rem);
        border-bottom: 1px solid #f3f3f3;
      }

      .ngx__form_array__card__card_block {
        padding: var(--ngx-form-array-card-padding, 0.6rem 0.9rem);
        border-bottom-width: var(--ngx-form-array-card-width, 0.05rem);
        border-bottom-style: solid;
      }

      :host ::ng-deep .ngx__form_array__card__close_btn {
        position: absolute;
        top: 12px;
        right: 12px;
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
  @Input() index!: number;
  @Input('no-grid-layout') noGridLayout = false;
  //#endregion Component inputs

  // #region Component outputs
  @Output() componentDestroyer = new EventEmitter();
  // #endregion Component outputs

  onButtonClick(event: Event) {
    this.componentDestroyer.emit();
    event.preventDefault();
  }
}