import { Component, Input, ContentChild, TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { TextInput } from '@azlabsjs/smart-form-core';
import { NgxCommonModule } from '../common';

@Component({
  standalone: true,
  imports: [NgxCommonModule],
  selector: 'ngx-text-input',
  templateUrl: './ngx-text-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxTextInputComponent {
  @Input() control!: AbstractControl;
  @Input() describe = true;
  @Input() config!: TextInput;
  @ContentChild('input') input!: TemplateRef<any>;
  Mt = Math;
}
