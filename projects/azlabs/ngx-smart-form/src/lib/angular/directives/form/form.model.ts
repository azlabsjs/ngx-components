import { Inject, Injectable, OnDestroy } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import {
  AngularReactiveFormBuilderBridge,
  Condition,
  ComputedInputValueConfigType,
} from '../../types';
import {
  useCondition,
  ComponentReactiveFormHelpers,
  createComputableDepencies,
  pickcontrol,
  flatteninputs,
  setFormValue,
  useSupportedAggregations,
  withRefetchObservable,
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
import { FormConfigType, FormModelState } from './types';
import { InputConfigInterface, InputTypes } from '@azlabsjs/smart-form-core';

/** @internal */
const memoizedComputeProperties = memoize(createComputableDepencies);

/** @internal */
const aggregations = useSupportedAggregations();

@Injectable()
export class FormModel<T extends FormConfigType> implements OnDestroy {
  _detectChanges$ = new Subject<void>();
  readonly detectChanges$ = this._detectChanges$.asObservable();

  private computed: {[prop: string]: ComputedInputValueConfigType<any>; } | null = null;
  private trackedDependencies: string[] | null = [];
  private subscriptions: Subscription[] = [];
  private value!: { [k: string]: unknown };

  // obselete inputs
  // @internal
  private readonly _detached = new Map<string, AbstractControl>();
  private required: Condition[] = [];
  private disabled: Condition[] = [];
  private group!: FormGroup;
  private form!: T;
  get state(): Required<FormModelState<T>> {
    return { formGroup: this.group, detached: Array.from(this._detached.values()), form: this.form};
  }

  constructor(@Inject(ANGULAR_REACTIVE_FORM_BRIDGE) private builder: AngularReactiveFormBuilderBridge) { }

  update(config: T, formgroup?: FormGroup) {
    // each type form configuration changes, we set the list of computed properties
    const { controlConfigs: inputs } = config;
    const initialized = !formgroup;
    this.computed = memoizedComputeProperties(inputs, aggregations);

    if (!formgroup) {
      const { builder } = this;
      const { controlConfigs } = config;
      formgroup = builder.group(controlConfigs);
    }

    // we unregister from previous event each time we set the form value
    this.unsubscribe();

    this.setFormState(config, formgroup);

    const { controlConfigs: values } = this.form;
    this.required = useCondition(
      'requiredIf',

      // case condition evaluates to true, add the control to it parent
      (control, name, parent, path) => {
        if (parent && !parent.get(name) && control) {
          parent?.addControl(name, control);
        }

        // remove the control from the detached list of controls
        if (this._detached.has(path)) {
          this._detached.delete(path);
        }
      },

      // else remove the control from and add it to the list of detached controls
      (control, name, parent, path) => {
        if (parent && !!parent.get(name)) {
          parent?.removeControl(name);
        }

        if (!this._detached.has(path) && control) {
          this._detached.set(path, control);
        }
      },
      (name) => this._detached.get(name) ?? null,
    )(values ?? []);

    this.disabled = useCondition(
      'disabledIf',

      // case condition evaluates to true, we mark control as disabled
      (control, name) => {
        if (control instanceof FormArray) {
          for (let index = 0; index < control.length; index++) {
            const item = control.at(index);
            if (item) {
              item.disable({ onlySelf: true, emitEvent: true });
            }
          }
        } else {
          control.disable({ onlySelf: true, emitEvent: true });
        }
      },

      // else mark control as enabled
      (control) => {
        if (control instanceof FormArray) {
          for (let index = 0; index < control.length; index++) {
            const item = control.at(index);
            if (item) {
              item.enable({ onlySelf: true, emitEvent: true });
            }
          }
        } else {
          control.enable({ onlySelf: true, emitEvent: true });
        }
      },
    )(values ?? []);

    // compute input values
    this.compute(Object.entries(this.computed ?? {}));

    if (initialized && this.value) {
      this.setValue(this.value);
    }

    const items = flatteninputs(this.group);
    this.addConditionHook(items, this.disabled, (control, name, conditions) => {
      if (conditions.length !== 0) {
        const subscription = control.valueChanges
          .pipe(
            distinctUntilChanged(),
            tap((value) => {
              for (const item of conditions) {
                item.dependencyChanged(this.group, name, value);
              }
            }),
          )
          .subscribe();

        this.subscriptions.push(subscription);
      }
    });

    this.addConditionHook(items, this.required, (control, name, conditions) => {
      if (conditions.length !== 0) {
        const subscription = control.valueChanges
          .pipe(
            distinctUntilChanged(),
            tap((value) => {
              // swallow any error generated by calling the value change handler
              try {
                this.onValueChange.bind(this).call(null, name, value, conditions)
              } finally { }
            }),
          )
          .subscribe();

        this.subscriptions.push(subscription);
      }
    });
  }

  setValue(value: { [k: string]: unknown }): void {
    // set or update the form value
    const { controlConfigs } = this.form;
    setFormValue(this.builder, this.group, value, controlConfigs ?? []);
    const items = flatteninputs(this.group);
    this.addConditions(items);
  }

  getValue(): { [k: string]: unknown } {
    const { controlConfigs: inputs } = this.form;
    if (!this.group) {
      return {};
    }
    return this.scrubHtmlProperties(inputs, this.group.getRawValue());
  }

  statusChanges() {
    return this.group.statusChanges;
  }

  valueChanges() {
    return this.group.valueChanges;
  }

  isValid() {
    return this.group.valid;
  }

  validate() {
    ComponentReactiveFormHelpers.validateFormGroupFields(this.group);
  }

  reset() {
    this.group.reset();
    let { controlConfigs: inputs } = this.form;
    inputs ??= [];
    for (const control of inputs) {
      this.group.get(control.name)?.setValue(control.value);
    }
  }

  get(name?: string) {
    return name ? this.group.get(name) : this.group;
  }

  destroy() {
    this.unsubscribe();
  }

  // angular compatible destroy member function
  ngOnDestroy(): void {
    this.destroy();
  }

  private addConditions(items: [string, AbstractControl<any, any>][]) {
    this.addConditionHook(items, this.disabled, (control, name, conditions) => {
      for (const item of conditions) {
        item.dependencyChanged(this.group, name, control.value);
      }
    });
    this.addConditionHook(items, this.required, (control, name, conditions) => {
      this.onValueChange.bind(this).call(null, name, control.value, conditions);
    });
  }

  private addConditionHook(
    controls: [string, AbstractControl][],
    values: Condition[],
    callback: (
      control: AbstractControl,
      name: string,
      conditions: Condition[],
    ) => void,
  ) {
    for (const [name, control] of controls) {
      const conditions = values.filter((item) => item.match(name));
      if (conditions.length !== 0) {
        callback(control, name, conditions);
      }
    }
  }

  private compute(deps: [string, ComputedInputValueConfigType, ...any][]) {
    for (const dep of deps) {
      const [name, config] = dep;
      // case we are already tracking the dependency we continue to the next iteration
      if (this.trackedDependencies?.includes(name)) {
        continue;
      }
      const control = pickcontrol(this.group, name);
      if (!control) {
        this.cancelComputationSubscription(config, name);
        continue;
      }

      this.trackedDependencies?.push(name);

      control.valueChanges
        .pipe(
          tap((state) => {
            for (const value of config.values) {
              const input = pickcontrol(this.group, value.name);
              input?.setValue(value.fn(state));
            }
          }),
          takeUntil(config.cancel),
        )
        .subscribe();
    }
  }

  private onValueChange(name: string, value: unknown, conditions: Condition[]) {
    const { group: fg } = this;
    for (const item of conditions) {
      const [visible, invisible] = item.dependencyChanged(fg, name, value);
      // case a given input changes
      if (this.computed) {
        for (const [prop] of invisible) {
          for (const [key, config] of Object.entries(this.computed)) {
            // we add a startsWith to the equality check because
            // computed properties uses entire form array instead of each individual component
            if (key === prop || prop.startsWith(key)) {
              const dependency = pickcontrol(this.group, prop);
              for (const element of config.values) {
                pickcontrol(this.group, element.name)?.setValue(element.fn(dependency?.value));
              }
            }
          }
        }

        // For properties that are visible recomputed the dependant value and listen for changes
        const computations: [string, ComputedInputValueConfigType, AbstractControl | null][] = [];
        for (const [prop] of visible) {
          for (const [key, config] of Object.entries(this.computed)) {
            // we add a startsWith to the equality check because
            // computed properties uses entire form array instead of each individual component
            if (key === prop || prop.startsWith(key)) {
              const dependency = pickcontrol(this.group, prop);
              // cancel the ongoing listener
              this.cancelComputationSubscription(config, key);
              // push the config on top of the computations
              computations.push([key, config, dependency]);
            }
          }
        }

        for (const [_, config, dependency] of computations) {
          for (const element of config.values) {
            pickcontrol(this.group, element.name)?.setValue(element.fn(dependency?.value));
          }
        }
        this.compute(computations);
      }
    }
  }

  private setFormState(config: T, formgroup: FormGroup) {
    const form = this.form ? { ...this.form, ...config } : config;
    const { controlConfigs } = config;
    const inputs = withRefetchObservable(controlConfigs, formgroup);
    this.form = { ...form, controlConfigs: inputs };
    this.group = formgroup;
    this._detectChanges$.next();
  }

  private cancelComputationSubscription(
    config: ComputedInputValueConfigType,
    name: string,
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


  /**
  * Removes property values from a record if the corresponding Input config has type 'html'.
  * Mutates or cleans the record recursively through nested structures.
  */
  private scrubHtmlProperties(items: InputConfigInterface[], value: { [prop: string]: unknown }): { [prop: string]: unknown } {
    if (!value || typeof value !== 'object') {
      return value;
    }

    for (const item of items) {
      if (item.type === InputTypes.HTML_INPUT) {
        delete value[item.name];
      } else if ('children' in item && Array.isArray(item.children) && item.children.length > 0) {
        const nested = value[item.name];
        if (nested && typeof nested === 'object') {
          this.scrubHtmlProperties(item.children, nested as { [prop: string]: unknown });
        }
      }
    }
    return value;
  }
}
