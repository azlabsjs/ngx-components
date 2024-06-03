import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  Output,
  ViewChild,
  signal,
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
  state = signal<{
    performingAction: boolean;
    inputConfig: OptionsInputConfigInterface | null;
    loaded: boolean;
  }>({
    performingAction: false,
    inputConfig: null,
    loaded: false,
  });
  private _handleFetchOnFocus: boolean = false;
  //#endregion Component properties

  @Input() control!: FormControl<any>;
  @Input() describe = true;
  @Input({ alias: 'inputConfig' }) set setInputConfig(
    inputConfig: OptionsInputConfigInterface
  ) {
    this.state.update((v) => ({
      ...v,
      inputConfig,
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
    this.state.update((v) => ({ ...v, loaded }));
  }

  onOptionsChange(options: InputOptions) {
    const { inputConfig } = this.state();
    let _inputConfig = inputConfig ?? ({} as OptionsInputConfigInterface);
    _inputConfig = {
      ..._inputConfig,
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
    this.state.update((v) => ({
      ...v,
      performingAction: false,
      inputConfig: _inputConfig,
    }));
  }

  onModelChange(value: any) {
    this.control.setValue(value);
    this.cdRef?.markForCheck();
  }

  onLoadingChange(value: boolean) {
    this.state.update((v) => ({ ...v, performingAction: value }));
  }
}
