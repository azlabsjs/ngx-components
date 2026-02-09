import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  Inject,
  Input,
  Optional as NgOptional,
  OnDestroy,
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
import { filter, Subscription } from 'rxjs';
import { deepEqual } from '@azlabsjs/utilities';

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
export class NgxFormComponent implements OnDestroy {
  private _initialized: boolean = false;

  //#region input properties
  @Input() modal!: ModalDirective;
  @Input({ required: true }) inputs!: InputConfigInterface[];
  @Input() template!: TemplateRef<any>;
  @Input() label: Optional<TemplateRef<any>>;
  @Input() autoupload = false;
  @Input('no-grid-layout') nogridlayout = false;
  @Input({ alias: 'add-template' }) addref: Optional<TemplateRef<any>>;

  private _value!: { [k: string]: unknown };
  @Input() set value(value: Optional<{ [k: string]: unknown }>) {
    this.setValue(value);
  }
  private _state!: FormGroupState & { [k: string]: unknown };
  @Input({ required: true }) set state(
    value: FormGroupState & { [k: string]: unknown },
  ) {
    this._state = value;
    if (this._value) {
      this.setValue(this._value);
    }
  }
  get state() {
    return this._state;
  }
  //#endregion

  @ContentChild(ModalDirective) formmodal!: ModalDirective | null;

  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(ANGULAR_REACTIVE_FORM_BRIDGE)
    private builder: AngularReactiveFormBuilderBridge,
    @NgOptional() private cdRef?: ChangeDetectorRef | null,
  ) {}

  validate() {
    ComponentReactiveFormHelpers.validateFormGroupFields(this.state.formGroup);
    const subscription = this.state.formGroup?.statusChanges
      .pipe(filter((status) => ['PENDING', 'DISABLED'].indexOf(status) === -1))
      .subscribe(() => this.cdRef?.detectChanges());

    if (subscription) {
      this.subscriptions.push(subscription);
    }
  }

  setValue(value: Optional<{ [k: string]: unknown }>): void {
    if (!value) {
      return;
    }

    if (this._initialized && deepEqual(this._value, value)) {
      return;
    }

    if (this._state) {
      const { formGroup } = this._state;
      console.log('Setting form value: ', value)
      setFormValue(this.builder, formGroup, value, this.inputs ?? []);
      this._initialized = true;
    }

    this._value = value;
  }

  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }
}
