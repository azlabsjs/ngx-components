import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
import { BUTTON_DIRECTIVES } from '../buttons';

@Component({
  standalone: true,
  imports: [CommonModule, ...BUTTON_DIRECTIVES],
  selector: 'ngx-smart-form-control-array-item',
  templateUrl: './control-array-item.component.html',
  styleUrls: ['./control-array-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxSmartFormControlArrayItemComponent {
  //#region Component inputs
  @Input() control!: AbstractControl;
  @Input() inputConfig!: InputConfigInterface;
  @Input() template!: TemplateRef<any>;
  @Input() autoupload: boolean = false;
  @Input() index!: number;
  //#endregion Component inputs

  // #region Component outputs
  @Output() componentDestroyer = new EventEmitter();
  // #endregion Component outputs

  onButtonClick(event: Event) {
    this.componentDestroyer.emit();
    event.preventDefault();
  }
}
