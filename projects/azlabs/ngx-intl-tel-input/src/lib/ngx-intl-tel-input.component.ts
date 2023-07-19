import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { IntlTelInput, Country } from './core';

type SetStateParam<T> = Partial<T> | ((state: T) => T);

type StateType = {
  disabled: boolean;
  required: boolean;
  value?: string;
  countries: Country[];
  preferredCountries: Country[];
  selected?: Country;
};

@Component({
  selector: 'ngx-intl-tel-input',
  templateUrl: './ngx-intl-tel-input.component.html',
  styleUrls: ['./ngx-intl-tel-input.component.css'],
  providers: [IntlTelInput],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgxIntlTelInputComponent implements OnChanges {
  // #region Component Inputs
  @Input() required = false;
  @Input() country!: string;
  @Input() class!: string;
  @Input() preferredCountries: string[] = [];
  @Input() index!: number;
  @Input() value!: string;
  @Input() disabled: boolean = false;
  // #endregion Component Inputs

  // #region Child content selectors
  @ContentChild('input') inputTemplateRef!: TemplateRef<any>;
  // #endregion Child content selectors

  // #region Component outputs
  @Output() valueChange = new EventEmitter<string>();
  @Output() error = new EventEmitter<boolean>();
  @Output() focus = new EventEmitter<FocusEvent>();
  @Output() blur = new EventEmitter<FocusEvent>();
  // #endregion Component outputs

  private _countries = this.service.fetchCountries() ?? [];
  private _state: StateType = {
    disabled: false,
    required: false,
    value: undefined as string | undefined,
    countries: [...this._countries],
    preferredCountries: ['tg', 'bj', 'gh']
      .map((iso2) => this._countries.find((c) => c.iso2 === iso2))
      .filter(
        (current) => typeof current !== 'undefined' && current !== null
      ) as Country[],
    selected: undefined as Country | undefined,
  };
  get state() {
    return this._state;
  }

  constructor(
    private service: IntlTelInput,
    private changeRef: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    let stateChanges = false;
    if ('preferredCountries' in changes) {
      stateChanges = true;
    }
    if ('country' in changes || 'value' in changes || 'disabled' in changes) {
      stateChanges = true;
    }

    // Case the state changes
    if (stateChanges) {
      let selected = this.value
        ? this.getValueSelectedCountry(this.value)
        : undefined;
      if (!selected) {
        selected = this._state.selected;
      }

      if (!selected) {
        selected =
          this._state.preferredCountries.length !== 0
            ? this._state.preferredCountries[0]
            : this._state.countries[0];
      }

      // get country code from value property
      const countryCode = this.getCountryCode(this.value ?? '');

      // set the current component state
      this.setState((state) => ({
        ...state,
        value:
          typeof countryCode !== 'undefined' && countryCode !== null
            ? this.value.substring(countryCode.toString().length)
            : this._state.value,
        disabled: this.disabled,
        required: this.required,
        selected,
      }));
    }
  }

  //
  onCountrySelect(country: Country): void {
    this.setState((state) => ({ ...state, selected: country }));
    this.dispatchValueChange();
    // Dispatch a selectionChange event
  }

  //
  onKeyPress(event: any): void {
    const pattern = /[0-9\+\-\ ]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  onBlur(event: FocusEvent) {
    this.blur.emit(event);
  }

  onFocus(event: FocusEvent) {
    this.focus.emit(event);
  }

  onInputChange(event?: Event) {
    this.setState((state) => ({
      ...state,
      value: (event?.target as HTMLInputElement).value.trim(),
    }));
    this.dispatchValueChange();
    event?.stopPropagation();
  }

  setState(state: SetStateParam<StateType>) {
    this._state =
      typeof state === 'function'
        ? state(this._state)
        : { ...this._state, ...state };

    if (this._state.selected?.iso2) {
      this.error.emit(
        this._state.value &&
          this._state.selected &&
          !this.service.isSafeValidPhoneNumber(
            this.getPhonenumber(),
            this._state.selected.iso2
          )
          ? true
          : false
      );
    }
    this.changeRef.markForCheck();
  }

  onSearchChange(event: string) {
    const preferredCountries = [] as Country[];
    if (event.trim() === '') {
      return this.setState((state) => ({
        ...state,
        countries: this._countries,
        preferredCountries: this.preferredCountries
          .map((iso2) => this._countries.find((c) => c.iso2 === iso2))
          .filter(
            (current) => typeof current !== 'undefined' && current !== null
          ) as Country[],
      }));
    }
    const countries = this._countries.filter((state) => {
      return (
        true ===
        new RegExp(`${event}`, 'g').test(`${state.dialCode} ${state.name}`)
      );
    });
    return this.setState((state) => ({
      ...state,
      countries,
      preferredCountries,
    }));
  }

  private dispatchValueChange() {
    if (!!!this._state.selected || !!!this._state.value) {
      this.valueChange.emit(undefined);
      return;
    }
    const value = this.getPhonenumber();
    if (this.value !== value) {
      this.valueChange.emit(value);
    }
  }

  private getValueSelectedCountry(value: string) {
    const tmpCode = this.getCountryCode(value);
    return tmpCode
      ? this._state.countries.find(
          (c: Country) => c.dialCode === tmpCode.toString()
        )
      : undefined;
  }

  private getPhonenumber() {
    return `${this._state.selected?.dialCode ?? ''}${
      this._state.value?.replace(/[\s\t\/\+\-]/g, '') ?? ''
    }`;
  }

  private getCountryCode(value: string) {
    return this.service.getCountryCode(value);
  }
}
