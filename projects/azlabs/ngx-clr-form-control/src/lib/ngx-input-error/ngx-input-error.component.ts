import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  TemplateRef,
} from '@angular/core';
import { defaultStrings } from '../constants';
import { NgxCommonModule } from '../common';
import { CustomErrorsPipe, ErrorsPipe } from './pipes';

/** @internal */
type ErrorsType = { [prop: string]: any };

/** @internal */
// const DEFAULT_ERRORS = Object.keys(defaultStrings.validation);

@Component({
  standalone: true,
  imports: [NgxCommonModule, ErrorsPipe, CustomErrorsPipe],
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
  //#region Component class attributes
  @HostBinding('class.input__subtext') subText = true;
  @HostBinding('class.input__error_text') errorText = true;
  //#endregion Component class attributes

  //#region Component inputs
  @Input({ alias: 'errors' }) errors!: ErrorsType | null;
  @Input() template!: TemplateRef<any>;
  //#endregion Component inputs
}
