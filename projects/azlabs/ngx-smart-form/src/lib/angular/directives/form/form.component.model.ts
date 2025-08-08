import { Inject, Injectable, OnDestroy } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
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
  pickcontrol,
  setFormValue,
  useSupportedAggregations,
} from '../../helpers';
import { memoize } from '@azlabsjs/functional';
import {
  distinctUntilChanged,
  Subject,
  Subscription,
  takeUntil,
  tap,
} from 'rxjs';
import { ANGULAR_REACTIVE_FORM_BRIDGE } from '../../tokens';
import { FormModelState } from './types';

/** @internal */
const memoizedComputeProperties = memoize(createComputableDepencies);

/** @internal */
const aggregations = useSupportedAggregations();

/** @internal */
type Tuple = [k: string | number, control: AbstractControl | null];

function querymutableinputs(inputs: Tuple[]) {
  const names: [string, AbstractControl][] = [];
  function resolve(items: Tuple[], root: string = '') {
    for (const [n, control] of items) {
      if (!control) {
        continue;
      }

      if (control instanceof FormGroup) {
        const controls = Object.keys(control.controls).map((k) => [
          k,
          control.get(k),
        ]) as [string, AbstractControl][];

        resolve(controls, root.trim() !== '' ? `${root}.${n}` : String(n));
        continue;
      }

      const name = root.trim() !== '' ? `${root}.${n}` : String(n);
      names.push([name, control]);
    }
  }

  resolve(inputs);

  return names;
}

@Injectable()
export class FormModel implements OnDestroy {
  _detectChanges$ = new Subject<void>();
  readonly detectChanges$ = this._detectChanges$.asObservable();

  //#region local properties
  private computedInputs: {
    [prop: string]: ComputedInputValueConfigType<any>;
  } | null = null;
  private trackedDependencies: string[] | null = [];
  private subscriptions: Subscription[] = [];
  private value!: { [k: string]: unknown };

  // obselete inputs
  private readonly _detached = new Map<string, AbstractControl>();
  // @internal
  private _formGroup!: FormGroup;
  private _form!: FormConfigInterface;
  get state(): FormModelState {
    return {
      formGroup: this._formGroup,
      detached: Array.from(this._detached.values()),
      form: this._form,
    };
  }
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
      const { builder, value } = this;
      formgroup = builder.group(f);
      // we only initialy set the form state to initialize component when we create
      // a new form group instance because, the next time this function is called
      // `form` and `formGroup` will have initial values
      this.setFormState(f, formgroup);

      // in case state property of the current component is defined, we set the value of the
      if (value) {
        this.setValue(value);
      }
    }

    // we unregister from previous event each time we set the form value
    this.unsubscribe();

    const { controlConfigs: values } = this._form;
    const factory = bindingsFactory(values ?? []);
    const b = factory(this._formGroup);

    this.registerDependenciesChanges(Object.entries(this.computedInputs ?? {}));

    // register controls value changes and update ui based on requiredIf configuration on form inputs
    const controls: [string, AbstractControl | null][] = Object.keys(
      this._formGroup.controls
    ).map((k) => [k, this._formGroup.get(k)]);

    // add a dependency hook which execute input bindings on controls
    this.addDependencyHook(controls, b, (control, name, bindings) => {
      this.onValueChange.bind(this).call(null, name, control.value, bindings);
    });

    // add a dependency hook which listen for control value changes and set bindings
    this.addDependencyHook(controls, b, (control, name, bindings) => {
      if (bindings.length !== 0) {
        const subscription = control.valueChanges
          .pipe(
            distinctUntilChanged(),
            tap((value) =>
              this.onValueChange.bind(this).call(null, name, value, bindings)
            )
          )
          .subscribe();

        this.subscriptions.push(subscription);
      }
    });
  }

  setValue(value: { [k: string]: unknown }): void {
    // set or update the form value
    const { controlConfigs } = this._form;
    setFormValue(this.builder, this._formGroup, value, controlConfigs ?? []);
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
    let { controlConfigs: inputs } = this._form;
    inputs ??= [];
    for (const control of inputs) {
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

  private addDependencyHook(
    controls: Tuple[],
    b: Map<string, BindingInterface>,
    callback: (
      control: AbstractControl,
      name: string,
      bindings: BindingInterface[]
    ) => void
  ) {
    for (const [name, control] of querymutableinputs(controls)) {
      const bindings: BindingInterface[] = [];
      for (const item of b.values()) {
        if (!item.binding) {
          continue;
        }

        if (!item.isdependency(name)) {
          continue;
        }

        bindings.push(item);
      }

      if (bindings.length !== 0) {
        callback(control, name, bindings);
      }
    }
  }

  private registerDependenciesChanges(
    deps: [string, ComputedInputValueConfigType, ...any][]
  ) {
    for (const dep of deps) {
      const [name, config] = dep;
      // case we are already tracking the dependency we continue to the next iteration
      if (this.trackedDependencies?.includes(name)) {
        continue;
      }
      const control = pickcontrol(this._formGroup, name);
      if (!control) {
        this.cancelComputationSubscription(config, name);
        continue;
      }

      this.trackedDependencies?.push(name);

      control.valueChanges
        .pipe(
          tap((state) => {
            for (const value of config.values) {
              const input = pickcontrol(this._formGroup, value.name);
              input?.setValue(value.fn(state));
            }
          }),
          takeUntil(config.cancel)
        )
        .subscribe();
    }
  }

  private onValueChange(
    name: string,
    value: unknown,
    bindings: BindingInterface[]
  ) {
    const { _formGroup: fg } = this;
    for (const item of bindings) {
      const [visible, invisible] = item.dependencyChanged(
        this._detached,
        fg,
        name,
        value
      );
      // case a given input changes
      if (this.computedInputs) {
        for (const [prop] of invisible) {
          for (const [key, config] of Object.entries(this.computedInputs)) {
            // we add a startsWith to the equality check because
            // computed properties uses entire form array instead of each individual component
            if (key === prop || prop.startsWith(key)) {
              const dependency = pickcontrol(this._formGroup, prop);
              for (const element of config.values) {
                pickcontrol(this._formGroup, element.name)?.setValue(
                  element.fn(dependency?.value)
                );
              }
            }
          }
        }

        // For properties that are visible recomputed the dependant value and listen for changes
        const computations: [
          string,
          ComputedInputValueConfigType,
          AbstractControl | null
        ][] = [];
        for (const [prop] of visible) {
          for (const [key, config] of Object.entries(this.computedInputs)) {
            // we add a startsWith to the equality check because
            // computed properties uses entire form array instead of each individual component
            if (key === prop || prop.startsWith(key)) {
              const dependency = pickcontrol(this._formGroup, prop);
              // cancel the ongoing listener
              this.cancelComputationSubscription(config, key);
              // push the config on top of the computations
              computations.push([key, config, dependency]);
            }
          }
        }

        for (const [_, config, dependency] of computations) {
          for (const element of config.values) {
            pickcontrol(this._formGroup, element.name)?.setValue(
              element.fn(dependency?.value)
            );
          }
        }
        this.registerDependenciesChanges(computations);
      }
    }
  }

  private setFormState(f: FormConfigInterface, g?: FormGroup) {
    this._form = this._form ? { ...this._form, ...f } : f;
    if (g) {
      this._formGroup = g;
    }
    this._detectChanges$.next();
  }

  private cancelComputationSubscription(
    config: ComputedInputValueConfigType,
    name: string
  ) {
    // case the control cannot be found, we unsuscribe from any previous subscription on the control
    config.cancel.next();

    // after we unsubscribe from the control, we make sure to remove dependency the dependency subscription tracker
    if (this.trackedDependencies) {
      const index = this.trackedDependencies.indexOf(name);
      this.trackedDependencies.splice(index, 1);
    }
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
