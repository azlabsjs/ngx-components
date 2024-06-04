import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
} from '@angular/core';
import { defaultStrings } from '../../constants';
import { NgxCommonModule } from '../../common';
import { CustomErrorsPipe, ErrorsPipe } from './pipes';

/** @internal */
type ErrorsType = { [prop: string]: any };

/** @internal */
const DEFAULT_ERRORS = Object.keys(defaultStrings.validation);

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
  @HostBinding('class.input__subtext') subText = true;
  @HostBinding('class.input__error_text') errorText = true;
  //#region Component inputs
  @Input({ alias: 'errors' }) errors!: ErrorsType | null;
  //#endregion Component inputs
}
