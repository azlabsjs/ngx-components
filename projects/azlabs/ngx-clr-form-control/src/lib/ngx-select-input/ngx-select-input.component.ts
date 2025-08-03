import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import {
  InputOptions,
  OptionsInputConfigInterface,
} from '@azlabsjs/smart-form-core';
import { InputEventArgs } from '../types';
import {
  FetchOptionsDirective,
  OPTIONS_DIRECTIVES,
} from '@azlabsjs/ngx-options-input';
import { NgxCommonModule } from '../common';
import { NgSelectModule } from '@ng-select/ng-select';

/** @internal */
type StateType = {
  performingAction: boolean;
  config: OptionsInputConfigInterface | null;
  loaded: boolean;
};

@Component({
  standalone: true,
  imports: [
    NgxCommonModule,
    FormsModule,
    ...OPTIONS_DIRECTIVES,
    NgSelectModule,
  ],
  selector: 'ngx-select-input',
  templateUrl: './ngx-select-input.component.html',
  styles: [
    `
      .ng-select,
      :host ::ng-deep .ng-select {
        display: block;
        max-width: 100% !important;
        width: 100%;
      }
      .ng-select.flat {
        border-radius: 0 !important;
      }
      .ng-select.flat .ng-select-container {
        border-radius: 0 !important;
      }
      :host ::ng-deep .ng-select .ng-select-container,
      :host ::ng-deep .ng-select.ng-select-single .ng-select-container {
        min-height: 26px;
      }
      :host ::ng-deep .ng-select.ng-select-single .ng-select-container {
        height: 26px;
      }
    `,
  ],
})
export class NgxSelectInputComponent {
  //#region component properties
  _state: StateType = {
    performingAction: false,
    config: null,
    loaded: false,
  };
  get state() {
    return this._state;
  }
  private fetchOnFocus: boolean = false;
  //#endregion

  //#region component inputs
  @Input() control!: FormControl<any>;
  @Input() describe = true;
  @Input({ alias: 'inputConfig' }) set setInputConfig(
    inputConfig: OptionsInputConfigInterface
  ) {
    this.setState((state) => ({
      ...state,
      config: inputConfig,
      loaded: (inputConfig.options ?? [])?.length !== 0,
    }));
  }
  @Input({ alias: 'loading-text' }) loadingText!: string;
  //#endregion

  //#region component outputs
  @Output() remove = new EventEmitter<any>();
  @Output() selected = new EventEmitter<InputEventArgs>();
  //#endregion

  @ViewChild('optionsRef', { static: false })
  options!: FetchOptionsDirective;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private cdRef: ChangeDetectorRef
  ) {
    const { defaultView } = this.document;
    this.fetchOnFocus = !(
      defaultView !== null &&
      'IntersectionObserver' in defaultView &&
      'IntersectionObserverEntry' in defaultView &&
      'intersectionRatio' in defaultView.IntersectionObserverEntry.prototype
    );
  }

  onFocus(): void {
    if (this.fetchOnFocus) {
      this.options?.query();
    }
  }

  loadedChange(loaded: boolean) {
    this.setState((v) => ({ ...v, loaded }));
  }

  optionsChange(options: InputOptions) {
    const { config } = this._state;
    let _c = config ?? ({} as OptionsInputConfigInterface);
    _c = {
      ..._c,
      options: options.map((state) => ({
        ...state,
        name: state?.name?.toUpperCase(),
        description: state.description?.toUpperCase(),
      })),
    };
    this.setState((state) => ({
      ...state,
      performingAction: false,
      config: _c,
    }));
  }

  modelChange(value: any) {
    this.control.setValue(value);
    this.cdRef?.markForCheck();
  }

  loadingChange(value: boolean) {
    this.setState((v) => ({ ...v, performingAction: value }));
  }

  setState(state: (state: StateType) => StateType) {
    this._state = state(this._state);
    this.cdRef?.markForCheck();
  }

  removed(e: unknown, config: OptionsInputConfigInterface) {
    this.remove.emit({ name: config.name, event: e });
  }

  select(e: unknown, config: OptionsInputConfigInterface) {
    this.selected.emit({ name: config.name, value: e });
  }
}
