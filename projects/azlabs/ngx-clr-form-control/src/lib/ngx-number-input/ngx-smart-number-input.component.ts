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
  //#region Component inputs
  @Input() control!: AbstractControl;
  @Input() describe = true;
  @Input() inputConfig!: NumberInput;
  @ContentChild('input') inputRef!: TemplateRef<any>;
  Mt = Math;
  //#endregion Component inputs
}
