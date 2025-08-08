import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormConfigInterface } from '@azlabsjs/smart-form-core';
import { FormModel } from './form.component.model';
import { filter, Subscription } from 'rxjs';
import { AsyncValidatorFn, FormGroup, ValidatorFn } from '@angular/forms';
import { ReactiveFormDirectiveInterface } from '../../types';

@Directive({
  selector: '[ngxform]',
  exportAs: 'ngxform',
  standalone: true,
  providers: [FormModel],
})
export class NgxFormDirective
  implements
    ReactiveFormDirectiveInterface,
    OnDestroy,
    OnChanges,
    AfterViewInit
{
  private subscriptions: Subscription[] = [];
  private changeSubscription: Subscription | null = null;

  get formGroup() {
    return this.model.state.formGroup;
  }

  private _value!: { [k: string]: unknown };
  @Input({ alias: 'value' }) set value(value: { [k: string]: unknown }) {
    this._value = value;
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
  get form() {
    return this.model.state.form;
  }

  get state() {
    return this.model.state;
  }

  @Output() valueChanges = new EventEmitter<unknown>();
  @Output() ready = new EventEmitter<void>();

  public constructor(
    private model: FormModel,
    private cdRef: ChangeDetectorRef | null
  ) {
    const subscription = this.model.detectChanges$.subscribe(() =>
      this.cdRef?.detectChanges()
    );
    this.subscriptions.push(subscription);
  }

  setValue(state: { [k: string]: unknown }): void {
    // set or update the form state of the current component
    this.model.setValue(state);

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
    // timeout and notify parent component of ready state
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
      'state' in changes &&
      changes['state'].currentValue !== changes['state'].previousValue
    ) {
      const { currentValue: state } = changes['state'];
      if (this.form && this.formGroup && state) {
        this.setValue(this._value);
      }
    }
  }

  validate() {
    this.model.validate();

    const subscription = this.formGroup.statusChanges
      .pipe(filter((status) => ['PENDING', 'DISABLED'].indexOf(status) === -1))
      .subscribe(() => this.cdRef?.markForCheck());

    this.subscriptions.push(subscription);
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

  private updateModel(f: FormConfigInterface, g?: FormGroup) {
    this.model.update(f, g);
    if (this.formGroup) {
      if (this.changeSubscription) {
        this.changeSubscription.unsubscribe();
      }
      const subscription = this.formGroup.valueChanges.subscribe((value) =>
        this.valueChanges.emit(value)
      );
      this.changeSubscription = subscription;
    }
  }
}
