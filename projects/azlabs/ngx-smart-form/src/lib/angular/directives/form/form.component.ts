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
  OnChanges,
  OnDestroy,
  Optional,
  Output,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormGroup,
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
  collectErrors,
  createComputableDepencies,
  pickAbstractControl,
  setFormValue,
  setInputsProperties,
  useSupportedAggregations,
} from '../../helpers';
import {
  AngularReactiveFormBuilderBridge,
  BindingInterface,
  ComputedInputValueConfigType,
  ControlsStateMap,
  ReactiveFormComponentInterface,
} from '../../types';
import {
  ANGULAR_REACTIVE_FORM_BRIDGE,
  HTTP_REQUEST_CLIENT,
} from '../../tokens';
import { CommonModule } from '@angular/common';
import { NgxSmartFormArrayComponent } from '../array';
import { PIPES } from '../../pipes';
import { NgxSmartFormControlArrayComponent } from '../control-array';
import { NgxSmartFormGroupHeaderPipe } from '../group';
import { memoize } from '@azlabsjs/functional';

/** @internal */
const AUTO_SUBMIT_ERROR_MESSAGE =
  'autoSubmit input property must only be true if the form endpointURL is configured or an Http Client has been registered!';

/** @internal */
const memoizedComputeProperties = memoize(createComputableDepencies);
/** @internal */
const aggregations = useSupportedAggregations();

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
  templateUrl: './form.component.html',
  styleUrls: ['./form-grid.scss', './form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
// , OnChanges
export class NgxSmartFormComponent
  implements
    ReactiveFormComponentInterface,
    AfterViewInit,
    OnDestroy,
    OnChanges
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
  private computedInputsConfig: {
    [prop: string]: ComputedInputValueConfigType<any>;
  } | null = null;
  private requiredIfInputState: {
    [prop: string]: { previous: boolean; current: boolean };
  } | null = null;
  private trackedDependencies: string[] | null = [];
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

  ngOnChanges(changes: SimpleChanges): void {
    if (
      'state' in changes &&
      changes['state'].currentValue !== changes['state'].previousValue
    ) {
      const state = changes['state'].currentValue;
      if (this._formGroup && this._form && state) {
        this.setValue(state);
      }
    }
  }

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
      });
    // We simply return without performing any further action if the validation fails
    // Due to some issue with form group being invalid while all controls does not
    // have error, we are adding a check that verifies if all controls has error before
    // breaking out of the function
    const errors = collectErrors(this._formGroup);
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
            const [g, _inputs, changes] = setInputsProperties(
              this.builder,
              values,
              b,
              fg,
              state,
              n
            );
            this.setFormState({ ...this._form, controlConfigs: _inputs }, g);
            this.updateComputedInputsDepedencies(changes);

            const inputs = this.requiredIfInputState ?? {};
            const computedInputs = this.computedInputsConfig ?? {};
            const changedDependencies = Object.keys(inputs)
              .filter(
                (k) =>
                  // Case the input previous hidden state not equals to it current hidden state
                  inputs[k].previous !== inputs[k].current &&
                  // // Case it current hidden state equals to false meaning now it's visible
                  // inputs[k].current === false &&
                  // And case it's in the list of visible dependencies
                  k in computedInputs
              )
              .map(
                (k) =>
                  [k, computedInputs[k]] as [
                    string,
                    ComputedInputValueConfigType
                  ]
              );
            this.registerDependenciesChanges(changedDependencies);
          })
        )
        .subscribe();
    }
  }

  private registerDependenciesChanges(
    deps: [string, ComputedInputValueConfigType][]
  ) {
    for (const dep of deps) {
      const [name, config] = dep;
      // Case we are already tracking the dependency
      // we continue to the next iteration
      if (this.trackedDependencies?.includes(name)) {
        continue;
      }
      const control = pickAbstractControl(this._formGroup, name);
      if (!control) {
        // Case the control cannot be found, we unsuscribe from any previous
        // subscription on the control
        config.cancel.next();

        // When we unsubscribe from the control, we make sure to remove
        // dependency the dependency subscription tracker
        if (this.trackedDependencies) {
          this.trackedDependencies.splice(
            this.trackedDependencies.indexOf(name),
            1
          );
        }
        continue;
      }
      this.trackedDependencies?.push(name);

      control.valueChanges
        .pipe(
          tap((state) => {
            for (const value of config.values) {
              pickAbstractControl(this._formGroup, value.name)?.setValue(
                value.fn(state)
              );
            }
          }),
          takeUntil(config.cancel)
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
    // Each type form configuration changes, we set the list of computed properties
    const { controlConfigs: inputs } = f;
    this.computedInputsConfig = memoizedComputeProperties(inputs, aggregations);

    // We create an instance of angular Reactive Formgroup instance from input configurations
    // if formgroup parameter is null or undefined
    if (!formgroup) {
      const { builder, state } = this;
      formgroup = builder.group(f);
      // We only initialy set the form state to initialize component when we create
      // a new form group instance because, the next time this function is called
      // `form` and `formGroup` will have initial values
      this.setFormState(f, formgroup);
      // In case state property of the current component is defined, we set the value of the
      if (state) {
        this.setValue(state);
      }
    }

    // We unregister from previous event each time we set the form value
    this._destroy$.next();
    const { controlConfigs: values } = this._form;
    const factory = bindingsFactory(values ?? []);
    const b = factory(this._formGroup);
    const [g, _inputs, changes] = setInputsProperties(
      this.builder,
      values,
      b,
      this._formGroup
    );

    this.updateComputedInputsDepedencies(changes);

    this.setFormState({ ...this._form, controlConfigs: _inputs }, g);

    // Register listeners for computing input values
    this.registerDependenciesChanges(
      Object.entries(this.computedInputsConfig ?? {})
    );

    // register controls value changes and update ui based on requiredIf configuration on form inputs
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

  private updateComputedInputsDepedencies(
    changes: { name: string; value: boolean }[]
  ) {
    if (changes.length === 0) {
      return;
    }
    const changedInputs = this.requiredIfInputState ?? {};
    for (const change of changes) {
      const el = changedInputs[change.name] ?? {};
      changedInputs[change.name] = {
        previous: el.previous ?? change.value,
        current: change.value,
      };
    }
    this.requiredIfInputState = changedInputs;
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this.computedInputsConfig = null;
    this.trackedDependencies = null;
    this.requiredIfInputState = null;
  }
}
