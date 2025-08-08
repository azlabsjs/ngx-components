import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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

@Component({
  standalone: true,
  imports: [CommonModule, ...BUTTON_DIRECTIVES, ...PIPES],
  selector: 'ngx-smart-form-control-array-item',
  templateUrl: './control-array-item.component.html',
  styleUrls: ['./control-array-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxArrayItemComponent {
  //#region component inputs
  @Input() control!: AbstractControl;
  @Input() config!: InputConfigInterface;
  @Input() template!: TemplateRef<any>;
  @Input() autoupload: boolean = false;
  @Input() index!: number;
  @Input({ required: true }) detached!: AbstractControl[];
  //#endregion

  // #region component outputs
  @Output() componentDestroyer = new EventEmitter();
  // #endregion

  clicked(event: Event) {
    this.componentDestroyer.emit();
    event.preventDefault();
  }
}
