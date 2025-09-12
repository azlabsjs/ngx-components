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
} from '@angular/core';
import {
  AbstractControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { OPTIONS_DIRECTIVES } from '@azlabsjs/ngx-options-input';
import { InputOptions, OptionsInput } from '@azlabsjs/smart-form-core';
import { Subject } from 'rxjs';
import { distinctUntilChanged, tap } from 'rxjs/operators';
import { NgxCommonModule } from '../common';
import { CheckboxComponent } from './checkbox.component';
import { PIPES } from './pipes';

/** @internal */
type SelectionState = { value: unknown; checked: boolean };

/** @internal */
type StateType = {
  loaded: boolean;
  config: OptionsInput;
  selection: SelectionState[];
};

@Component({
  standalone: true,
  imports: [
    NgxCommonModule,
    ...OPTIONS_DIRECTIVES,
    ReactiveFormsModule,
    FormsModule,
    CheckboxComponent,
    ...PIPES,
  ],
  selector: 'ngx-checkbox-input',
  templateUrl: './ngx-checkbox-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxCheckBoxInputComponent implements OnInit, OnDestroy {
  //#region component inputs
  @Input() disabled = false;
  @Input() describe = true;
  @Input() control!: AbstractControl;
  @Input() set config(config: OptionsInput) {
    if (!config) {
      return;
    }

    let { options } = config;
    this.autoSelect(config);
  
    options = options ?? [];
    this.setState((state) => ({
      ...state,
      config,
      loaded: options.length !== 0,
    }));
  }
  @ContentChild('input') inputRef!: TemplateRef<any>;
  //#endregion

  //#region component outputs
  @Output() configChange = new EventEmitter<OptionsInput>();
  @Output() change = new EventEmitter<unknown[]>();
  //#endregion

  // #region component properties
  private _state: StateType = {
    config: {} as OptionsInput,
    loaded: false,
    selection: [],
  };
  get state() {
    return this._state;
  }
  private _destroy$ = new Subject<void>();
  // #endregion

  /** create an instance of ngx checkbox input component  */
  constructor(private changes: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.control.valueChanges
      .pipe(
        distinctUntilChanged(),
        tap((v) => {
          this.setState((state) => ({
            ...state,
            selection: v.map((i: unknown) => ({ value: i, checked: true })),
          }));
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  /**
   * options change event listener
   */
  onOptionsChange(options: InputOptions) {
    let { config } = this._state;
    if (!config) {
      return;
    }

    config = { ...config, options };
    this.autoSelect(config);

    this.setState((state) => ({
      ...state,
      config: config,
      loaded: true,
    }));
    this.configChange.emit(config);
  }

  /** handle checkbox click of selection change event */
  onChange(e: SelectionState) {
    const { selection } = this._state;
    const _index = selection.findIndex((el) => el.value === e.value);
    const items = [...selection];
    if (_index !== -1) {
      items.splice(_index, 1);
    }

    items.push(e);
    const values = items.filter((v) => v.checked === true).map((v) => v.value);
    this.setState((state) => ({ ...state, selection: items }));
    this.change.emit(values);
    this.control.setValue(values);
  }

  private setState(state: (s: StateType) => StateType) {
    this._state = state(this._state);
    this.changes.markForCheck();
  }

  private autoSelect(config: OptionsInput) {
    const { autoselect, options: items } = config;
    if (autoselect && items.length === 1) {
      this.control.setValue(items[0].value);
    }
  }
}
