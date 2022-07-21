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
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { EMPTY, from, lastValueFrom, Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import {
  FormConfigInterface,
  InputGroup,
  InputConfigInterface,
} from '@azlabsjs/smart-form-core';
import {
  AngularReactiveFormBuilderBridge,
  HTTP_REQUEST_CLIENT,
} from '../../types';
import {
  cloneAbstractControl,
  ComponentReactiveFormHelpers,
  controlAttributesDataBindings,
  createHiddenAttributeSetter,
  setControlsAttributes,
} from '../../helpers';
import {
  ANGULAR_REACTIVE_FORM_BRIDGE,
  BindingInterface,
  ControlsStateMap,
  FormComponentInterface,
} from '../../types';
import { RequestClient } from '../../../http';

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
        color: var(--clr-h3-color, black);
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxSmartFormComponent
  implements FormComponentInterface, AfterViewInit, OnDestroy
{
  //#region Local properties
  formGroup!: FormGroup;
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
  //#endregion Component inputs

  //#region Component outputs
  @Output() submit = new EventEmitter<{ [index: string]: any }>();
  @Output() readyState = new EventEmitter();
  @Output() formGroupChange = new EventEmitter<FormGroup>();
  @Output() complete = new EventEmitter<unknown>();
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
    private cdRef: ChangeDetectorRef,
    @Inject(HTTP_REQUEST_CLIENT) @Optional() private client?: RequestClient
  ) {}

  ngAfterViewInit(): void {
    this.setComponentForm(this.form);
    this.cdRef.detectChanges();
  }

  //#region FormComponent interface Methods definitions
  controlValueChanges(control: string): Observable<unknown> {
    const control_ = this.formGroup?.get(control);
    if (control_) {
      return control_.valueChanges;
    }
    return EMPTY;
  }

  getControlValue(control: string, _default?: any): unknown {
    const value = this.formGroup.get(control)?.value;
    return value || _default || undefined;
  }
  setControlValue(control: string, value: any): void {
    this.formGroup.get(control)?.setValue(value);
  }
  disableControls(controls: ControlsStateMap): void {
    for (const [key, entry] of Object.entries(controls)) {
      this.formGroup.get(key)?.disable(entry);
    }
  }
  enableControls(controls: ControlsStateMap): void {
    for (const [key, entry] of Object.entries(controls)) {
      this.formGroup.get(key)?.enable(entry);
    }
  }

  //
  addControl(name: string, control: AbstractControl): void {
    if (this.formGroup.get(name)) {
      return this.formGroup.get(name)?.setValue(control.value);
    }
    this.formGroup.addControl(name, control);
  }

  //
  getControl(name: string): AbstractControl | undefined {
    return this.formGroup.get(name) ?? undefined;
  }

  //
  async onSubmit(event: Event) {
    // Validate the formgroup object to ensure it passes
    // validation before submitting
    this.validateForm();
    this.cdRef.detectChanges();
    // We simply return without performing any further action
    // if the validation fails
    if (!this.formGroup.valid) {
      return;
    }
    const path = this.path || this.form.endpointURL;
    const clientIsDefined =
      typeof this.client !== 'undefined' && this.client !== null;
    const pathIsDefined = path !== null && path !== 'undefined';
    if (this.autoSubmit && clientIsDefined && pathIsDefined) {
      this.performingRequest.emit(true);
      const response = await lastValueFrom(
        from(
          (this.client as RequestClient).request(
            path || 'http://localhost',
            'POST',
            this.formGroup.getRawValue()
          )
        )
      );
      this.performingRequest.emit(false);
      this.complete.emit(response);
    } else if (
      (this.autoSubmit && !clientIsDefined) ||
      (this.autoSubmit && !pathIsDefined)
    ) {
      // We throw an error if developper misconfigured the smart form component
      throw new Error(
        'autoSubmit input property must only be true if the form endpointURL is configured or an Http Client has been registered!'
      );
    } else {
      this.submit.emit(this.formGroup.getRawValue());
    }
    event.preventDefault();
  }

  //
  setComponentForm(value: FormConfigInterface): void {
    if (value) {
      // We set the controls container class
      const controls = (value.controlConfigs ?? []).map((current) => ({
        ...current,
        containerClass: false
          ? 'clr-col-md-12'
          : current.containerClass ?? 'clr-col-md-12',
        isRepeatable: current.isRepeatable ?? false,
      }));
      //
      this.form = { ...value, controlConfigs: controls };
      // We unregister from previous event each time we set the
      // form value
      this._destroy$.next();
      // We create an instance of angular Reactive Formgroup instance
      // from input configurations
      this.formGroup = this.builder.group(value) as FormGroup;
      // Set input bindings
      this.setBindings();
      // Subscribe to formgroup changes
      this.formGroup.valueChanges
        .pipe(
          tap((state) => this.formGroupChange.emit(state)),
          takeUntil(this._destroy$)
        )
        .subscribe();
      // Set the form value if it's defined
      if (this.state) {
        this.setFormValue(
          this.formGroup,
          this.state,
          this.form.controlConfigs ?? []
        );
      }
      // Timeout and notify parent component
      // of ready state
      const timeout = setTimeout(() => {
        this.readyState.emit();
        clearTimeout(timeout);
      }, 20);
    }
  }

  //
  validateForm(): void {
    ComponentReactiveFormHelpers.validateFormGroupFields(this.formGroup);
  }

  //
  reset(): void {
    this.formGroup.reset();
    for (const control of this.form.controlConfigs ?? []) {
      this.formGroup.get(control.name)?.setValue(control.value);
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
      this.cdRef.detectChanges();
    }
  }

  setBindings() {
    if (this.form && this.formGroup) {
      const [bindings, formgroup, controls] = controlAttributesDataBindings(
        this.form.controlConfigs ?? []
      )(this.formGroup);
      this.form = {
        ...this.form,
        controlConfigs: controls as InputConfigInterface[],
      };
      this.formGroup = formgroup as FormGroup;
      // Get control entries from the formgroup
      const entries = Object.entries(this.formGroup.controls);
      // Handle form control value changes
      for (const [name, abstractControl] of entries) {
        abstractControl.valueChanges
          .pipe(
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
          createHiddenAttributeSetter
        )(this.formGroup);
        this.formGroup = control as FormGroup;
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
      if (formgroup.controls[key] && value) {
        if (formgroup.controls[key] instanceof FormGroup) {
          this.setFormValue(
            formgroup.controls[key] as FormGroup,
            value,
            config_
          );
        } else if (
          formgroup.controls[key] instanceof FormArray &&
          Boolean(config_?.isRepeatable) === true
        ) {
          const controls = (config_ as InputGroup)?.children;
          const children = Array.isArray(controls)
            ? controls
            : [controls].filter(
                (current) => typeof current !== 'undefined' && current !== null
              );
          // TODO : Create formgroup
          const group = this.builder.group(children) as FormGroup;
          const values_ = Array.isArray(value) ? value : [];
          const array_ = new FormArray([]);
          for (const current of values_) {
            const tmp = cloneAbstractControl(group);
            this.setFormGroupValue(tmp, current);
            array_.push(tmp);
          }
          formgroup.controls[key] = array_;
        } else {
          try {
            formgroup.controls[key].setValue(value);
          } catch (error) {}
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

  private createFormGroupOnFly() {}

  ngOnDestroy(): void {
    this._destroy$.next();
  }
}
