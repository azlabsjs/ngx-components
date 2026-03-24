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
import { PIPES } from '../../pipes';
import { Optional } from './types';

@Component({
  standalone: true,
  imports: [CommonModule, ...BUTTON_DIRECTIVES, ...PIPES],
  selector: 'ngx-smart-form-control-array-item',
  templateUrl: './control-array-item.component.html',
  styleUrls: ['./control-array-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxArrayItemComponent {
  //#region input properties
  @Input() index!: number;
  @Input() control!: AbstractControl;
  @Input() config!: InputConfigInterface;
  @Input() template: Optional<TemplateRef<any>>;
  @Input() autoupload = false;
  @Input() detached: AbstractControl[] = [];
  //#endregion

  // #region output properties
  @Output() destroy = new EventEmitter();
  // #endregion

  clicked(event: Event) {
    this.destroy.emit();

    event.preventDefault();
  }
}
