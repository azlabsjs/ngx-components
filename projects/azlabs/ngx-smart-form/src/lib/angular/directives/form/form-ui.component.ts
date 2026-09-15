import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { NgxSmartFormArrayComponent } from '../array';
import { NgxSmartFormGroupHeaderPipe } from '../group';
import { NgxSmartFormControlArrayComponent } from '../control-array';
import { PIPES } from '../../pipes';
import { FormGroupState, Optional } from './types';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
import { ModalDirective } from '../modal';
import { FORM_PIPES } from './pipes';
import { ComponentReactiveFormHelpers } from '../../helpers';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'ngx-form-ui',
  standalone: true,
  templateUrl: './form-ui.component.html',

  imports: [
    CommonModule,
    NgxSmartFormArrayComponent,
    NgxSmartFormControlArrayComponent,
    NgxSmartFormGroupHeaderPipe,
    ...PIPES,
    ...FORM_PIPES,
  ],
  styleUrls: ['./form-grid.scss', './form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxFormComponent {
  @Input() modal!: ModalDirective;
  @Input() template!: TemplateRef<any>;
  @Input() label!: TemplateRef<any> | undefined | null;
  @Input() autoupload = false;
  @Input({ alias: 'no-grid-layout' }) nogridlayout = false;
  @Input({ required: true }) state!: FormGroupState & { [k: string]: unknown };
  @Input({ required: true }) inputs!: InputConfigInterface[];

  @Input({ alias: 'table-description' }) tabledescription!: Optional<TemplateRef<any>>;
  @ContentChild(ModalDirective) formmodal!: ModalDirective | null;

  /** @deprecated */
  @Input({ alias: 'add-template' }) addref!: Optional<TemplateRef<any>>;
  @Input({ alias: 'add' }) add!: TemplateRef<any>;
  @Input({ alias: 'add-group' }) addgroup!: TemplateRef<any>;

  @Output('item-removed') removed = new EventEmitter<{ name: string, control: AbstractControl }>();


  public validate() {
    ComponentReactiveFormHelpers.validateFormGroupFields(this.state.formGroup);
  }


  onRemoved(event: { index: number, control: AbstractControl }, parent: string) {
    if (!event) {
      return;
    }

    if (typeof event.index === 'undefined' || event.index === null || !event.control) {
      return;
    }

    const name = `${parent}.${event.index}`;
    this.removed.emit({ name, control: event.control });
  }
}
