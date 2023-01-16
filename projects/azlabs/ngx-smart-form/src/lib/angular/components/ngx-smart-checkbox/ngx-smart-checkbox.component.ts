import {
  ChangeDetectorRef,
  Component,
  ContentChild,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef
} from '@angular/core';
import {
  AbstractControl,
  FormArray, UntypedFormArray, UntypedFormBuilder,
  UntypedFormControl
} from '@angular/forms';
import {
  InputOptionsInterface,
  OptionsInputConfigInterface
} from '@azlabsjs/smart-form-core';
import { Subject } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  takeUntil,
  tap
} from 'rxjs/operators';

function project(options: InputOptionsInterface, state: boolean[]) {
  options = options ?? [];
  if (options.length === 0) {
    return undefined;
  }
  if (options.length === 1) {
    return state[0];
  }
  return state
    .map((current, index) =>
      current === false
        ? undefined
        : options[index]
        ? options[index].value
        : undefined
    )
    .filter((current) => typeof current !== 'undefined' && current !== null);
}

/**
 * Wrap a value to an array and filter remove null or undefined entrries
 *
 * @param value
 */
function arraywrap_filter(value: unknown) {
  return (Array.isArray(value) ? value : [value]).filter(
    (current) => typeof current !== 'undefined' && current !== null
  );
}

function arrayequals(array_1: any[], array_2: any[]): boolean {
  if (array_1.length !== array_2.length) {
    return false;
  }
  let equals: boolean = true;
  for (let index = 0; index < array_1.length; index++) {
    equals =
      Array.isArray(array_1[index]) && Array.isArray(array_2[index])
        ? arrayequals(array_1[index], array_2[index])
        : array_1[index] === array_2[index];
    if (equals === false) {
      break;
    }
  }
  return equals;
}

function compilevalue(options: InputOptionsInterface, state: unknown[]) {
  return options.map((option) => {
    return state.find((current) => current == option.value) ? true : false;
  });
}

@Component({
  selector: 'ngx-smart-checkbox-input',
  templateUrl: './ngx-smart-checkbox.component.html',
})
export class NgxSmartCheckBoxComponent implements OnInit, OnDestroy {
  //#region Component inputs
  @Input() control!: AbstractControl;
  @Input() inputConfig!: OptionsInputConfigInterface;
  @Input() describe = true;
  @ContentChild('input') inputRef!: TemplateRef<any>;
  //#endregion Component inputs

  // #region Component properties
  formgroup = this.builder.group({});
  options!: InputOptionsInterface;
  loaded: boolean = false;
  private _destroy$ = new Subject<void>();
  // #endregion Component properties

  /**
   * Creates a Checkbox input component
   *
   * @param builder
   * @param changes
   */
  constructor(
    private builder: UntypedFormBuilder,
    private changes: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.options = this.inputConfig.options ?? [];
    this.loaded = this.options.length !== 0;
    if (this.options.length !== 0) {
      this.addFormArray();
    }
    this.control.valueChanges
      .pipe(
        distinctUntilChanged(),
        tap((state) => {
          const value = arraywrap_filter(state);
          if (this.options.length !== 0 && this.formgroup.get('options')) {
            (this.formgroup.get('options') as FormArray).setValue(
              compilevalue(this.options, value)
            );
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  /**
   * Options change event listener
   */
  onOptionsChange(state: InputOptionsInterface) {
    this.inputConfig = { ...this.inputConfig, options: state };
    this.options = this.inputConfig.options ?? [];
    this.loaded = true;
    this.addFormArray();
  }

  /**
   * Append a form array to the form group instance
   */
  private addFormArray() {
    const array = new UntypedFormArray([]);
    // We get the value of the injected control
    // if the value is not an array we wrap it as array
    const value = arraywrap_filter(this.control.value);
    // We add controls to the form array element
    if (this.options.length !== 0) {
      for (const option of this.options) {
        array.push(new UntypedFormControl());
      }
      // Set the value of the form array
      array.setValue(compilevalue(this.options, value));
    }
    // Subscribe to changes on the form array
    array.valueChanges
      .pipe(
        distinctUntilChanged(),
        map((state) => arraywrap_filter(project(this.options, state) ?? [])),
        filter(
          // Unless the value of the form array changes and is not equals
          // the value of the form control, we do not upte the form control value
          (state) => !arrayequals(state, arraywrap_filter(this.control.value))
        ),
        tap((state) => this.control.setValue(state)),
        takeUntil(this._destroy$)
      )
      .subscribe();
    this.replaceoptioncontrol(array);
    // Detect changes after adding the form array to the form group
    this.changes.markForCheck();
  }

  /**
   * Replace the control with the options key index
   */
  private replaceoptioncontrol(array: FormArray) {
    let _array = this.formgroup.get('options');
    if (_array) {
      this.formgroup.removeControl('options');
      _array = null;
    }
    this.formgroup.addControl('options', array);
  }
}
