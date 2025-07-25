import { Inject, Injectable, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  AngularReactiveFormBuilderBridge,
  BindingInterface,
  ComputedInputValueConfigType,
} from '../../types';
import { FormConfigInterface } from '@azlabsjs/smart-form-core';
import {
  bindingsFactory,
  ComponentReactiveFormHelpers,
  createComputableDepencies,
  pickAbstractControl,
  setFormValue,
  setInputsProperties,
  useSupportedAggregations,
} from '../../helpers';
import { memoize } from '@azlabsjs/functional';
import { Subject, Subscription, takeUntil, tap } from 'rxjs';
import { ANGULAR_REACTIVE_FORM_BRIDGE } from '../../tokens';

/** @internal */
const memoizedComputeProperties = memoize(createComputableDepencies);
/** @internal */
const aggregations = useSupportedAggregations();

@Injectable()
export class FormModel implements OnDestroy {
  _detectChanges$ = new Subject<void>();
  readonly detectChanges$ = this._detectChanges$.asObservable();

  //#region local properties
  // @internal
  private _formGroup!: FormGroup;
  get formGroup() {
    return this._formGroup;
  }
  private _form!: FormConfigInterface;
  get form() {
    return this._form;
  }

  // @internal
  private computedInputs: {
    [prop: string]: ComputedInputValueConfigType<any>;
  } | null = null;
  private requiredIfInputs: {
    [prop: string]: { previous: boolean; current: boolean };
  } | null = null;
  private trackedDependencies: string[] | null = [];
  private subscriptions: Subscription[] = [];
  private state!: { [k: string]: unknown };
  //#endregion

  // form component model class constructor
  constructor(
    @Inject(ANGULAR_REACTIVE_FORM_BRIDGE)
    private builder: AngularReactiveFormBuilderBridge
  ) {}

  update(f: FormConfigInterface, formgroup?: FormGroup) {
    // each type form configuration changes, we set the list of computed properties
    const { controlConfigs: inputs } = f;
    this.computedInputs = memoizedComputeProperties(inputs, aggregations);

    // we create an instance of angular Reactive Formgroup instance from input configurations
    // if formgroup parameter is null or undefined
    if (!formgroup) {
      const { builder, state } = this;
      formgroup = builder.group(f);
      // we only initialy set the form state to initialize component when we create
      // a new form group instance because, the next time this function is called
      // `form` and `formGroup` will have initial values
      this.setFormState(f, formgroup);

      // in case state property of the current component is defined, we set the value of the
      if (state) {
        this.setValue(state);
      }
    }

    // we unregister from previous event each time we set the form value
    this.unsubscribe();

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

    // register listeners for computing input values
    this.registerDependenciesChanges(Object.entries(this.computedInputs ?? {}));

    // register controls value changes and update ui based on requiredIf configuration on form inputs
    this.registerControlValueChanges(b);
  }

  setValue(state: { [k: string]: unknown }): void {
    // set or update the form state of the current component
    const { controlConfigs } = this._form;
    setFormValue(this.builder, this._formGroup, state, controlConfigs ?? []);
  }

  getValue(): { [k: string]: unknown } {
    if (!this._formGroup) {
      return {};
    }
    return this._formGroup.getRawValue();
  }

  validate() {
    ComponentReactiveFormHelpers.validateFormGroupFields(this._formGroup);
  }

  reset() {
    this._formGroup.reset();
    for (const control of this.form.controlConfigs ?? []) {
      this._formGroup.get(control.name)?.setValue(control.value);
    }
  }

  destroy() {
    this.unsubscribe();
  }

  // angular compatible destroy member function
  ngOnDestroy(): void {
    this.destroy();
  }

  private registerControlValueChanges(b: Map<string, BindingInterface>) {
    for (const n in this._formGroup.controls) {
      const control = this._formGroup.get(n);
      if (!control) {
        continue;
      }

      const subscription = control.valueChanges
        .pipe(
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

            const inputs = this.requiredIfInputs ?? {};
            const computedInputs = this.computedInputs ?? {};
            const changedDependencies = Object.keys(inputs)
              .filter(
                (k) =>
                  // case the input previous hidden state not equals to it current hidden state
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

      this.subscriptions.push(subscription);
    }
  }

  private registerDependenciesChanges(
    deps: [string, ComputedInputValueConfigType][]
  ) {
    for (const dep of deps) {
      const [name, config] = dep;
      // case we are already tracking the dependency
      // we continue to the next iteration
      if (this.trackedDependencies?.includes(name)) {
        continue;
      }
      const control = pickAbstractControl(this._formGroup, name);
      if (!control) {
        // case the control cannot be found, we unsuscribe from any previous
        // subscription on the control
        config.cancel.next();

        // when we unsubscribe from the control, we make sure to remove
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

  private setFormState(f: FormConfigInterface, g?: FormGroup) {
    this._form = this._form ? { ...this._form, ...f } : f;
    if (g) {
      this._formGroup = g;
    }
    this._detectChanges$.next();
  }

  private updateComputedInputsDepedencies(
    changes: { name: string; value: boolean }[]
  ) {
    if (changes.length === 0) {
      return;
    }
    const changedInputs = this.requiredIfInputs ?? {};
    for (const change of changes) {
      const el = changedInputs[change.name] ?? {};
      changedInputs[change.name] = {
        previous: el.previous ?? change.value,
        current: change.value,
      };
    }
    this.requiredIfInputs = changedInputs;
  }

  private unsubscribe() {
    for (const subscription of this.subscriptions) {
      if (subscription) {
        subscription.unsubscribe();
      }
    }
    this.subscriptions = [];
  }
}
