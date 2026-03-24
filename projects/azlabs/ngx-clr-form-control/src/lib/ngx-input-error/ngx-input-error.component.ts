import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  TemplateRef,
} from '@angular/core';
import { NgxCommonModule } from '../common';
import { PIPES } from './pipes';

/** @internal */
type ErrorsType = { [prop: string]: any };

@Component({
  standalone: true,
  imports: [NgxCommonModule, ...PIPES],
  selector: 'ngx-input-error',
  templateUrl: './ngx-input-error.component.html',
  styles: [
    `
      :host(.input__error_text) * {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxInputErrorComponent {
  //#region component class attributes
  @HostBinding('class.input__subtext') subText = true;
  @HostBinding('class.input__error_text') errorText = true;
  //#endregion

  //#region component inputs
  @Input({ alias: 'errors' }) errors!: ErrorsType | null;
  @Input() template!: TemplateRef<any>;
  //#endregion
}
