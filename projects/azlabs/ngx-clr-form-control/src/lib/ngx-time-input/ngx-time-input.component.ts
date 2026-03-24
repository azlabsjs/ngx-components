import { ChangeDetectionStrategy, Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { TimeInput } from '@azlabsjs/smart-form-core';
import { NgxCommonModule } from '../common';

@Component({
  standalone: true,
  imports: [NgxCommonModule],
  selector: 'ngx-time-input',
  templateUrl: './ngx-time-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgxTimeInputComponent {
  //#region component inputs
  @Input() control!: AbstractControl;
  @Input() describe = true;
  @Input() config!: TimeInput;
  @ContentChild('input') inputRef!: TemplateRef<any>;
  //#endregion
}
