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
  @HostBinding('class.input__subtext') subText = true;
  @HostBinding('class.input__error_text') errorText = true;

  @Input({ alias: 'errors' }) errors!: ErrorsType | null;
  @Input() template!: TemplateRef<any>;
}
