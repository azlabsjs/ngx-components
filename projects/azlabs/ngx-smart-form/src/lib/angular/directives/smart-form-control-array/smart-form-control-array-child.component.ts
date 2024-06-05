import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
import { CloseButtonComponent } from '../close-button';

@Component({
  standalone: true,
  imports: [CommonModule, CloseButtonComponent],
  selector: 'ngx-smart-form-array-child',
  template: `
    <div class="ngx__form_control_array">
      <div class="ngx__form_array__card__card_block">
        <ng-container *ngIf="control">
          <ng-container
            *ngTemplateOutlet="
              template;
              context: {
                control: this.control,
                value: inputConfig,
                autoupload: this.autoupload
              }
            "
          ></ng-container>
        </ng-container>
      </div>
      <ngx-close-button (click)="onButtonClick($event)"></ngx-close-button>
    </div>
  `,
  styles: [
    `
      .ngx__form_control_array {
        display: flex;
        position: relative;
      }

      .ngx__form_array__card__card_block {
        padding: var(--ngx-form-array-card-padding, 0.6rem 0rem);
        flex-grow: 1;
      }
      :host ::ng-deep .ngx__form_array__card__close_btn {
        position: absolute;
        top: 32px;
        right: -8px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxSmartFormControlArrayChildComponent {
  //#region Component inputs
  @Input() control!: AbstractControl;
  @Input() inputConfig!: InputConfigInterface;
  @Input() template!: TemplateRef<any>;
  @Input() autoupload: boolean = false;
  @Input() index!: number;
  //#endregion Component inputs

  // #region Component outputs
  @Output() componentDestroyer = new EventEmitter();
  // #endregion Component outputs

  onButtonClick(event: Event) {
    this.componentDestroyer.emit();
    event.preventDefault();
  }
}
