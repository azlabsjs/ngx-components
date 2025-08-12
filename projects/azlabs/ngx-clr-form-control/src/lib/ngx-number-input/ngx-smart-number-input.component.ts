import {
  Component,
  Input,
  ContentChild,
  TemplateRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { NumberInput } from '@azlabsjs/smart-form-core';
import { NgxCommonModule } from '../common';

@Component({
  standalone: true,
  imports: [NgxCommonModule],
  selector: 'ngx-number-input',
  templateUrl: './ngx-number-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxNumberInputComponent {
  //#region component inputs
  @Input() control!: AbstractControl;
  @Input() describe = true;
  @Input() config!: NumberInput;
  @ContentChild('input') inputRef!: TemplateRef<any>;
  Mt = Math;
  //#endregion
}
