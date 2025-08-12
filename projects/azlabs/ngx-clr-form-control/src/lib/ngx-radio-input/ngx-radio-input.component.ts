import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { InputOptions, OptionsInput } from '@azlabsjs/smart-form-core';
import { NgxCommonModule } from '../common';
import { OPTIONS_DIRECTIVES } from '@azlabsjs/ngx-options-input';

/** @interal */
type StateType = {
  config: OptionsInput | null;
  loaded: boolean;
};

@Component({
  standalone: true,
  imports: [NgxCommonModule, ...OPTIONS_DIRECTIVES],
  selector: 'ngx-radio-input',
  templateUrl: './ngx-radio-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxRadioInputComponent {
  // #region component input properties
  @Input() control!: AbstractControl;
  @Input() set config(config: OptionsInput) {
    this.setState((state) => ({
      ...state,
      config,
      loaded: (config?.options ?? []).length !== 0,
    }));
  }
  @Input() describe = true;
  // #endregion
  @ContentChild('input') inputRef!: TemplateRef<any>;

  //#region component outputs
  @Output() configChange = new EventEmitter<OptionsInput>();
  //#endregion

  // #region component properties
  private _state: StateType = {
    config: null,
    loaded: false,
  };

  get state() {
    return this._state;
  }
  // #endregion

  /** @description radion input component class constructor */
  constructor(private cdRef: ChangeDetectorRef) {}

  onOptionsChange(options: InputOptions) {
    const { config } = this._state;
    let _config = config ?? ({} as OptionsInput);
    _config = { ..._config, options };
    this.setState((state) => ({
      ...state,
      config: _config,
      loaded: true,
    }));
    this.configChange.emit(_config);
  }

  setState(state: (state: StateType) => StateType) {
    this._state = state(this._state);
    this.cdRef?.markForCheck();
  }
}
