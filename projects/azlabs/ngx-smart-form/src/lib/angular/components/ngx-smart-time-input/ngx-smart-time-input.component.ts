import { Component, ContentChild, Input, TemplateRef } from "@angular/core";
import { FormControl } from "@angular/forms";
import { TimeInput } from "@azlabsjs/smart-form-core";

@Component({
  selector: 'ngx-smart-time-input',
  templateUrl: './ngx-smart-time-input.component.html'
})
export class NgxSmartTimeInputComponent {

  //#region Component inputs
  @Input() control!: FormControl;
  @Input() describe = true;
  @Input() inputConfig!: TimeInput;
  @ContentChild('input') inputRef!: TemplateRef<any>;
  //#endregion Component inputs

}
