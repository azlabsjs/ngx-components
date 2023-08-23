import {
  AfterViewInit,
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

type SetStateParam<T> = Partial<T> | ((state: T) => T);

type StateType = {
  disabled: boolean;
  value?: string;
};

@Component({
  selector: 'ngx-phone-input',
  templateUrl: './ngx-phone-input.component.html',
  styles: [],
})
export class NgxPhoneInputComponent implements AfterViewInit, OnDestroy {
  //#region Component inputs
  @Input() control!: AbstractControl;
  @Input() describe = true;
  @Input('inputConfig') config!: InputConfigInterface;
  @Input('class') cssClass!: string;
  @ContentChild('input') inputRef!: TemplateRef<any>;
  //#endregion Component inputs

  //#region Component event emitter
  @Output() focus = new EventEmitter<FocusEvent>();
  @Output() blur = new EventEmitter<FocusEvent>();
  //#endregion Component event emitter

  // #region Component state
  private _state: StateType = {
    disabled: false,
    value: undefined as string | undefined,
  };
  get state() {
    return this._state;
  }
  // #endregion Component state

  //#region Class properties
  private subscriptions: Subscription[] = [];
  //#endregion Class properties

  /**
   * Creates component instance
   *
   */
  constructor(private changeRef: ChangeDetectorRef) {}

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
    this._state =
      typeof state === 'function'
        ? state(this._state)
        : { ...this._state, ...state };
    this.changeRef.markForCheck();
  }

  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }
}
