import { Component, Input, TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { NumberInput } from '@azlabsjs/smart-form-core';
import { SHARED_DIRECTIVES, SHARED_PIPES } from '../common';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, ...SHARED_DIRECTIVES, ...SHARED_PIPES],
  selector: 'ngx-number-input',
  templateUrl: './ngx-number-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxNumberInputComponent {
  @Input() control!: AbstractControl;
  @Input() describe = true;
  @Input() config!: NumberInput;
  @Input() input!: TemplateRef<any>;
  Mt = Math;
}
