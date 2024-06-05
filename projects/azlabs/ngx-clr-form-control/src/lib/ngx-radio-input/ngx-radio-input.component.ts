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
import {
  InputOptions,
  OptionsInputConfigInterface,
} from '@azlabsjs/smart-form-core';
import { NgxCommonModule } from '../common';
import { OPTIONS_DIRECTIVES } from '@azlabsjs/ngx-options-input';

/** @interal */
type StateType = {
  config: OptionsInputConfigInterface | null;
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
  // #region Component input properties
  // tslint:disable-next-line: variable-name
  @Input() control!: AbstractControl;
  // tslint:disable-next-line: variable-name
  @Input({ alias: 'inputConfig' }) set setInputConfig(
    config: OptionsInputConfigInterface
  ) {
    this.setState((state) => ({
      ...state,
      config,
      loaded: (config?.options ?? []).length !== 0,
    }));
  }
  @Input() describe = true;
  // #endregion Component input properties
  @ContentChild('input') inputRef!: TemplateRef<any>;

  //#region Component outputs
  @Output() inputConfigChange = new EventEmitter<OptionsInputConfigInterface>();
  //#endregion Component outputs

  // #region Component states
  private _state: StateType = {
    config: null,
    loaded: false,
  };

  get state() {
    return this._state;
  }
  // #endregion Component states

  /** @description radion input component class constructor */
  constructor(private cdRef: ChangeDetectorRef) {}

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

  setState(state: (state: StateType) => StateType) {
    this._state = state(this._state);
    this.cdRef?.markForCheck();
    // TODO: Uncomment the code below to use latest API instead
    // this.state.update(state);
  }
}
