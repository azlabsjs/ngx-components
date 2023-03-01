import {
  ChangeDetectorRef,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef
} from '@angular/core';
import '@azlabs-wc/dropdown/azl-dropdown.js';
import { IntlTelInput } from './core/intl-tel-input';
import { Country } from './core/model';

type SetStateParam<T> = Partial<T> | ((state: T) => T);

@Component({
  selector: 'ngx-intl-tel-input',
  templateUrl: './ngx-intl-tel-input.component.html',
  styles: [
    `
      .required-text,
      .field-has-error {
        color: rgb(241, 50, 50);
        line-height: 1rem;
      }

      small.field-has-error {
        display: block;
      }

      li.country:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }

      .intl-tel-input {
        display: flex;
        justify-content: flex-start;
        width: 100%;
      }

      span.dial-code {
        color: #bfbfbf;
      }

      .select-countries-view-port {
        width: auto;
        overflow-x: hidden;
      }

      .countries-viewport {
        height: 200px;
        width: auto;
        overflow-x: hidden;
      }

      :focus {
        outline: none;
      }
      .ngx-azl-dropdown-item {
        font-family: var(
          --intl-tel-input-font,
          Metropolis,
          'Avenir Next',
          'Helvetica Neue',
          Arial,
          sans-serif
        );
        font-size: 0.8rem;
        padding: .1rem 0.3rem;
        letter-spacing: normal;
        border: 0;
        cursor: pointer;
        display: block;
        height: auto;
        line-height: inherit;
        margin: 0;
        width: 100%;
        text-transform: none;
      }

      .ngx-azl-dropdown-item:hover {
        border-bottom: none;
        background-color: var(
          --intl-tel-input-item-bg-color,
          rgba(40, 39, 39, 0.1)
        );
      }

      .dropdown-divider {
        font-size: 0.6rem;
        border-bottom: 0.05rem solid;
        border-bottom-color: var(--dropdown-border-color, #e8e8e8);
        border-bottom-width: var(--dropdown-border-width, 0.05rem);
        margin: 0.3rem 0;
      }

      .dropdown-toggle {
        display: inline;
      }

      .intl-tel-input__layout {
        display: flex;
      }

      .intl-tel-input__text-input {
        flex: 100px 1;
      }

      .intl-tel-search-container {
        overflow-x: hidden;
      }
      .dropdown-divider.no-margin {
        margin: 0;
      }
    `,
  ],
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
  private _state = {
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
    let preferredCountries = this._state.preferredCountries;
    if ('preferredCountries' in changes) {
      stateChanges = true;
      preferredCountries = this.preferredCountries
        .map((iso2) => this._state.countries.find((c) => c.iso2 === iso2))
        .filter(
          (current) => typeof current !== 'undefined' && current !== null
        ) as Country[];
    }
    if ('country' in changes) {
      stateChanges = true;
    }
    if ('value' in changes) {
      stateChanges = true;
    }

    if ('disabled' in changes) {
      stateChanges = true;
    }
    if (stateChanges) {
      const selected =
        this._state.selected ??
        this.getSelectedCountry(this.value, preferredCountries, this.country);
      const countryCode = this.getCountryCode(this.value ?? '');
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
  public onCountrySelect(country: Country): void {
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

  setState(state: SetStateParam<typeof this._state>) {
    if (typeof state === 'function') {
      this._state = state(this._state);
    }
    this._state = { ...this._state, ...state };
    this.error.emit(
      this._state.value &&
        this._state.selected &&
        !this.service.isSafeValidPhoneNumber(this.getPhonenumber())
        ? true
        : false
    );
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
    const value = this.getPhonenumber();
    if (
      typeof this.value === 'undefined' ||
      this.value === null ||
      this.value !== value
    ) {
      this.valueChange.emit(value);
    }
  }

  private getSelectedCountry(
    value: string | undefined,
    preferredCountries: Country[],
    country: string
  ) {
    let selected!: Country | undefined;
    if (value && value !== '') {
      const tmpCode = this.getCountryCode(value);
      selected = tmpCode
        ? this._state.countries.find(
            (c: Country) => c.dialCode === tmpCode.toString()
          )
        : undefined;
    }
    if (selected) {
      return selected;
    }
    if (country) {
      selected = this._state.countries.find((c: Country) => {
        return c.iso2 === this.country;
      });
    }
    if (selected) {
      return selected;
    }
    return preferredCountries.length > 0
      ? preferredCountries[0]
      : this._state.countries[0];
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
