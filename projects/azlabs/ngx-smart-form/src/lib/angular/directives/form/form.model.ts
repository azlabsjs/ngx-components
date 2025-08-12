import { Inject, Injectable, OnDestroy } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import {
  AngularReactiveFormBuilderBridge,
  Condition,
  ComputedInputValueConfigType,
} from '../../types';
import { FormConfigInterface } from '@azlabsjs/smart-form-core';
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
import { FormModelState } from './types';

/** @internal */
const memoizedComputeProperties = memoize(createComputableDepencies);
/** @internal */
const aggregations = useSupportedAggregations();
/** @internal */
type Tuple = [k: string | number, control: AbstractControl | null];

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
  private requiredConditions: Condition[] = [];
  private disabledConditions: Condition[] = [];
  //#endregion

  // form component model class constructor
  constructor(
    @Inject(ANGULAR_REACTIVE_FORM_BRIDGE)
    private builder: AngularReactiveFormBuilderBridge
  ) {}

  update(f: FormConfigInterface, formgroup?: FormGroup) {
    // each type form configuration changes, we set the list of computed properties
    const { controlConfigs: inputs } = f;
    const initialized = !formgroup;
    this.computedInputs = memoizedComputeProperties(inputs, aggregations);

    if (!formgroup) {
      const { builder } = this;
      formgroup = builder.group(f);
    }

    this.setFormState(f, formgroup);

    // we unregister from previous event each time we set the form value
    this.unsubscribe();

    const { controlConfigs: values } = this._form;
    this.requiredConditions = useCondition(
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
      (name) => this._detached.get(name) ?? null
    )(values ?? []);

    this.disabledConditions = useCondition(
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
      }
    )(values ?? []);

    // compute input values
    this.compute(Object.entries(this.computedInputs ?? {}));

    if (initialized && this.value) {
      this.setValue(this.value);
    }

    const items = flatteninputs(this._formGroup);
    this.addConditionHook(
      items,
      this.disabledConditions,
      (control, name, conditions) => {
        if (conditions.length !== 0) {
          const subscription = control.valueChanges
            .pipe(
              distinctUntilChanged(),
              tap((value) => {
                for (const item of conditions) {
                  item.dependencyChanged(this._formGroup, name, value);
                }
              })
            )
            .subscribe();

          this.subscriptions.push(subscription);
        }
      }
    );

    this.addConditionHook(
      items,
      this.requiredConditions,
      (control, name, conditions) => {
        if (conditions.length !== 0) {
          const subscription = control.valueChanges
            .pipe(
              distinctUntilChanged(),
              tap((value) =>
                this.onValueChange
                  .bind(this)
                  .call(null, name, value, conditions)
              )
            )
            .subscribe();

          this.subscriptions.push(subscription);
        }
      }
    );
  }

  setValue(value: { [k: string]: unknown }): void {
    // set or update the form value
    const { controlConfigs } = this._form;
    setFormValue(this.builder, this._formGroup, value, controlConfigs ?? []);
    const items = flatteninputs(this._formGroup);
    this.addConditions(items);
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

  private addConditions(items: [string, AbstractControl<any, any>][]) {
    this.addConditionHook(
      items,
      this.disabledConditions,
      (control, name, conditions) => {
        for (const item of conditions) {
          item.dependencyChanged(this._formGroup, name, control.value);
        }
      }
    );
    this.addConditionHook(
      items,
      this.requiredConditions,
      (control, name, conditions) => {
        this.onValueChange
          .bind(this)
          .call(null, name, control.value, conditions);
      }
    );
  }

  private addConditionHook(
    controls: [string, AbstractControl][],
    values: Condition[],
    callback: (
      control: AbstractControl,
      name: string,
      conditions: Condition[]
    ) => void
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

  private onValueChange(name: string, value: unknown, conditions: Condition[]) {
    const { _formGroup: fg } = this;
    for (const item of conditions) {
      const [visible, invisible] = item.dependencyChanged(fg, name, value);
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
        this.compute(computations);
      }
    }
  }

  private setFormState(f: FormConfigInterface, g: FormGroup) {
    this._formGroup = g;
    const form = this._form ? { ...this._form, ...f } : f;
    this._form = {
      ...form,
      controlConfigs: withRefetchObservable(
        form.controlConfigs,
        this._formGroup
      ),
    };
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
