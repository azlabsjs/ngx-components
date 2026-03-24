import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  Input,
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
  @Input({ alias: 'add-template' }) addref!: Optional<TemplateRef<any>>;
  @ContentChild(ModalDirective) formmodal!: ModalDirective | null;

  public validate() {
    ComponentReactiveFormHelpers.validateFormGroupFields(this.state.formGroup);
  }
}
