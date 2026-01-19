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
import { EMPTY, from, lastValueFrom, Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { RequestClient } from '../../../http';
import { collectErrors } from '../../helpers';
import { ControlsStateMap, ReactiveFormComponentInterface } from '../../types';
import { HTTP_REQUEST_CLIENT } from '../../tokens';
import { CommonModule } from '@angular/common';
import { PIPES } from '../../pipes';
import { FormModel } from './form.model';
import { NgxFormComponent } from './form-ui.component';
import { ModalDirective } from '../modal';

/** @internal */
const AUTO_SUBMIT_ERROR_MESSAGE =
  'autoSubmit input property must only be true if the form endpointURL is configured or an Http Client has been registered!';

@Component({
  standalone: true,
  imports: [CommonModule, ...PIPES, NgxFormComponent],
  selector: 'ngx-smart-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form-grid.scss', './form.component.scss'],
  providers: [FormModel],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxSmartFormComponent
  implements
    ReactiveFormComponentInterface,
    AfterViewInit,
    OnDestroy,
    OnChanges
{
  get formGroup() {
    return this.model.state.formGroup;
  }

  get form() {
    return this.model.state.form;
  }

  //#region component inputs
  @Input() template!: TemplateRef<any>;
  @Input() addTemplate!: TemplateRef<any>;
  @Input() label!: TemplateRef<any>;
  @Input() performingAction = false;
  @Input() disabled = false;
  @Input() submitable = false;
  @Input({ alias: 'form' }) set setForm(value: FormConfigInterface) {
    this.updateModel(value);
  }
  @Input() autoSubmit: boolean = false;
  @Input() path!: string;
  @Input() state!: { [index: string]: any };
  @Input() autoupload: boolean = false;
  @Input() action: HTTPRequestMethods = 'POST';
  @Input('no-grid-layout') noGridLayout = false;
  @Input() modal!: ModalDirective;
  //#endregion

  //#region component outputs
  @Output() submit = new EventEmitter<{ [index: string]: any }>();
  @Output() ready = new EventEmitter();
  @Output() changes = new EventEmitter();
  @Output() formGroupChange = new EventEmitter<FormGroup>();
  @Output() complete = new EventEmitter<unknown>();
  @Output() error = new EventEmitter<unknown>();
  @Output() performingRequest = new EventEmitter<boolean>();
  //#endregion

  @HostListener('keyup.enter', ['$event'])
  onEnterButtonCliked(event: Event) {
    if (!this.performingAction) {
      this.onSubmit(event);
    }
  }

  //#region component children
  @ContentChild('submitButton') submitRef!: TemplateRef<Node>;
  @ContentChild(ModalDirective) formmodal!: ModalDirective | null;
  //#endregion

  private subscriptions: Subscription[] = [];
  private changeSubscription: Subscription | null = null;

  public constructor(
    protected readonly model: FormModel,
    private cdRef: ChangeDetectorRef | null,
    @Inject(HTTP_REQUEST_CLIENT) @Optional() private client?: RequestClient
  ) {
    const subscription = this.model.detectChanges$.subscribe(() =>
      this.cdRef?.detectChanges()
    );
    this.subscriptions.push(subscription);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      'state' in changes &&
      changes['state'].currentValue !== changes['state'].previousValue
    ) {
      const { currentValue: state } = changes['state'];
      if (this.form && this.formGroup && state) {
        this.setValue(state);
      }
    }
  }

  setValue(state: { [k: string]: unknown }): void {
    // set or update the form state of the current component
    this.model.setValue(state);

    // notify ui for value changes
    this.cdRef?.markForCheck();
  }

  ngAfterViewInit(): void {
    // timeout and notify parent component of ready state
    const t = setTimeout(() => {
      this.ready.emit();
      clearTimeout(t);
    }, 700);
  }

  //#region component interface method definitions
  controlValueChanges(name: string): Observable<unknown> {
    return this.formGroup?.get(name)?.valueChanges ?? EMPTY;
  }

  getControlValue(control: string, _default?: any): unknown {
    const value = this.formGroup?.get(control)?.value;
    return value || _default || undefined;
  }

  setControlValue(control: string, value: any): void {
    this.formGroup.get(control)?.setValue(value);
  }

  disableControls(controls: ControlsStateMap): void {
    for (const [key, entry] of Object.entries(controls)) {
      this.formGroup?.get(key)?.disable(entry);
    }
  }

  addAsyncValidator(validator: AsyncValidatorFn, control?: string) {
    const input = control ? this.formGroup?.get(control) : this.formGroup;
    if (input) {
      input.addAsyncValidators(validator);
    }
  }

  addValidator(validator: ValidatorFn, control?: string) {
    const _control = control ? this.formGroup?.get(control) : this.formGroup;
    if (_control) {
      _control.addValidators(validator);
    }
  }

  enableControls(controls: ControlsStateMap): void {
    for (const [key, entry] of Object.entries(controls)) {
      this.formGroup?.get(key)?.enable(entry);
    }
  }

  addControl(name: string, control: AbstractControl): void {
    if (this.formGroup?.get(name)) {
      this.formGroup?.get(name)?.setValue(control.value);
    }
    this.formGroup?.addControl(name, control);
  }

  getControl(name: string): AbstractControl | undefined {
    return this.formGroup?.get(name) ?? undefined;
  }

  async onSubmit(event: Event) {
    event.preventDefault();

    if (!this.formGroup) {
      return;
    }

    // validate the formgroup object to ensure it passes validation before submitting
    this.model.validate();

    // wait the for status changes of the formgroup
    // to make sure ui update error message
    const subscription = this.formGroup?.statusChanges
      .pipe(filter((status) => ['PENDING', 'DISABLED'].indexOf(status) === -1))
      .subscribe(() => this.cdRef?.detectChanges());

    if (subscription) {
      this.subscriptions.push(subscription);
    }

    // We simply return without performing any further action if the validation fails
    // Due to some issue with form group being invalid while all controls does not
    // have error, we are adding a check that verifies if all controls has error before
    // breaking out of the function
    const errors = collectErrors(this.formGroup);
    if (!this.formGroup.valid && errors.length > 0) {
      return;
    }

    const path = this.path ?? this.form?.endpointURL;
    const clientDefined =
      typeof this.client !== 'undefined' && this.client !== null;
    const pathDefined = path !== null && path !== 'undefined';
    const shouldSubmit = this.autoSubmit && clientDefined;

    // case component is configured to auto submit form values, we send
    // request using the configured client object
    if (shouldSubmit && pathDefined) {
      await this.sendRequest(path || 'http://localhost');
      return;
    }
    const configError =
      (this.autoSubmit && !clientDefined) || (this.autoSubmit && !pathDefined);

    // case there is no configuration error, emit a submit event
    if (!configError) {
      this.submit.emit(this.model.getValue());
      return;
    }
    // We throw an error if developper misconfigured the smart form component
    throw new Error(AUTO_SUBMIT_ERROR_MESSAGE);
  }

  setComponentForm(value: FormConfigInterface): void {
    if (value) {
      // we set the controls container class
      const controls = (value.controlConfigs ?? []).map((current) => ({
        ...current,
        containerClass: current.containerClass ?? 'input-col-md-12',
        isRepeatable: current.isRepeatable ?? false,
      }));
      const form = { ...value, controlConfigs: controls };
      this.updateModel(form, this.formGroup);
    }
  }

  /** @deprecated */
  validateForm(): void {
    this.model.validate();
  }

  reset(): void {
    this.model.reset();
  }
  //#endregion

  setControlConfig(config?: InputConfigInterface, name?: string) {
    if (!this.form) {
      return;
    }

    if (!config) {
      return;
    }
    name = name ?? config.name;
    const { controlConfigs: inputs } = this.form ?? {};
    const index = inputs?.findIndex((current) => current.name === name);
    if (!index) {
      return;
    }

    inputs?.splice(index, 1, config);
    const form = { ...this.form, controlConfigs: inputs };
    this.updateModel(form, this.formGroup);
  }

  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      if (subscription) {
        subscription.unsubscribe();
      }
    }
    this.subscriptions = [];
    this.changeSubscription = null;
  }

  private async sendRequest(path: string) {
    try {
      this.performingRequest.emit(true);
      const response = await lastValueFrom(
        from(
          (this.client as RequestClient).request(
            path || 'http://localhost',
            this.action ?? 'POST',
            this.model.getValue()
          )
        )
      );
      this.performingRequest.emit(false);
      this.complete.emit(response);
    } catch (error) {
      this.error.emit(error);
    }
  }

  private updateModel(f: FormConfigInterface, g?: FormGroup) {
    this.model.update(f, g);
    if (this.formGroup) {
      if (this.changeSubscription) {
        this.changeSubscription.unsubscribe();
      }
      const subscription = this.formGroup.valueChanges.subscribe((value) =>
        this.formGroupChange.emit(value)
      );
      this.changeSubscription = subscription;
    }
  }
}
