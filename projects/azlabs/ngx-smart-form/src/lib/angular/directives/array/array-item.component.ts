import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
import { NgxSmartFormGroupComponent } from '../group';
import { BUTTON_DIRECTIVES } from '../buttons';
import { PIPES } from '../../pipes';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    NgxSmartFormGroupComponent,
    ...BUTTON_DIRECTIVES,
    ...PIPES,
  ],
  selector: 'ngx-smart-form-array-item',
  templateUrl: './array-item.component.html',
  styleUrls: ['./array-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxSmartFormArrayItemComponent {
  //#region input properties
  @Input() formgroup!: FormGroup;
  @Input() controls!: InputConfigInterface[];
  @Input() template!: TemplateRef<HTMLElement>;
  @Input() index!: number;
  @Input() autoupload = false;
  @Input('no-grid-layout') nogridlayout = false;
  @Input({ required: true }) detached!: AbstractControl[];
  //#endregion

  // #region output properties
  @Output() componentDestroyer = new EventEmitter();
  // #endregion

  onButtonClick(event: Event) {
    this.componentDestroyer.emit();
    event.preventDefault();
  }
}
