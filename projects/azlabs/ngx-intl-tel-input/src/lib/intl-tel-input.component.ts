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
  signal,
} from '@angular/core';
import { IntlTelInput, Country } from './core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DROPDOWN_DIRECTIVES } from '@azlabsjs/ngx-dropdown';

/** Set state parameter type definition */
type SetStateParam<T> = (state: T) => T;

/** @internal Component state type declaration */
type StateType = {
  disabled: boolean;
  required: boolean;
  value?: string;
  countries: Country[];
  preferredCountries: Country[];
  selected?: Country;
};

@Component({
  standalone: true,
  imports: [CommonModule, ScrollingModule, ...DROPDOWN_DIRECTIVES],
  selector: 'ngx-intl-tel-input',
  templateUrl: './intl-tel-input.component.html',
  styleUrls: ['./intl-tel-input.component.scss'],
  providers: [IntlTelInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxIntlTelInputComponent implements OnChanges {
  // #region Component Inputs
  @Input() required = false;
  @Input() country!: string;
  @Input() class!: string;
  @Input() preferredCountries!: string[];
  @Input() index!: number;
  @Input() value!: string;
  @Input() disabled = false;
  @Input() name!: string;
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
  state = signal<StateType>({
    disabled: false,
    required: false,
    value: undefined as string | undefined,
    countries: [...this._countries],
    preferredCountries: this.getPreferredCountries(),
    selected: undefined as Country | undefined,
  });

  constructor(private service: IntlTelInput) {}

  ngOnChanges(changes: SimpleChanges) {
    let stateChanges = false;
    if ('preferredCountries' in changes) {
      stateChanges = true;
    }
    if ('country' in changes || 'value' in changes || 'disabled' in changes) {
      stateChanges = true;
    }

    // Case the state changes
    const {
      selected: _selected,
      preferredCountries,
      countries,
      value,
    } = this.state();
    if (stateChanges) {
      let selected = this.value
        ? this.getValueSelectedCountry(this.value)
        : undefined;
      if (!selected) {
        selected = _selected;
      }

      if (!selected) {
        selected =
          preferredCountries.length !== 0
            ? preferredCountries[0]
            : countries[0];
      }

      // get country code from value property
      const countryCode = this.getCountryCode(this.value ?? '');

      // set the current component state
      this.setState((state) => ({
        ...state,
        value:
          typeof countryCode !== 'undefined' && countryCode !== null
            ? this.value.substring(countryCode.toString().length)
            : value,
        disabled: this.disabled,
        required: this.required,
        preferredCountries: this.getPreferredCountries(),
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
    this.state.update(state);
    const { selected, value } = this.state();

    if (selected?.iso2) {
      this.error.emit(
        value &&
          selected &&
          !this.service.isSafeValidPhoneNumber(
            this.getPhonenumber(selected, value),
            selected.iso2
          )
          ? true
          : false
      );
    }
  }

  onSearchChange(event: string) {
    const preferredCountries = [] as Country[];
    if (event.trim() === '') {
      return this.setState((state) => ({
        ...state,
        countries: this._countries,
        preferredCountries: this.getPreferredCountries(),
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
    const { selected, value: _value } = this.state();
    if (!!!selected || !!!_value) {
      this.valueChange.emit(undefined);
      return;
    }
    const value = this.getPhonenumber(selected, _value);
    if (this.value !== value) {
      this.valueChange.emit(value);
    }
  }

  private getValueSelectedCountry(value: string) {
    const { countries } = this.state();
    const tmpCode = this.getCountryCode(value);
    return tmpCode
      ? countries.find((c: Country) => c.dialCode === tmpCode.toString())
      : undefined;
  }

  private getPhonenumber(
    selected: Country | undefined,
    value: string | undefined
  ) {
    return `${selected?.dialCode ?? ''}${
      value?.replace(/[\s\t\/\+\-]/g, '') ?? ''
    }`;
  }

  private getCountryCode(value: string) {
    return this.service.getCountryCode(value);
  }

  /**
   * Returns the list of preferred countries
   */
  private getPreferredCountries(
    callback?: (v: string[]) => Country[]
  ): Country[] {
    const values =
      this.preferredCountries ??
      this.service
        .fetchPreferredCountries()
        .filter((v) => typeof v !== 'undefined' && v !== null) ??
      [];
    callback =
      callback ??
      ((v) => {
        return v
          .map((iso2) => this._countries.find((c) => c.iso2 === iso2))
          .filter(
            (current) => typeof current !== 'undefined' && current !== null
          ) as Country[];
      });
    return callback(values);
  }
}
