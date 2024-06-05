import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  OnDestroy,
  Optional,
  Output,
  TemplateRef,
} from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormArray,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { HTTPRequestMethods } from '@azlabsjs/requests';
import {
  FormConfigInterface,
  InputConfigInterface,
} from '@azlabsjs/smart-form-core';
import { EMPTY, from, lastValueFrom, Observable, Subject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { RequestClient } from '../../../http';
import {
  ComponentReactiveFormHelpers,
  bindingsFactory,
  setFormValue,
  setInputsProperties,
} from '../../helpers';
import {
  AngularReactiveFormBuilderBridge,
  BindingInterface,
  ControlsStateMap,
  ReactiveFormComponentInterface,
} from '../../types';
import {
  ANGULAR_REACTIVE_FORM_BRIDGE,
  HTTP_REQUEST_CLIENT,
} from '../../tokens';
import { CommonModule } from '@angular/common';
import { NgxSmartFormArrayComponent } from '../smart-form-array';
import { PIPES } from '../../pipes';
import { NgxSmartFormControlArrayComponent } from '../smart-form-control-array';
import { NgxSmartFormGroupHeaderPipe } from '../smart-form-group';

/** @description Recursively get errors from an angular reactive control (eg: FormGroup, FormControl, FormArray) */
function getFormErrors(control: AbstractControl) {
  const errors: ValidationErrors[] = [];
  const getErrors = (c: AbstractControl, _name?: string) => {
    if (c instanceof FormGroup) {
      for (const name of Object.keys(c.controls)) {
        const current = c.get(name);
        if (current) {
          getErrors(current, name);
        }
      }
    } else if (c instanceof FormArray) {
      for (const _c of c.controls) {
        getErrors(_c);
      }
    } else {
      if (c.invalid && c.errors) {
        errors.push(c.errors);
      }
    }
  };

  getErrors(control);

  // Return the list of error from the control element
  return errors;
}

/** @internal */
const AUTO_SUBMIT_ERROR_MESSAGE =
  'autoSubmit input property must only be true if the form endpointURL is configured or an Http Client has been registered!';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    NgxSmartFormArrayComponent,
    NgxSmartFormControlArrayComponent,
    NgxSmartFormGroupHeaderPipe,
    ...PIPES,
  ],
  selector: 'ngx-smart-form',
  templateUrl: './smart-form.component.html',
  styleUrls: ['./form-grid.scss', './smart-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
// , OnChanges
export class NgxSmartFormComponent
  implements ReactiveFormComponentInterface, AfterViewInit, OnDestroy
{
  //#region Local properties
  /** @internal */
  _formGroup!: FormGroup;
  get formGroup() {
    return this._formGroup;
  }
  _form!: FormConfigInterface;
  get form() {
    return this._form;
  }
  // @internal
  private _destroy$ = new Subject<void>();
  //#endregion Local properties

  //#region Component inputs
  @Input() template!: TemplateRef<any>;
  @Input() addTemplate!: TemplateRef<any>;
  @Input() performingAction = false;
  @Input() disabled = false;
  @Input() submitable = false;
  @Input({ alias: 'form' }) set setForm(value: FormConfigInterface) {
    this.onFormConfigChanges(value);
  }
  @Input() autoSubmit: boolean = false;
  @Input() path!: string;
  @Input() state!: { [index: string]: any };
  @Input() autoupload: boolean = false;
  @Input() action: HTTPRequestMethods = 'POST';
  @Input('no-grid-layout') noGridLayout = false;
  //#endregion Component inputs

  //#region Component outputs
  @Output() submit = new EventEmitter<{ [index: string]: any }>();
  @Output() ready = new EventEmitter();
  @Output() changes = new EventEmitter();
  @Output() formGroupChange = new EventEmitter<FormGroup>();
  @Output() complete = new EventEmitter<unknown>();
  @Output() error = new EventEmitter<unknown>();
  @Output() performingRequest = new EventEmitter<boolean>();
  //#endregion Component outputs

  @HostListener('keyup.enter', ['$event'])
  onEnterButtonCliked(event: KeyboardEvent) {
    if (!this.performingAction) {
      this.onSubmit(event);
    }
  }

  //#region Content
  @ContentChild('submitButton') submitButtonRef!: TemplateRef<Node>;
  //#endregion Component Injected Templates

  public constructor(
    @Inject(ANGULAR_REACTIVE_FORM_BRIDGE)
    private builder: AngularReactiveFormBuilderBridge,
    private cdRef: ChangeDetectorRef | null,
    @Inject(HTTP_REQUEST_CLIENT) @Optional() private client?: RequestClient
  ) {}

  //

  setValue(state: { [k: string]: unknown }): void {
    // Set or update the form state of the current component
    const { controlConfigs } = this._form;
    setFormValue(this.builder, this._formGroup, state, controlConfigs ?? []);
    this.cdRef?.markForCheck();
  }

  ngAfterViewInit(): void {
    // Timeout and notify parent component of ready state
    const t = setTimeout(() => {
      this.ready.emit();
      clearTimeout(t);
    }, 700);
  }

  //#region FormComponent interface Methods definitions
  controlValueChanges(name: string): Observable<unknown> {
    const control_ = this._formGroup?.get(name);
    return control_
      ? control_.valueChanges.pipe(takeUntil(this._destroy$))
      : EMPTY;
  }

  getControlValue(control: string, _default?: any): unknown {
    const value = this._formGroup.get(control)?.value;
    return value || _default || undefined;
  }

  //
  setControlValue(control: string, value: any): void {
    this._formGroup.get(control)?.setValue(value);
  }

  //
  disableControls(controls: ControlsStateMap): void {
    for (const [key, entry] of Object.entries(controls)) {
      this._formGroup.get(key)?.disable(entry);
    }
  }

  addAsyncValidator(validator: AsyncValidatorFn, control?: string) {
    const _control = control ? this._formGroup.get(control) : this._formGroup;
    if (_control) {
      _control.addAsyncValidators(validator);
    }
  }

  addValidator(validator: ValidatorFn, control?: string) {
    const _control = control ? this._formGroup.get(control) : this._formGroup;
    if (_control) {
      _control.addValidators(validator);
    }
  }

  //
  enableControls(controls: ControlsStateMap): void {
    for (const [key, entry] of Object.entries(controls)) {
      this._formGroup.get(key)?.enable(entry);
    }
  }

  //
  addControl(name: string, control: AbstractControl): void {
    if (this._formGroup.get(name)) {
      this._formGroup.get(name)?.setValue(control.value);
    }
    this._formGroup.addControl(name, control);
  }

  //
  getControl(name: string): AbstractControl | undefined {
    return this._formGroup.get(name) ?? undefined;
  }

  //
  async onSubmit(event: Event) {
    event.preventDefault();

    if (!this._formGroup) {
      return;
    }

    // Validate the formgroup object to ensure it passes validation before submitting
    this.validateForm();

    // Wait the for status changes of the formgroup
    // To make sure UI update error message
    this._formGroup.statusChanges
      .pipe(
        filter((status) => status !== 'PENDING'),
        takeUntil(this._destroy$)
      )
      .subscribe(() => {
        this.cdRef?.detectChanges();
        console.log(this.formGroup.getRawValue());
      });
    // We simply return without performing any further action if the validation fails
    // Due to some issue with form group being invalid while all controls does not
    // have error, we are adding a check that verifies if all controls has error before
    // breaking out of the function
    const errors = getFormErrors(this._formGroup);
    if (!this._formGroup.valid && errors.length > 0) {
      return;
    }
    // #region Configure bool values for controlling auto submission
    const path = this.path ?? this._form.endpointURL;
    const clientDefined =
      typeof this.client !== 'undefined' && this.client !== null;
    const pathDefined = path !== null && path !== 'undefined';
    const shouldSubmit = this.autoSubmit && clientDefined;
    // #endregion Configure bool values for controlling auto submission

    // Case component is configured to auto submit form values, we send
    // request using the configured client object
    if (shouldSubmit && pathDefined) {
      await this.sendRequest(path || 'http://localhost');
      return;
    }
    const configError =
      (this.autoSubmit && !clientDefined) || (this.autoSubmit && !pathDefined);

    // Case there is no configuration error, emit a submit event
    if (!configError) {
      this.submit.emit(this._formGroup.getRawValue());
      return;
    }
    // We throw an error if developper misconfigured the smart form component
    throw new Error(AUTO_SUBMIT_ERROR_MESSAGE);
  }

  setComponentForm(value: FormConfigInterface): void {
    if (value) {
      // We set the controls container class
      const controls = (value.controlConfigs ?? []).map((current) => ({
        ...current,
        containerClass: current.containerClass ?? 'input-col-md-12',
        isRepeatable: current.isRepeatable ?? false,
      }));
      this.onFormConfigChanges(
        { ...value, controlConfigs: controls },
        this._formGroup
      );
    }
  }

  //
  validateForm(): void {
    ComponentReactiveFormHelpers.validateFormGroupFields(this._formGroup);
  }

  //
  reset(): void {
    this._formGroup.reset();
    for (const control of this.form.controlConfigs ?? []) {
      this._formGroup.get(control.name)?.setValue(control.value);
    }
  }
  //#endregion FormComponent interface Methods definitions

  setControlConfig(config?: InputConfigInterface, name?: string) {
    if (config) {
      name = name ?? config.name;
      const controls = [...(this.form.controlConfigs ?? [])];
      const index = controls.findIndex((current) => current.name === name);
      controls.splice(index, 1, config);
      this.onFormConfigChanges(
        { ...this._form, controlConfigs: controls },
        this._formGroup
      );
    }
  }

  private registerControlValueChanges(b: Map<string, BindingInterface>) {
    for (const n in this._formGroup.controls) {
      this._formGroup
        .get(n)
        ?.valueChanges.pipe(
          takeUntil(this._destroy$),
          tap((state) => {
            const { controlConfigs: values } = this._form;
            const { _formGroup: fg } = this;
            const [g, _inputs] = setInputsProperties(
              this.builder,
              values,
              b,
              fg,
              state,
              n
            );
            this.setFormState({ ...this._form, controlConfigs: _inputs }, g);
          })
        )
        .subscribe();
    }
  }

  private async sendRequest(path: string) {
    try {
      this.performingRequest.emit(true);
      const response = await lastValueFrom(
        from(
          (this.client as RequestClient).request(
            path || 'http://localhost',
            this.action ?? 'POST',
            this._formGroup.getRawValue()
          )
        )
      );
      this.performingRequest.emit(false);
      this.complete.emit(response);
    } catch (error) {
      this.error.emit(error);
    }
  }

  private onFormConfigChanges(f: FormConfigInterface, formgroup?: FormGroup) {
    console.log('Called onFormConfigChanges...');
    // We create an instance of angular Reactive Formgroup instance from input configurations
    // if formgroup parameter is null or undefined
    if (!formgroup) {
      const { builder, state } = this;
      formgroup = builder.group(f);
      // In case state property of the current component is defined, we set the value of the
      if (state) {
        this.setValue(state);
      }
      // We only initialy set the form state to initialize component when we create
      // a new form group instance because, the next time this function is called
      // `form` and `formGroup` will have initial values
      this.setFormState(f, formgroup);
    }

    // We unregister from previous event each time we set the form value
    this._destroy$.next();
    const { controlConfigs: values } = this._form;
    const factory = bindingsFactory(values ?? []);
    const b = factory(this._formGroup);
    const [g, _inputs] = setInputsProperties(
      this.builder,
      values,
      b,
      this._formGroup
    );
    this.setFormState({ ...this._form, controlConfigs: _inputs }, g);
    // register controls value changes and update ui based on requiredIf configuration
    // on form inputs
    this.registerControlValueChanges(b);

    // Subscribe to formgroup changes
    this._formGroup?.valueChanges
      .pipe(
        tap((state) => this.formGroupChange.emit(state)),
        takeUntil(this._destroy$)
      )
      .subscribe();

    // We then emit a changes event when stack complete
    this.changes.emit();
  }

  private setFormState(f: FormConfigInterface, g?: FormGroup) {
    if (this._form) {
      this._form = { ...this._form, ...f };
    } else {
      this._form = f;
    }

    if (g) {
      this._formGroup = g;
    }

    this.cdRef?.detectChanges();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }
}
