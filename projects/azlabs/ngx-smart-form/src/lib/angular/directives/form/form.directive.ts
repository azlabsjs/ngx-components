import { AfterViewInit, ChangeDetectorRef, Directive, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { FormConfigInterface } from '@azlabsjs/smart-form-core';
import { FormModel } from './form.model';
import { filter, first, Subscription } from 'rxjs';
import { AsyncValidatorFn, FormGroup, ValidatorFn } from '@angular/forms';
import { ReactiveFormDirectiveInterface } from '../../types';
import { FormModelState, Optional } from './types';
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

  get formGroup() {
    return this.model.state.formGroup;
  }

  /** @deprecated use event `formChange` binding instead to have proper dependency changes */
  get form() {
    return this.model.state.form;
  }

  /** @deprecated use event `stateChange` binding instead to have proper dependency changes */
  get state() {
    return this.model.state;
  }

  /** an observable of detached inputs */
  get detached() {
    return this.model.state.detached;
  }

  private formValue: { [k: string]: unknown } | null = null;
  @Input() set value(value: Optional<{ [k: string]: unknown }>) {
    if (typeof value !== 'undefined' && value !== null) {
      this.formValue = value;
    }
  }
  get value() {
    return this.model.getValue();
  }

  private formConfig!: Optional<FormConfigInterface>;
  @Input() set ngxform(value: Optional<FormConfigInterface>) {
    this.formConfig = value;
  }

  @Input() set form(value: FormConfigInterface) {
    this.formConfig = value;
  }

  @Output() valueChanges = new EventEmitter<unknown>();
  @Output() ready = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<{ [k: string]: unknown }>();

  @Output() formChange = new EventEmitter<FormConfigInterface>();
  @Output() formGroupChange = new EventEmitter<FormGroup>();
  @Output() stateChange = new EventEmitter<Required<FormModelState<FormConfigInterface>>>();

  public constructor(private model: FormModel<FormConfigInterface>, private cdRef: ChangeDetectorRef | null) {
    const subscription1 = this.model.formGroupChanged$.subscribe((e) => {
      this.formGroupChange.emit(e);
      this.stateChange.emit(this.model.state);
    });

    const subscription2 = this.model.formChanged$.subscribe((e) => {
      this.formChange.emit(e);
      this.stateChange.emit(this.model.state);
    });

    this.subscriptions.push(subscription1, subscription2);
  }

  setValue(state: { [k: string]: unknown }): void {
    if (!this.model.state.form || !this.model.state.formGroup) {
      return;
    }

    if (!state) {
      return;
    }

    this.model.setValue(state);
    this.cdRef?.markForCheck();
  }

  addAsyncValidator(validator: AsyncValidatorFn, control?: string): void {
    const c = this.model.get(control);
    if (c) {
      c.addAsyncValidators(validator);
    }
  }


  ngOnInit() {
    if (this.formConfig) {
      this.updateModel(this.formConfig, this.formValue ?? {});
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
    } else if ('value' in changes && this.hasChanged(changes['value']) && 'ngxform' in changes && this.hasChanged(changes['ngxform']) && changes['ngxform'].currentValue) {
      this.updateModel(changes['ngxform'].currentValue, changes['value'].currentValue);
    } else if ('value' in changes && this.hasChanged(changes['value'])) {
      this.setValue(changes['value'].currentValue);
    } else if ('form' in changes && this.hasChanged(changes['form']) && changes['form'].currentValue) {
      this.updateModel(changes['form'].currentValue);
    } else if ('ngxform' in changes && this.hasChanged(changes['ngxform']) && changes['ngxform'].currentValue) {
      this.updateModel(changes['ngxform'].currentValue);
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
    if (!this.model.state.formGroup) {
      return;
    }

    this.validate();
    const errors = collectErrors(this.model.state.formGroup);
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
    const formgroup = this.model.state.formGroup;
    const oldValue = this.model.state.formGroup?.getRawValue();

    // update model configuration
    this.model.update(config);

    // if current directive model formgroup value is undefined, we drop from the execution context
    if (!this.model.state.formGroup) {
      return;
    }

    if (this.model.state.formGroup !== formgroup) {
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
