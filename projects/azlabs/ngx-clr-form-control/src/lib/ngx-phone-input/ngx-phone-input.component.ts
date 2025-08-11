import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  TemplateRef,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
import { distinctUntilChanged, Subscription, tap } from 'rxjs';
import { NgxCommonModule } from '../common';
import { INTL_TEL_INPUT_DIRECTIVES } from '@azlabsjs/ngx-intl-tel-input';
import { PIPES } from '../pipes';

/** @internal */
type SetStateParam<T> = (state: T) => T;

/** @interal */
type StateType = {
  disabled: boolean;
  value?: string;
};

@Component({
  standalone: true,
  imports: [NgxCommonModule, ...INTL_TEL_INPUT_DIRECTIVES, ...PIPES],
  selector: 'ngx-phone-input',
  templateUrl: './ngx-phone-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxPhoneInputComponent implements AfterViewInit, OnDestroy {
  //#region component inputs
  @Input() control!: AbstractControl;
  @Input() describe = true;
  @Input('inputConfig') config!: InputConfigInterface;
  @Input('class') cssClass!: string;
  @Input('countries') preferredCountries!: string[];
  @ContentChild('input') inputRef!: TemplateRef<any>;
  //#endregion

  //#region component event emitter
  @Output() focus = new EventEmitter<FocusEvent>();
  @Output() blur = new EventEmitter<FocusEvent>();
  //#endregion

  // #region component state
  _state: StateType = {
    disabled: false,
    value: undefined as string | undefined,
  };
  get state() {
    return this._state;
  }
  // #endregion

  //#region class properties
  private subscriptions: Subscription[] = [];
  //#endregion

  /** @description phone input component class constructor */
  constructor(private cdRef: ChangeDetectorRef) {}

  onBlur(event: FocusEvent) {
    this.control?.markAsTouched();
    this.blur.emit(event);
  }

  onFocus(event: FocusEvent) {
    this.control?.markAsTouched();
    this.focus.emit(event);
  }

  ngAfterViewInit(): void {
    this.subscriptions.push(
      this.control.valueChanges
        .pipe(
          distinctUntilChanged(),
          tap((value: string | undefined) =>
            this.setState((state) => ({ ...state, value }))
          )
        )
        .subscribe(),

      this.control.statusChanges
        .pipe(
          tap((status) => {
            this.setState((state) => ({
              ...state,
              disabled: status.toLowerCase() === 'disabled',
            }));
          })
        )
        .subscribe()
    );

    // set the current state based on the control value
    this.setState((state) => ({
      ...state,
      disabled: this.control.status.toLocaleLowerCase() === 'disabled',
      value: this.control.value,
    }));
  }

  onError(_: boolean, value: unknown) {
    if (_ === true) {
      this.control.setErrors({ phone: value });
    }
  }

  setState(state: SetStateParam<StateType>) {
    this._state = state(this._state);
    this.cdRef?.markForCheck();
  }

  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }
}
