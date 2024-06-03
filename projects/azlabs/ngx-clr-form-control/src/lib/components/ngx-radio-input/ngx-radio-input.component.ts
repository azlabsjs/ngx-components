import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  signal,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import {
  InputOptions,
  OptionsInputConfigInterface,
} from '@azlabsjs/smart-form-core';
import { NgxCommonModule } from '../../common';
import { OPTIONS_DIRECTIVES } from '@azlabsjs/ngx-options-input';

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
    value: OptionsInputConfigInterface
  ) {
    this.inputConfig.set(value);
    this.loaded.set((value?.options ?? []).length !== 0);
  }
  @Input() describe = true;
  // #endregion Component input properties
  @ContentChild('input') inputRef!: TemplateRef<any>;

  //#region Component outputs
  @Output() inputConfigChange = new EventEmitter<OptionsInputConfigInterface>();
  //#endregion Component outputs

  // #region Component states
  inputConfig = signal<OptionsInputConfigInterface | null>(null);
  loaded = signal<boolean>(false);
  // #endregion Component states

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
  }
}
