import {
  Component,
  Input,
  Output,
  EventEmitter,
  Inject,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { InputEventArgs } from '../../types/input';
import {
  OptionsInputConfigInterface,
  InputOptionsInterface,
} from '@azlabsjs/smart-form-core';
import { BehaviorSubject, Subject } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { FetchOptionsDirective } from '../../directives';

@Component({
  selector: 'ngx-smart-select-input',
  templateUrl: './ngx-smart-select-input.component.html',
  styles: [
    `
      .ng-select,
      :host ::ng-deep .ng-select {
        display: block;
        max-width: 100% !important;
        width: 100%;
        border-bottom-color: var(--clr-forms-border-color, #b3b3b3);
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
export class NgxSmartSelectInputComponent implements AfterViewInit {
  //
  @Input() control!: FormControl;
  @Input() describe = true;
  // tslint:disable-next-line: variable-name
  _state$ = new BehaviorSubject<{
    performingAction: boolean;
    state: any[];
    loaded: boolean;
  }>({
    performingAction: false,
    state: [],
    loaded: false,
  });
  state$ = this._state$.asObservable();

  // tslint:disable-next-line: variable-name
  private _inputConfig!: OptionsInputConfigInterface;
  @Input() set inputConfig(value: OptionsInputConfigInterface) {
    this._inputConfig = value as OptionsInputConfigInterface;
  }
  // tslint:disable-next-line: typedef
  get inputConfig() {
    return this._inputConfig;
  }
  @Output() remove = new EventEmitter<any>();
  @Output() selected = new EventEmitter<InputEventArgs>();

  // tslint:disable-next-line: variable-name
  _controlFocusEvent$ = new Subject<{ state: any[] }>();

  private _handleFetchOnFocus: boolean = false;

  @ViewChild('prefetchOptionsDirective', { static: false })
  prefetchOptionsDirective!: FetchOptionsDirective;

  constructor(@Inject(DOCUMENT) private document: Document) {
    const { defaultView } = this.document;
    this._handleFetchOnFocus = !(
      defaultView !== null &&
      'IntersectionObserver' in defaultView &&
      'IntersectionObserverEntry' in defaultView &&
      'intersectionRatio' in defaultView.IntersectionObserverEntry.prototype
    );
  }
  ngAfterViewInit(): void {
    if (this._inputConfig) {
      const values = this._inputConfig.options;
      this._state$.next({
        ...this._state$.getValue(),
        state: values,
        loaded: values.length !== 0,
      });
    }
  }

  onFocus(): void {
    if (this.prefetchOptionsDirective && this._handleFetchOnFocus) {
      this.prefetchOptionsDirective.executeQuery();
    }
  }

  onLoadedChange(loaded: boolean) {
    const value = this._state$.getValue();
    this._state$.next({ ...value, loaded });
  }

  onOptionsChange(options: InputOptionsInterface) {
    this._inputConfig = {
      ...this._inputConfig,
      options: options.map((state) => ({
        ...state,
        // We convert the select values to uppercase
        // for UI consistency
        name: state?.name.toUpperCase(),
        description: state.description?.toUpperCase(),
      })),
    };
    const value = this._state$.getValue();
    this._state$.next({ ...value, state: this._inputConfig.options ?? [] });
  }

  onLoadingChange(value: boolean) {
    const state = this._state$.getValue();
    this._state$.next({ ...state, performingAction: value ?? false });
  }
}
