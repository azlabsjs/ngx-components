import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
import { NgxSmartFormGroupComponent } from '../group';
import { BUTTON_DIRECTIVES } from '../buttons';

@Component({
  standalone: true,
  imports: [CommonModule, NgxSmartFormGroupComponent, ...BUTTON_DIRECTIVES],
  selector: 'ngx-smart-form-array-item',
  templateUrl: './array-item.component.html',
  styleUrls: ['./array-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxSmartFormArrayItemComponent {
  //#region Component inputs
  @Input() formGroup!: FormGroup;
  @Input() controls!: InputConfigInterface[];
  @Input() template!: TemplateRef<HTMLElement>;
  @Input() autoupload: boolean = false;
  @Input() index!: number;
  @Input('no-grid-layout') noGridLayout = false;
  //#endregion Component inputs

  // #region Component outputs
  @Output() componentDestroyer = new EventEmitter();
  // #endregion Component outputs

  onButtonClick(event: Event) {
    this.componentDestroyer.emit();
    event.preventDefault();
  }
}
