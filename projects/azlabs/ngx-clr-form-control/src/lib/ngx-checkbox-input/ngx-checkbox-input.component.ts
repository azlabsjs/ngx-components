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
import { IsCheckedPipe, PIPES } from './pipes';

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
  @Input() set config(value: OptionsInput) {
    this.setState((state) => ({
      ...state,
      config: value,
      loaded: (value?.options ?? []).length !== 0,
    }));
  }
  @ContentChild('input') inputRef!: TemplateRef<any>;
  //#endregion

  //#region component outputs
  @Output() inputConfigChange = new EventEmitter<OptionsInput>();
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
    const { config } = this._state;
    let _config = config ?? ({} as OptionsInput);
    _config = { ..._config, options };
    this.setState((state) => ({
      ...state,
      config: _config,
      loaded: true,
    }));
    this.inputConfigChange.emit(_config);
  }

  /**
   * handle checkbox click of selection change event
   */
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
}
