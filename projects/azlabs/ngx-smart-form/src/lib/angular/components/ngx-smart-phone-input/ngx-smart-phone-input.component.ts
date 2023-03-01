import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef
} from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
import { distinctUntilChanged, filter, Subject, takeUntil, tap } from 'rxjs';

type SetStateParam<T> = Partial<T> | ((state: T) => T);

@Component({
  selector: 'ngx-smart-phone-input',
  templateUrl: './ngx-smart-phone-input.component.html',
  styles: [],
})
export class PhoneInputComponent implements AfterViewInit {
  //#region Component inputs
  @Input() control!: AbstractControl & FormControl;
  @Input() describe = true;
  @Input('inputConfig') config!: InputConfigInterface;
  @ContentChild('input') inputRef!: TemplateRef<any>;
  //#endregion Component inputs

  //#region Component event emitter
  @Output() focus = new EventEmitter<FocusEvent>();
  @Output() blur = new EventEmitter<FocusEvent>();
  //#endregion Component event emitter

  // #region Component state
  private _state = {
    disabled: false,
    value: undefined as string | undefined,
  };
  get state() {
    return this._state;
  }
  private _destroy$ = new Subject<void>();
  // #endregion Component state

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
    this.control.valueChanges
      .pipe(
        distinctUntilChanged(),
        filter((state) => typeof state !== 'undefined' && state !== null),
        tap((value: string) => this.setState((state) => ({ ...state, value }))),
        takeUntil(this._destroy$)
      )
      .subscribe();
    this.control.statusChanges
      .pipe(
        tap((status) => {
          this.setState((state) => ({
            ...state,
            disabled: status.toLowerCase() === 'disabled',
          }));
        }),
        takeUntil(this._destroy$)
      )
      .subscribe();
  }

  onError(value: boolean) {
    this.control.setErrors({ invalidPhoneNumber: value });
  }

  setState(state: SetStateParam<typeof this._state>) {
    if (typeof state === 'function') {
      this._state = state(this._state);
    }
    this._state = { ...this._state, ...state };
    this.changeRef.markForCheck();
  }
}
