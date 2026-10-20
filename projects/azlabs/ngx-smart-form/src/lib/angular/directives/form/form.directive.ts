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
export class NgxFormDirective implements ReactiveFormDirectiveInterface, OnDestroy, OnChanges, OnInit, AfterViewInit {

  private subscriptions: Subscription[] = [];
  private changeSubscription: Subscription | null = null;
  private init: boolean = false;

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
  @Input({ alias: 'value' }) set value(value: Optional<{ [k: string]: unknown }>) {
    if (typeof value !== 'undefined' && value !== null) {
      this._value = value;
    }
  }
  get value() {
    return this.model.getValue();
  }

  private _form!: FormConfigInterface;
  @Input() set ngxform(value: Optional<FormConfigInterface>) {
    if (value) {
      this._form = value;
    }
  }

  @Input() set form(value: FormConfigInterface) {
    if (value) {
      this._form = value;
    }
  }

  @Output() valueChanges = new EventEmitter<unknown>();
  @Output() ready = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<{ [k: string]: unknown }>();

  public constructor(private model: FormModel<FormConfigInterface>, private cdRef: ChangeDetectorRef | null) {
    this.subscriptions.push(this.model.detectChanges$.subscribe(() => this.cdRef?.detectChanges()));
  }

  setValue(state: { [k: string]: unknown }): void {
    if (!this.form || !this.formGroup) {
      return;
    }

    // set or update the form state of the current component
    if (!state) {
      return;
    }

    this.model.setValue(state);

    // notify ui for value changes
    this.cdRef?.detectChanges();
  }

  addAsyncValidator(validator: AsyncValidatorFn, control?: string): void {
    const c = this.model.get(control);
    if (c) {
      c.addAsyncValidators(validator);
    }
  }


  ngOnInit() {
    if (this._form) {
      this.updateModel(this._form, this._value ?? {});
    }
  }

  ngAfterViewInit() {
    const t = setTimeout(() => {
      this.ready.emit();
      clearTimeout(t);
    }, 700);
  }

  addValidator(validator: ValidatorFn, control?: string): void {
    const c = this.model.get(control);
    if (c) {
      c.addValidators(validator);
    }
  }

  reset(): void {
    this.model.reset();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('value' in changes && this.hasChanged(changes['value']) && 'form' in changes && this.hasChanged(changes['form']) && changes['form'].currentValue) {
      this.updateModel(changes['form'].currentValue, changes['value'].currentValue);
    } else if ('value' in changes && this.hasChanged(changes['value'])) {
      this.setValue(changes['value'].currentValue);
    } else if ('form' in changes && this.hasChanged(changes['form']) && changes['form'].currentValue) {
      this.updateModel(changes['form'].currentValue);
    }
  }

  validate() {
    this.model.validate();

    const subscription = this.model.statusChanges().pipe(
      filter((status) => ['PENDING', 'DISABLED'].indexOf(status) === -1),
      first(),
    ).subscribe(() => this.cdRef?.markForCheck());

    this.subscriptions.push(subscription);
  }

  submit() {
    if (!this.formGroup) {
      return;
    }

    this.validate();
    const errors = collectErrors(this.formGroup);
    if (!this.model.isValid() && errors.length > 0) {
      return;
    }

    this.submitted.emit(this.model.getValue());
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

  private updateModel(config: FormConfigInterface, value?: { [prop: string]: unknown }) {
    const formgroup = this.formGroup;
    const oldValue = this.formGroup?.getRawValue();

    // update model configuration
    this.model.update(config);

    // if current directive model formgroup value is undefined, we drop from the execution context
    if (!this.formGroup) {
      return;
    }

    if (this.formGroup !== formgroup) {
      if (this.changeSubscription) {
        this.changeSubscription.unsubscribe();
      }
      this.changeSubscription = this.model.valueChanges().subscribe(this.valueChanges.emit.bind(this.valueChanges));
    }

    value = value ?? oldValue;
    if (value) {
      this.setValue(value);
    }
  }

  private hasChanged(change: SimpleChange) {
    const { previousValue, currentValue } = change;
    return !deepEqual(previousValue, currentValue);
  }
}
