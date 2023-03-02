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
  TemplateRef
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup
} from '@angular/forms';
import { HTTPRequestMethods } from '@azlabsjs/requests';
import {
  FormConfigInterface,
  InputConfigInterface,
  InputGroup
} from '@azlabsjs/smart-form-core';
import { EMPTY, from, lastValueFrom, Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { RequestClient } from '../../../http';
import {
  ComponentReactiveFormHelpers,
  controlAttributesDataBindings,
  setControlsAttributes,
  useHiddenAttributeSetter
} from '../../helpers';
import {
  AngularReactiveFormBuilderBridge,
  ANGULAR_REACTIVE_FORM_BRIDGE,
  BindingInterface,
  ControlsStateMap,
  HTTP_REQUEST_CLIENT,
  ReactiveFormComponentInterface
} from '../../types';

@Component({
  selector: 'ngx-smart-form',
  templateUrl: './ngx-smart-form.component.html',
  styles: [
    `
      :host ::ng-deep .clr-input,
      :host ::ng-deep .clr-control-container,
      :host ::ng-deep .clr-input-wrapper {
        width: 100%;
      }
      div.control__group__header,
      :host ::ng-deep div.control__group__header {
        font-size: 1rem;
        letter-spacing: normal;
        line-height: 1.2rem;
        margin-top: 1.2rem;
        margin-bottom: 0;
        font-weight: var(--clr-h3-font-weight, 200);
      }
      :host ::ng-deep .required-text,
      :host ::ng-deep .field-has-error {
        color: rgb(241, 50, 50);
      }
      :host ::ng-deep .clr-input-wrapper .clr-input:disabled {
        background: rgba(244, 244, 244, 0.3);
      }
      .ngx-smart-form-control,
      :host ::ng-deep .ngx-smart-form-control {
        margin: 0;
        padding: 0;
        margin-top: 1rem;
      }
      .ngx-smart-form-control,
      :host ::ng-deep .ngx-smart-form-control {
        padding: 0.3rem;
      }
      :host ::ng-deep .clr-form-control {
        margin-top: 0rem !important;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
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
  //#endregion Local properties

  //#region Component inputs
  @Input() template!: TemplateRef<Node>;
  @Input() addTemplate!: TemplateRef<Node>;
  @Input() performingAction = false;
  @Input() disabled = false;
  @Input() submitable = false;
  @Input() form!: FormConfigInterface;
  @Input() autoSubmit: boolean = false;
  @Input() path!: string;
  @Input() state!: { [index: string]: any };
  @Input() autoupload: boolean = false;
  @Input() submitupload: boolean = false;
  @Input() action: HTTPRequestMethods = 'POST';
  //#endregion Component inputs

  //#region Component outputs
  @Output() submit = new EventEmitter<{ [index: string]: any }>();
  /**
   * @deprecated In future release, `readyState` event will be remove
   * Use `ready` listener instead
   */
  @Output() readyState = new EventEmitter();
  @Output() changes = new EventEmitter();
  @Output() formGroupChange = new EventEmitter<FormGroup>();
  @Output() complete = new EventEmitter<unknown>();
  @Output() error = new EventEmitter<unknown>();
  @Output() performingRequest = new EventEmitter<boolean>();
  //#endregion Component outputs

  // @internal
  private _destroy$ = new Subject<void>();

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
    private changesRef: ChangeDetectorRef,
    @Inject(HTTP_REQUEST_CLIENT) @Optional() private client?: RequestClient
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('form' in changes) {
      this.onFormConfigChanges();
    }
  }

  setValue(state: { [k: string]: unknown }): void {
    // Set or update the form state of the current component
    this.setFormValue(this._formGroup, state, this.form.controlConfigs ?? []);
    this.changesRef?.markForCheck();
  }

  ngAfterViewInit(): void {
    this.setComponentForm(this.form);
    // Timeout and notify parent component of ready state
    this.readyState.emit();
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
    // Validate the formgroup object to ensure it passes
    // validation before submitting
    this.validateForm();
    this.changesRef.detectChanges();
    // We simply return without performing any further action
    // if the validation fails
    if (!this._formGroup.valid) {
      return;
    }
    const path = this.path || this.form.endpointURL;
    const clientIsDefined =
      typeof this.client !== 'undefined' && this.client !== null;
    const pathIsDefined = path !== null && path !== 'undefined';
    if (this.autoSubmit && clientIsDefined && pathIsDefined) {
      await this.sendRequest(path || 'http://localhost');
    } else if (
      (this.autoSubmit && !clientIsDefined) ||
      (this.autoSubmit && !pathIsDefined)
    ) {
      // We throw an error if developper misconfigured the smart form component
      throw new Error(
        'autoSubmit input property must only be true if the form endpointURL is configured or an Http Client has been registered!'
      );
    } else {
      this.submit.emit(this._formGroup.getRawValue());
    }
    event.preventDefault();
  }

  setComponentForm(value: FormConfigInterface): void {
    if (value) {
      // We set the controls container class
      const controls = (value.controlConfigs ?? []).map((current) => ({
        ...current,
        containerClass: current.containerClass ?? 'clr-col-md-12',
        isRepeatable: current.isRepeatable ?? false,
      }));
      //
      this.form = { ...value, controlConfigs: controls };
      this.onFormConfigChanges();
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
      this.form = { ...this.form, controlConfigs: controls };
      // We trigger the change detector to detect changes after updating
      // the form controlConfigs
      this.changesRef.detectChanges();
    }
  }

  setBindings() {
    if (this.form && this._formGroup) {
      const [bindings, formgroup, controls] = controlAttributesDataBindings(
        this.form.controlConfigs ?? []
      )(this._formGroup);
      this.form = {
        ...this.form,
        controlConfigs: controls as InputConfigInterface[],
      };
      this._formGroup = formgroup as FormGroup;
      for (const name in this._formGroup.controls) {
        this._formGroup
          .get(name)
          ?.valueChanges.pipe(
            tap((state) =>
              this.handleControlChanges(
                state,
                name,
                bindings as Map<string, BindingInterface>
              )
            ),
            takeUntil(this._destroy$)
          )
          .subscribe();
      }
    }
  }

  // tslint:disable-next-line: typedef
  handleControlChanges(
    event: any,
    name: string,
    bindings: Map<string, BindingInterface>
  ) {
    for (const current of bindings.values()) {
      if (current.binding?.name.toString() === name.toString()) {
        const [control, controls] = setControlsAttributes(
          this.form.controlConfigs ?? [],
          current,
          event,
          useHiddenAttributeSetter
        )(this._formGroup);
        this._formGroup = control as FormGroup;
        this.form = { ...this.form, controlConfigs: controls };
      }
    }
  }
  //#endregion Ported wrapper methods

  private setFormValue(
    formgroup: FormGroup,
    values: { [index: string]: any },
    configs?: InputConfigInterface[] | InputConfigInterface
  ) {
    for (const [key, value] of Object.entries(values)) {
      const config_ = Array.isArray(configs)
        ? configs?.find((config) => config.name === key)
        : configs;
      if (typeof config_ === 'undefined' || config_ === null) {
        continue;
      }
      if (formgroup.controls[key] && value) {
        if (formgroup.controls[key] instanceof FormGroup) {
          this.setFormValue(
            formgroup.controls[key] as FormGroup,
            value,
            config_
          );
        } else if (
          formgroup.controls[key] instanceof FormArray &&
          Boolean(config_?.isRepeatable) === true &&
          ((config_ as InputGroup)?.children ?? []).length > 0
        ) {
          const controls = (config_ as InputGroup)?.children;
          const children = Array.isArray(controls)
            ? controls
            : [controls].filter(
                (current) => typeof current !== 'undefined' && current !== null
              );
          const values_ = Array.isArray(value) ? value : [];
          const array_ = new FormArray([] as FormGroup[]);
          for (const current of values_) {
            const tmp = this.builder.group(children) as FormGroup;
            this.setFormGroupValue(tmp, current);
            array_.push(tmp);
          }
          formgroup.controls[key] = array_;
        } else if (
          formgroup.controls[key] instanceof FormArray &&
          Boolean(config_?.isRepeatable)
        ) {
          const values_ = Array.isArray(value) ? value : [];
          const array_ = new FormArray([] as FormControl[]);
          for (const current of values_) {
            const tmp = this.builder.control(config_) as FormControl;
            tmp.setValue(current);
            array_.push(tmp);
          }
          formgroup.controls[key] = array_;
        } else {
          formgroup.controls[key]?.setValue(value);
        }
      }
    }
  }

  private setFormGroupValue(
    formgroup: FormGroup,
    values: { [index: string]: any }
  ) {
    for (const [key, value] of Object.entries(values)) {
      try {
        formgroup.controls[key].setValue(value);
      } catch (error) {
        //
      }
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

  private onFormConfigChanges() {
    // We unregister from previous event each time we set the
    // form value
    this._destroy$.next();
    // We create an instance of angular Reactive Formgroup instance
    // from input configurations
    this._formGroup = this.builder.group(this.form) as FormGroup;
    // Set input bindings
    this.setBindings();
    // Subscribe to formgroup changes
    this._formGroup?.valueChanges
      .pipe(
        tap((state) => this.formGroupChange.emit(state)),
        takeUntil(this._destroy$)
      )
      .subscribe();
    // Set the form value if it's defined
    if (this.state) {
      this.setValue(this.state);
    }
    this.changes.emit();
  }

  isFormControl(value: unknown) {
    return (
      typeof value !== 'undefined' &&
      value !== null &&
      value instanceof AbstractControl &&
      typeof (value as FormControl).registerOnChange === 'function'
    );
  }
  ngOnDestroy(): void {
    this._destroy$.next();
  }
}
