import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, Output, TemplateRef, signal as createSignal } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
import { distinctUntilChanged, Subscription, tap } from 'rxjs';
import { SHARED_DIRECTIVES, SHARED_PIPES } from '../common';
import { INTL_TEL_INPUT_DIRECTIVES } from '@azlabsjs/ngx-intl-tel-input';
import { CommonModule } from '@angular/common';

/** @internal */
type SetStateParam<T> = (state: T) => T;

/** @interal */
type StateType = {
  disabled: boolean;
  value?: string;
};

@Component({
  standalone: true,
  imports: [CommonModule, ...SHARED_PIPES, ...SHARED_DIRECTIVES, ...INTL_TEL_INPUT_DIRECTIVES],
  selector: 'ngx-phone-input',
  templateUrl: './ngx-phone-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxPhoneInputComponent implements AfterViewInit, OnDestroy {
  @Input() error!: TemplateRef<unknown>;
  @Input() input!: TemplateRef<any>;
  @Input() control!: AbstractControl;
  @Input() describe = true;
  @Input() config!: InputConfigInterface;
  @Input('class') cssClass!: string;
  @Input('countries') preferredCountries!: string[];
  @Input() set disabled(value: boolean) {
    this.signal.update(state => ({ ...state, disabled: value }));
  }

  @Output() focus = new EventEmitter<FocusEvent>();
  @Output() blur = new EventEmitter<FocusEvent>();

  protected signal = createSignal<StateType>({
    disabled: false,
    value: undefined as string | undefined,
  });

  private subscriptions: Subscription[] = [];

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
      this.control.valueChanges.pipe(distinctUntilChanged(), tap((value: string | undefined) => this.signal.update((state) => ({ ...state, value })))).subscribe(),
      this.control.statusChanges.pipe(tap((status) => { this.signal.update((state) => ({ ...state, disabled: status.toLowerCase() === 'disabled' })) })).subscribe()
    );

    this.signal.update((state) => ({ ...state, disabled: this.control.status.toLocaleLowerCase() === 'disabled', value: this.control.value }));
  }

  onError(_: boolean, value: unknown) {
    if (_ === true) {
      this.control.setErrors({ phone: value });
    }
  }

  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }
}
