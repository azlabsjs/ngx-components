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
import { deepEqual } from '@azlabsjs/utilities';

/** @internal */
const memoizedComputeProperties = memoize(createComputableDepencies);

/** @internal */
const aggregations = useSupportedAggregations();

/** @internal */
type Hook = (control: AbstractControl, name: string, conditions: Condition[]) => void;

@Injectable()
export class FormModel<T extends FormConfigType> implements OnDestroy {
  _detectChanges$ = new Subject<void>();
  readonly detectChanges$ = this._detectChanges$.asObservable();

  private computed: { [prop: string]: ComputedInputValueConfigType<any>; } | null = null;
  private trackedList: { [prop: string]: unknown[] } = {};
  private _trackedControls = new WeakMap<AbstractControl, [string, ComputedInputValueConfigType, ...any[]]>();
  private subscriptions: Subscription[] = [];
  private value!: { [k: string]: unknown };

  // @internal
  private readonly _detached = new Map<string, AbstractControl>();
  private readonly _weakDetached = new WeakMap<AbstractControl>();

  private required: Condition[] = [];
  private disabled: Condition[] = [];
  private group!: FormGroup;
  private form!: T;
  get state(): Required<FormModelState<T>> {
    return { formGroup: this.group, detached: Array.from(this._detached.values()), form: this.form };
  }

  constructor(@Inject(ANGULAR_REACTIVE_FORM_BRIDGE) private builder: AngularReactiveFormBuilderBridge) { }

  update(config: T, formgroup?: FormGroup) {
    const { controlConfigs: inputs } = config;
    const initialized = !formgroup;
    this.computed = memoizedComputeProperties(inputs, aggregations);

    if (!formgroup) {
      const { builder } = this;
      const { controlConfigs } = config;
      formgroup = builder.group(controlConfigs);
    }

    this.unsubscribe();

    this.setFormState(config, formgroup);

    const { controlConfigs: values } = this.form;

    this.required = useCondition('requiredIf', (control, name, parent, path) => {
      if (parent && !parent.get(name) && control) {
        parent?.addControl(name, control);
      }

      this.attach(path, control);

    }, (control, name, parent, path) => {
      if (parent && !!parent.get(name)) {
        parent?.removeControl(name);
      }

      this.detach(path, control);

    }, (name) => this._detached.get(name) ?? null)(values ?? []);

    this.disabled = useCondition('disabledIf', (control, name) => {
      if (control instanceof FormArray) {
        for (let index = 0; index < control.length; index++) {
          const item = control.at(index);
          if (item) {
            item.disable({ emitEvent: true });
          }
        }
      } else {
        control.disable({ emitEvent: true });
      }
    }, (control) => {
      if (control instanceof FormArray) {
        for (let index = 0; index < control.length; index++) {
          const item = control.at(index);
          if (item) {
            item.enable({ emitEvent: true });
          }
        }
      } else {
        control.enable({ emitEvent: true });
      }
    })(values ?? []);

    this.trackComputedValues(Object.entries(this.computed ?? {}));

    if (initialized && this.value) {
      this.setValue(this.value);
    }

    this.addConditions(flatteninputs(this.group), (control, name, conditions) => {
      const subscription = control.valueChanges.pipe(
        distinctUntilChanged((previous, current) => deepEqual(previous, current)),
        tap((value) => {
          for (const item of conditions) {
            item.dependencyChanged(this.group, name, value);
          }
        }),
      ).subscribe();
      this.subscriptions.push(subscription);
    }, (control, name, conditions) => {
      const subscription = control.valueChanges.pipe(
        distinctUntilChanged((previous, current) => deepEqual(previous, current)),
        tap((value) => {
          for (const item of conditions) {
            item.dependencyChanged(this.group, name, value);
          }
        }),
      ).subscribe();
      this.subscriptions.push(subscription);
    });

  }

  setValue(value: { [k: string]: unknown }): void {
    const { controlConfigs } = this.form;
    setFormValue(this.builder, this.group, value, controlConfigs ?? []);

    this.addConditions(flatteninputs(this.group), (control, name, conditions) => {
      for (const item of conditions) {
        item.dependencyChanged(this.group, name, control.getRawValue());
      }
    }, (control, name, conditions) => {
      for (const item of conditions) {
        item.dependencyChanged(this.group, name, control.getRawValue());
      }
    });
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

  ngOnDestroy(): void {
    this.destroy();
  }

  private addConditions(items: [string, AbstractControl<any, any>][], disabledHook: Hook, requiredHook: Hook) {
    this.addConditionHook(items, this.disabled, disabledHook);
    this.addConditionHook(items, this.required, requiredHook);
  }

  private addConditionHook(controls: [string, AbstractControl][], values: Condition[], callback: (control: AbstractControl, name: string, conditions: Condition[]) => void) {
    if (values.length === 0) {
      return;
    }

    for (const [name, control] of controls) {
      const result = values.filter((item) => item.match(name));
      if (result.length !== 0) {
        callback(control, name, result);
      }
    }
  }

  private trackComputedValues(deps: [string, ComputedInputValueConfigType, ...any][]) {
    for (const dep of deps) {
      const [key, { name, type, cancel }] = dep;
      const control = pickcontrol(this.group, key);

      if (!control) {
        this.untrackChanges(cancel, key);
        continue;
      }


      if (!name) {
        this._trackedControls.set(control, dep);
      }

      if (type === 'list' && control instanceof FormArray && name && name !== '') {
        control.valueChanges.subscribe((value) => this.setComputedValueOnFormArrayChange(control, value, dep));
        continue;
      }

      if (type === 'group' && control instanceof FormGroup && name && name !== '') {
        const pickedControl = control.get(name)
        if (pickedControl) {
          pickedControl.valueChanges.pipe(distinctUntilChanged(), takeUntil(cancel)).subscribe(value => this.setComputedValueOnChange(pickedControl, value, dep));
        }
        continue;
      }

      control.valueChanges.pipe(takeUntil(cancel)).subscribe(value => this.setComputedValueOnChange(control, value, dep));
    }

  }

  private computeValues(dep: [string, ComputedInputValueConfigType, ...any]) {
    const [key, { name, type, cancel }] = dep;
    const control = pickcontrol(this.group, key);

    if (!control) {
      this.untrackChanges(cancel, key);
      return;
    }

    if (type === 'list' && control instanceof FormArray && name && name !== '') {
      this.setComputedValueOnFormArrayChange(control, control.getRawValue(), dep);
      return;
    }

    if (type === 'group' && control instanceof FormGroup && name && name !== '') {
      const pickedControl = control.get(name)
      if (pickedControl) {
        this.setComputedValueOnChange(pickedControl, pickedControl.getRawValue(), dep);
      }
      return;
    }

    this.setComputedValueOnChange(control, control.getRawValue(), dep);

  }

  private setComputedValueOnFormArrayChange(control: FormArray, value: unknown, dep: [string, ComputedInputValueConfigType, ...any]) {
    if (!Array.isArray(value)) {
      return;
    }

    const [key, { name, values }] = dep;

    if (!name) {
      return;
    }

    this.listItemChanges(control, key, value, name, (input) => {
      for (const item of values) {
        const args = [...item.params];
        const len = args.length;
        const inplace = item.inplace;
        const siblings: [number, string][] = [];

        for (const [pos, n] of inplace) {
          if (pos >= len) {
            continue;
          }

          if (item.path.startsWith(`${key}.`) && `${key}.*.${n}` === n) {
            // add input to the list of controls being tracked for computation
            if (input) {
              this._trackedControls.set(input, dep);
            }

            if (this.isDetached(input)) {
              args.splice(pos, 1)
            } else {
              args[pos] = input.getRawValue();
            }
            continue;
          }

          // push name to the siblings stack
          if (item.path.startsWith(`${key}.`) && n.startsWith(`${key}.*.`)) {
            siblings.push([pos, n.substring(`${key}.*.`.length)]);
            continue;
          }

          const index = n.indexOf('*');
          if (index !== -1) {
            const parentName = n.substring(0, index - 1);
            const index2 = item.path.indexOf('*');

            if (index2 !== -1 && item.path.substring(0, index2 - 1) === parentName) {
              siblings.push([pos, n.substring(index + 2)]);
              continue;
            }

            // read list values

            console.log('Calling readValues ...', n, item.path, Array.from(this._detached.keys()));
            args[pos] = this.readValues(this.group, n, index, (item) => this._trackedControls.set(item, dep));
            continue;
          }

          const pickedControl = pickcontrol(this.group, n);
          if (pickedControl) {
            this._trackedControls.set(pickedControl, dep);
          }

          if (pickedControl && this.isDetached(pickedControl)) {
            args.splice(pos, 1)
          } else {
            args[pos] = pickedControl?.getRawValue();
          }
        }

        this.setComputedValue(this.group, item.path, item.fn, args, siblings, (item) => this._trackedControls.set(item, dep));
      }
    });
  }

  private setComputedValueOnChange(control: AbstractControl, value: unknown, dep: [string, ComputedInputValueConfigType, ...any]) {
    const [key, { values }] = dep;

    for (const item of values) {
      const args = [...item.params];
      const len = args.length;
      const inplace = item.inplace;
      const siblings: [number, string][] = [];

      for (const [pos, n] of inplace) {
        if (pos >= len) {
          continue;
        }

        if (key === n) {

          if (control) { this._trackedControls.set(control, dep); }

          if (control && this.isDetached(control)) {
            args.splice(pos, 1)
          } else {
            args[pos] = value;
          }
          continue;
        }

        const index = n.indexOf('*');
        if (index !== -1) {
          const parentName = n.substring(0, index - 1);
          const index2 = item.path.indexOf('*');

          if (index2 !== -1 && item.path.substring(0, index2 - 1) === parentName) {
            siblings.push([pos, n.substring(index + 2)]);
            continue;
          }

          args[pos] = this.readValues(this.group, n, index, (item) => this._trackedControls.set(item, dep));
          continue;
        }

        const pickedControl = pickcontrol(this.group, n);
        if (pickedControl) { this._trackedControls.set(pickedControl, dep); }

        if (pickedControl && this.isDetached(pickedControl)) {
          args.splice(pos, 1)
        } else {
          args[pos] = pickedControl?.getRawValue();
        }
      }

      this.setComputedValue(this.group, item.path, item.fn, args, siblings, (item) => this._trackedControls.set(item, dep));
    }

  }

  private listItemChanges(control: FormArray, name: string, value: unknown[], key: string, callback: (input: AbstractControl) => void) {
    const previousValues = this.trackedList[name];
    this.trackedList[name] = value;

    for (let index = 0; index < control.length; index++) {
      const m = control.at(index);
      if (!(m instanceof FormGroup)) {
        continue;
      }

      const input = m.get(key);
      if (!input) {
        continue;
      }

      const previousVal: { [prop: string]: unknown } | null = previousValues && index < previousValues.length ? previousValues[index] as { [prop: string]: unknown } : null;
      const namePreviousVal = previousVal && typeof previousVal === 'object' && key in previousVal ? previousVal[key] : null;

      if (namePreviousVal !== input.value) {
        callback(input);
      }
    }
  }

  private readValues(model: FormGroup, name: string, index: number, trackDependency: (control: AbstractControl) => void) {
    const p1 = name.substring(0, index - 1);
    const p2 = name.substring(index + 2);
    const array = pickcontrol(model, p1);

    if (!array) {
      // TODO: throw error to fail computing value
      return;
    }

    if (!(array instanceof FormArray)) {
      // TODO: throw error to fail computing value
      return;
    }

    if (p2.trim() !== '') {
      const values = [];

      for (let i = 0; i < array.length; i++) {
        const x = array.at(i);

        if (!(x instanceof FormGroup)) {
          // TODO: throw error to fail computing value
          continue;
        }

        const y = x.get(p2);
        if (y) {
          trackDependency(y);

          if (!this.isDetached(y)) {
            console.log('child control is not detached...', `${p1}.${i}.${p2}`);
            values.push(y.getRawValue());
          } else {
            console.log('child control is detached...', `${p1}.${i}.${p2}`);
          }
        }
        // TODO: throw error to fail computing value
      }

      console.log('returning...', values);
      return values;

    }
    return array.getRawValue();
  }

  private setComputedValue(model: AbstractControl, key: string, fn: (...args: unknown[]) => unknown, args: unknown[], inplace: [number, string][], trackDependency: (control: AbstractControl) => void) {



    const index = key.indexOf('*');
    if (index !== -1) {
      const name = key.substring(0, index - 1);
      const array = pickcontrol(model, name);

      if (!(array instanceof FormArray)) {
        return;
      }

      const path = key.substring(index + 2);
      if (path.trim() !== '') {
        for (let index = 0; index < array.length; index++) {
          const current = array.at(index);

          if (!(current instanceof FormGroup)) {
            // TODO: throw error to fail computing value
            continue;
          }

          // query and replace the input siblings values
          for (const [pos, n] of inplace) {
            const pickedControl = current.get(n);
            if (pickedControl) { trackDependency(pickedControl); }

            if (pickedControl && this.isDetached(pickedControl)) {
              args.splice(pos, 1)
            } else {
              args[pos] = pickedControl?.getRawValue();
            }
          }

          current.get(path)?.setValue(fn(...args));
        }
        return;
      }


      array.setValue(fn(...args) as unknown[]);

      return;
    }

    const pickedControl = pickcontrol(model, key);
    if (pickedControl) { trackDependency(pickedControl); }
    pickedControl?.setValue(fn(...args) as unknown[]);
  }

  private detach(path: string, model: AbstractControl) {
    if (!this._weakDetached.has(model)) {
      this._weakDetached.delete(model);
    }

    if (!this._detached.has(path) && model) {
      this._detached.set(path, model);

      if (this._trackedControls.has(model)) {
        const dep = this._trackedControls.get(model);
        if (dep) {
          this.computeValues(dep);
        }
      }
    }
  }

  private attach(path: string, model: AbstractControl) {
    console.log('attaching...', path);
    this._detached.delete(path);
    this._weakDetached.delete(model);

    if (this._trackedControls.has(model)) {
      const dep = this._trackedControls.get(model);
      if (dep) {
        this.computeValues(dep);
      }
    }
  }

  private isDetached(model: AbstractControl) {
    return this._weakDetached.has(model);
  }

  private setFormState(config: T, formgroup: FormGroup) {
    const form = this.form ? { ...this.form, ...config } : config;
    const { controlConfigs } = config;
    const inputs = withRefetchObservable(controlConfigs, formgroup);
    this.form = { ...form, controlConfigs: inputs };
    this.group = formgroup;
    this._detectChanges$.next();
  }

  private untrackChanges(cancel: ComputedInputValueConfigType['cancel'], name: string) {
    cancel.next();
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
  * removes property values from a record if the corresponding Input config has type 'html'.
  * mutates or cleans the record recursively through nested structures.
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
