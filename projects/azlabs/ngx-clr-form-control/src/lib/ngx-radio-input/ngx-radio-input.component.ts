import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, TemplateRef, signal as createSignal } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { InputOptions, OptionsInput } from '@azlabsjs/smart-form-core';
import { SHARED_DIRECTIVES, SHARED_PIPES } from '../common';
import { OPTIONS_DIRECTIVES } from '@azlabsjs/ngx-options-input';

/** @interal */
type StateType = {
  config: OptionsInput | null;
  loaded: boolean;
};

@Component({
  standalone: true,
  imports: [...SHARED_DIRECTIVES, ...OPTIONS_DIRECTIVES, ...SHARED_PIPES],
  selector: 'ngx-radio-input',
  templateUrl: './ngx-radio-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxRadioInputComponent {
  @Input() control!: AbstractControl;
  @Input() set config(config: OptionsInput) {
    if (!config) {
      return;
    }

    let { options } = config;
    this.autoSelect(config);

    options = options ?? [];
    this.signal.update((state) => ({ ...state, config, loaded: options.length !== 0 }));
  }
  @Input() describe = true;
  @Input() input!: TemplateRef<any>;

  @Output() configChange = new EventEmitter<OptionsInput>();

  protected signal = createSignal<StateType>({
    config: null,
    loaded: false,
  });


  onOptionsChange(options: InputOptions) {
    let { config } = this.signal();
    if (!config) {
      return;
    }

    config = { ...config, options };
    this.autoSelect(config);

    this.signal.update((state) => ({ ...state, config: config, loaded: true }));
    this.configChange.emit(config);
  }


  private autoSelect(config: OptionsInput) {
    const { autoselect, options: items } = config;
    if (autoselect && items.length === 1) {
      this.control.setValue(items[0].value);
    }
  }
}
