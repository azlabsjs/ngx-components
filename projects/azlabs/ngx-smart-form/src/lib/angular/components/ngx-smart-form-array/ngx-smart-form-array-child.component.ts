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
      <ngx-smart-array-close-button
        (click)="onCloseButtonClicked($event)"
      ></ngx-smart-array-close-button>
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

      :host ::ng-deep .ngx__form_array__card__close_btn {
        position: absolute;
        top: 4px;
        right: 4px;
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
  @Input() index!: number;
  //#endregion Component inputs

  // #region Component outputs
  @Output() componentDestroyer = new EventEmitter();
  // #endregion Component outputs

  onCloseButtonClicked(event: Event) {
    this.componentDestroyer.emit();
    event.preventDefault();
  }
}
