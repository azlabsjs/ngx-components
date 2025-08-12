import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  Input,
  TemplateRef,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { TextInput } from '@azlabsjs/smart-form-core';
import { NgxCommonModule } from '../common';

/** @internal */
type StateType = {
  showPassword: boolean;
};

@Component({
  standalone: true,
  imports: [NgxCommonModule],
  selector: 'ngx-password-input',
  templateUrl: './ngx-password-input.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxPasswordInputComponent {
  @Input() control!: AbstractControl;
  @Input() describe = true;
  @Input() config!: TextInput;
  @ContentChild('input') inputRef!: TemplateRef<any>;

  // tslint:disable-next-line: variable-name
  Mt = Math;
  _state: StateType = {
    showPassword: false,
  };
  get state() {
    return this._state;
  }

  public toggle() {
    this.setState(({ showPassword }) => ({
      showPassword: !showPassword,
    }));
  }

  constructor(private cdRef: ChangeDetectorRef) {}

  /** update component state and notify ui of state changes */
  private setState(state: (s: StateType) => StateType) {
    this._state = state(this._state);
    this.cdRef?.markForCheck();
  }
}
