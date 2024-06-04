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
import {
  InputOptions,
  OptionsInputConfigInterface,
} from '@azlabsjs/smart-form-core';
import { Subject } from 'rxjs';
import { distinctUntilChanged, tap } from 'rxjs/operators';
import { NgxCommonModule } from '../../common';
import { CheckboxComponent } from './checkbox.component';
import { IsCheckedPipe } from './is-checked.pipe';

/** @internal */
type SelectionState = { value: unknown; checked: boolean };

/** @internal */
type StateType = {
  loaded: boolean;
  config: OptionsInputConfigInterface;
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
    IsCheckedPipe,
  ],
  selector: 'ngx-checkbox-input',
  templateUrl: './ngx-checkbox-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxCheckBoxInputComponent implements OnInit, OnDestroy {
  //#region Component inputs
  @Input() disabled = false;
  @Input() describe = true;
  @Input() control!: AbstractControl;
  @Input({ alias: 'inputConfig' }) set setInputConfig(
    value: OptionsInputConfigInterface
  ) {
    this.setState((state) => ({
      ...state,
      config: value,
      loaded: (value?.options ?? []).length !== 0,
    }));
  }
  @ContentChild('input') inputRef!: TemplateRef<any>;
  //#endregion Component inputs

  //#region Component outputs
  @Output() inputConfigChange = new EventEmitter<OptionsInputConfigInterface>();
  @Output() onChange = new EventEmitter<unknown[]>();
  //#endregion Component outputs

  // #region Component properties
  // formGroup = this.builder.group<{ options?: FormArray<FormControl> }>({});
  private _state: StateType = {
    config: {} as OptionsInputConfigInterface,
    loaded: false,
    selection: [],
  };
  get state() {
    return this._state;
  }
  private _destroy$ = new Subject<void>();
  // #endregion Component properties

  /** @description Creates a Checkbox input component  */
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

  /** @description Options change event listener */
  onOptionsChange(options: InputOptions) {
    const { config } = this._state;
    let _config = config ?? ({} as OptionsInputConfigInterface);
    _config = { ..._config, options };
    this.setState((state) => ({
      ...state,
      config: _config,
      loaded: true,
    }));
    this.inputConfigChange.emit(_config);
  }

  /** @description Handle checkbox click of selection change event */
  onSelectionChange(e: SelectionState) {
    const { selection } = this._state;
    const _index = selection.findIndex((el) => el.value === e.value);
    const _selection = [...selection];
    if (_index !== -1) {
      _selection.splice(_index, 1);
    }
    _selection.push(e);

    // TODO: Update the control state with the selected values
    const values = _selection
      .filter((v) => v.checked === true)
      .map((v) => v.value);

    this.setState((state) => ({ ...state, selection: _selection }));

    // Notify top level component of an update
    this.onChange.emit(values);

    // TODO: Move setting control value to the top level component
    this.control.setValue(values);
  }

  private setState(state: (s: StateType) => StateType) {
    this._state = state(this._state);
    this.changes.markForCheck();
  }
}
