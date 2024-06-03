import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
} from '@angular/forms';
import { OPTIONS_DIRECTIVES } from '@azlabsjs/ngx-options-input';
import {
  InputOptions,
  OptionsInputConfigInterface,
} from '@azlabsjs/smart-form-core';
import { Subject } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { NgxCommonModule } from '../../common';

function project(options: InputOptions, state: boolean[]) {
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

function compilevalue(options: InputOptions, state: unknown[]) {
  return options.map((option) => {
    return state.find((current) => current == option.value) ? true : false;
  });
}

@Component({
  standalone: true,
  imports: [NgxCommonModule, ...OPTIONS_DIRECTIVES],
  selector: 'ngx-checkbox-input',
  templateUrl: './ngx-checkbox-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxCheckBoxInputComponent implements OnInit, OnDestroy {
  //#region Component inputs
  @Input() control!: AbstractControl;
  @Input({ alias: 'inputConfig' }) set setInputConfig(
    value: OptionsInputConfigInterface
  ) {
    this.inputConfig.set(value);
    this.loaded.set((value?.options ?? []).length !== 0);
  }
  @Input() describe = true;
  @ContentChild('input') inputRef!: TemplateRef<any>;
  //#endregion Component inputs

  //#region Component outputs
  @Output() inputConfigChange = new EventEmitter<OptionsInputConfigInterface>();
  //#endregion Component outputs

  // #region Component properties
  formGroup = this.builder.group<{ [key: string]: AbstractControl<any> }>({});
  inputConfig = signal<OptionsInputConfigInterface | null>(null);
  loaded = signal<boolean>(false);
  private _destroy$ = new Subject<void>();
  // #endregion Component properties

  /** @description Creates a Checkbox input component  */
  constructor(
    private builder: FormBuilder,
    private changes: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const { options } = this.inputConfig() ?? { options: [] as InputOptions };
    if (options.length !== 0) {
      this.addFormArray();
    }
    this.control.valueChanges
      .pipe(
        distinctUntilChanged(),
        tap((state) => {
          const value = arraywrap_filter(state);
          if (options.length !== 0 && this.formGroup.get('options')) {
            (
              this.formGroup.get('options') as FormArray<AbstractControl<any>>
            ).setValue(compilevalue(options, value));
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  /** @description Options change event listener */
  onOptionsChange(options: InputOptions) {
    this.inputConfig.update((v) => ({
      ...(v ?? ({} as OptionsInputConfigInterface)),
      options,
    }));
    this.loaded.set(true);
    const inputConfig = this.inputConfig();
    if (inputConfig) {
      this.inputConfigChange.emit(inputConfig);
    }
    this.addFormArray();
  }

  /** @description Append a form array to the form group instance */
  private addFormArray() {
    const { options } = this.inputConfig() ?? { options: [] as InputOptions };
    const array = this.builder.array<AbstractControl>([]);
    // We get the value of the injected control
    // if the value is not an array we wrap it as array
    const value = arraywrap_filter(this.control.value);
    // We add controls to the form array element
    if (options.length !== 0) {
      for (const option of options) {
        array.push(new FormControl());
      }
      // Set the value of the form array
      array.setValue(compilevalue(options, value));
    }
    // Subscribe to changes on the form array
    array.valueChanges
      .pipe(
        distinctUntilChanged(),
        takeUntil(this._destroy$),
        map((state) => arraywrap_filter(project(options, state) ?? [])),
        filter(
          // Unless the value of the form array changes and is not equals
          // the value of the form control, we do not upte the form control value
          (state) => !arrayequals(state, arraywrap_filter(this.control.value))
        ),
        tap((state) => this.control.setValue(state))
      )
      .subscribe();

    // Replace the control with name `options`
    this.replaceOptionsControl(array);

    // Detect changes after adding the form array to the form group
    this.changes.markForCheck();
  }

  /**  @description replace the control with the options key index */
  private replaceOptionsControl(array: FormArray) {
    let c = this.formGroup.get('options');
    if (c) {
      this.formGroup.removeControl('options');
      c = null;
    }

    // Add options input after removing the previous if it exists
    this.formGroup.addControl('options', array);
  }
}
