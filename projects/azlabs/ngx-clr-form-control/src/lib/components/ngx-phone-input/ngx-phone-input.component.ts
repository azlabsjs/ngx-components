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
  signal,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
import { distinctUntilChanged, Subscription, tap } from 'rxjs';
import { NgxCommonModule } from '../../common';
import { INTL_TEL_INPUT_DIRECTIVES } from '@azlabsjs/ngx-intl-tel-input';

/** @internal */
type SetStateParam<T> = (state: T) => T;

/** @interal */
type StateType = {
  disabled: boolean;
  value?: string;
};

@Component({
  standalone: true,
  imports: [NgxCommonModule, ...INTL_TEL_INPUT_DIRECTIVES],
  selector: 'ngx-phone-input',
  templateUrl: './ngx-phone-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxPhoneInputComponent implements AfterViewInit, OnDestroy {
  //#region Component inputs
  @Input() control!: AbstractControl;
  @Input() describe = true;
  @Input('inputConfig') config!: InputConfigInterface;
  @Input('class') cssClass!: string;
  @Input('countries') preferredCountries!: string[];
  @ContentChild('input') inputRef!: TemplateRef<any>;
  //#endregion Component inputs

  //#region Component event emitter
  @Output() focus = new EventEmitter<FocusEvent>();
  @Output() blur = new EventEmitter<FocusEvent>();
  //#endregion Component event emitter

  // #region Component state
  state = signal<StateType>({
    disabled: false,
    value: undefined as string | undefined,
  });
  // #endregion Component state

  //#region Class properties
  private subscriptions: Subscription[] = [];
  //#endregion Class properties


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

      // Listen for control value changes to update component `value` state
      this.control.valueChanges
        .pipe(
          distinctUntilChanged(),
          tap((value: string | undefined) =>
            this.setState((state) => ({ ...state, value }))
          )
        )
        .subscribe(),

      // Listen for control status changes to update component `disabled` state
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

    // Set the current state based on the control value
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
    this.state.update(state);
  }

  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }
}
