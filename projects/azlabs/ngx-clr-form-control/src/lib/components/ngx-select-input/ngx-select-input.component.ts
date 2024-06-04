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
import { InputEventArgs } from '../../types';
import {
  FetchOptionsDirective,
  OPTIONS_DIRECTIVES,
} from '@azlabsjs/ngx-options-input';
import { NgxCommonModule } from '../../common';
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
  //#region Component properties
  _state: StateType = {
    performingAction: false,
    config: null,
    loaded: false,
  };
  get state() {
    return this._state;
  }
  private _handleFetchOnFocus: boolean = false;
  //#endregion Component properties

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

  //#region Component outputs
  @Output() remove = new EventEmitter<any>();
  @Output() selected = new EventEmitter<InputEventArgs>();
  //#endregion Component outputs

  @ViewChild('optionsRef', { static: false })
  options!: FetchOptionsDirective;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private cdRef: ChangeDetectorRef
  ) {
    const { defaultView } = this.document;
    this._handleFetchOnFocus = !(
      defaultView !== null &&
      'IntersectionObserver' in defaultView &&
      'IntersectionObserverEntry' in defaultView &&
      'intersectionRatio' in defaultView.IntersectionObserverEntry.prototype
    );
  }

  onFocus(): void {
    if (this._handleFetchOnFocus) {
      this.options?.query();
    }
  }

  onLoadedChange(loaded: boolean) {
    this.setState((v) => ({ ...v, loaded }));
  }

  onOptionsChange(options: InputOptions) {
    const { config } = this._state;
    let _c = config ?? ({} as OptionsInputConfigInterface);
    _c = {
      ..._c,
      options: options.map((state) => ({
        ...state,
        // We convert the select values to uppercase
        // for UI consistency
        name: state?.name?.toUpperCase(),
        description: state.description?.toUpperCase(),
      })),
    };
    // const value = this._state$.getValue();
    // this._state$.next({ ...value, state: this._inputConfig.options ?? [] });
    this.setState((state) => ({
      ...state,
      performingAction: false,
      config: _c,
    }));
  }

  onModelChange(value: any) {
    this.control.setValue(value);
    this.cdRef?.markForCheck();
  }

  onLoadingChange(value: boolean) {
    this.setState((v) => ({ ...v, performingAction: value }));
  }

  setState(state: (state: StateType) => StateType) {
    this._state = state(this._state);
    this.cdRef?.markForCheck();
    // TODO: Uncomment the code below to use latest API instead
    // this.setState(state);
  }
}
