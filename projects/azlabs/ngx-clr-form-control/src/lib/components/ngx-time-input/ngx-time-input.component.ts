import { Component, ContentChild, Input, TemplateRef } from "@angular/core";
import { AbstractControl } from "@angular/forms";
import { TimeInput } from "@azlabsjs/smart-form-core";

@Component({
  selector: 'ngx-time-input',
  templateUrl: './ngx-time-input.component.html'
})
export class NgxTimeInputComponent {

  //#region Component inputs
  @Input() control!: AbstractControl;
  @Input() describe = true;
  @Input() inputConfig!: TimeInput;
  @ContentChild('input') inputRef!: TemplateRef<any>;
  //#endregion Component inputs

}
