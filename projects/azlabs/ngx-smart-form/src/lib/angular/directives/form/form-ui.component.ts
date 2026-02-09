import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  Inject,
  Input,
  Optional as NgOptional,
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
import { ComponentReactiveFormHelpers, setFormValue } from '../../helpers';
import { ANGULAR_REACTIVE_FORM_BRIDGE } from '../../tokens';
import { AngularReactiveFormBuilderBridge } from '../../types';

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
  //#region input properties
  @Input() modal!: ModalDirective;
  @Input({ required: true }) state!: FormGroupState & { [k: string]: unknown };
  @Input({ required: true }) inputs!: InputConfigInterface[];
  @Input() template!: TemplateRef<any>;
  @Input() label: Optional<TemplateRef<any>>;
  @Input() autoupload = false;
  @Input('no-grid-layout') nogridlayout = false;
  @Input({ alias: 'add-template' }) addref: Optional<TemplateRef<any>>;
  @Input() set value(value: { [k: string]: unknown }) {
    this.setValue(value);
  }
  //#endregion

  @ContentChild(ModalDirective) formmodal!: ModalDirective | null;

  constructor(
    @Inject(ANGULAR_REACTIVE_FORM_BRIDGE)
    private builder: AngularReactiveFormBuilderBridge,
    @NgOptional() private cdRef?: ChangeDetectorRef | null,
  ) {}

  validate() {
    ComponentReactiveFormHelpers.validateFormGroupFields(this.state.formGroup);
  }

  setValue(value: { [k: string]: unknown }): void {
    setFormValue(this.builder, this.state.formGroup, value, this.inputs ?? []);
    this.cdRef?.markForCheck();
  }
}
