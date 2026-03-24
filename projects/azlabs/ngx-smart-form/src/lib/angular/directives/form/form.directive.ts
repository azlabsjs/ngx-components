import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChange,
  SimpleChanges,
} from '@angular/core';
import { FormConfigInterface } from '@azlabsjs/smart-form-core';
import { FormModel } from './form.model';
import { filter, first, Subscription } from 'rxjs';
import { AsyncValidatorFn, ValidatorFn } from '@angular/forms';
import { ReactiveFormDirectiveInterface } from '../../types';
import { Optional } from './types';
import { collectErrors } from '../../helpers';
import { deepEqual } from '@azlabsjs/utilities';

@Directive({
  selector: '[ngxform]',
  exportAs: 'ngxform',
  standalone: true,
  providers: [FormModel],
})
export class NgxFormDirective
  implements
    ReactiveFormDirectiveInterface,
    OnInit,
    OnDestroy,
    OnChanges,
    AfterViewInit
{
  //#region local properties
  private subscriptions: Subscription[] = [];
  private changeSubscription: Subscription | null = null;
  //#endregion

  get formGroup() {
    return this.model.state.formGroup;
  }
  get form() {
    return this.model.state.form;
  }
  get state() {
    return this.model.state;
  }

  private _value!: { [k: string]: unknown };
  @Input({ alias: 'value' }) set value(
    value: Optional<{ [k: string]: unknown }>,
  ) {
    if (typeof value !== 'undefined' && value !== null) {
      this._value = value;
    }
  }
  get value() {
    return this.model.getValue();
  }

  @Input() set ngxform(value: FormConfigInterface) {
    this.updateModel(value);
  }
  @Input() set form(value: FormConfigInterface) {
    this.updateModel(value);
  }

  @Output() valueChanges = new EventEmitter<unknown>();
  @Output() ready = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<{ [k: string]: unknown }>();

  public constructor(
    private model: FormModel<FormConfigInterface>,
    private cdRef: ChangeDetectorRef | null,
  ) {
    const subscription = this.model.detectChanges$.subscribe(() =>
      this.cdRef?.detectChanges(),
    );
    this.subscriptions.push(subscription);
  }

  ngOnInit(): void {
    this.setValue(this._value);
  }

  setValue(state: { [k: string]: unknown }): void {
    if (!this.form || !this.formGroup) {
      return;
    }

    // set or update the form state of the current component
    if (state) {
      this.model.setValue(state);
    }

    // notify ui for value changes
    this.cdRef?.markForCheck();
  }

  addAsyncValidator(validator: AsyncValidatorFn, control?: string): void {
    const c = control ? this.formGroup.get(control) : this.formGroup;
    if (c) {
      c.addAsyncValidators(validator);
    }
  }

  ngAfterViewInit(): void {
    const t = setTimeout(() => {
      this.ready.emit();
      clearTimeout(t);
    }, 700);
  }

  addValidator(validator: ValidatorFn, control?: string): void {
    const c = control ? this.formGroup.get(control) : this.formGroup;
    if (c) {
      c.addValidators(validator);
    }
  }

  reset(): void {
    this.model.reset();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      'state' in changes ||
      ('value' in changes && this.valueHasChanged(changes['value']))
    ) {
      this.setValue(this._value);
    }
  }

  validate() {
    this.model.validate();

    const subscription = this.formGroup.statusChanges
      .pipe(
        filter((status) => ['PENDING', 'DISABLED'].indexOf(status) === -1),
        first(),
      )
      .subscribe(() => this.cdRef?.markForCheck());

    this.subscriptions.push(subscription);
  }

  submit() {
    if (!this.formGroup) {
      return;
    }

    this.validate();

    const errors = collectErrors(this.formGroup);
    if (!this.formGroup.valid && errors.length > 0) {
      return;
    }

    this.submitted.emit(this.formGroup.getRawValue());
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

  private updateModel(config: FormConfigInterface) {
    const formgroup = this.formGroup;
    const value = formgroup ? formgroup.getRawValue() : null;

    // update model configuration
    this.model.update(config);

    // if current directive model formgroup value is undefined, we drop from the execution context
    if (!this.formGroup) {
      return;
    }

    // case the formgroup reference changes, subscribe to the new formgroup valueChanges
    if (this.formGroup !== formgroup) {
      if (this.changeSubscription) {
        this.changeSubscription.unsubscribe();
      }

      // subscribe to new formgroup changes
      this.changeSubscription = this.formGroup.valueChanges.subscribe((value) =>
        this.valueChanges.emit(value),
      );
    }

    // we maintain the state of the directive by setting
    // it model state to the previous state.
    if (value) {
      this.setValue(value);
    }
  }

  private valueHasChanged(change: SimpleChange) {
    const { previousValue, currentValue } = change;
    return !deepEqual(previousValue, currentValue);
  }
}
