import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ContentChild,
  TemplateRef,
} from '@angular/core';
import { Country } from './core/model';
import { IntlTelInput } from './core/intl-tel-input';
import { FormControl, Validators, ValidatorFn } from '@angular/forms';
import {
  takeUntil,
  tap,
  distinctUntilChanged,
  startWith,
} from 'rxjs/operators';
import { BehaviorSubject, merge, Subject } from 'rxjs';
import { PhoneNumberValidator } from './core/validators';
import { JSObject } from '@azlabsjs/js-object';

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

      .intl-tel-input button.btn {
        background: var(--light-clouds);
        border: none;
      }

      span.dial-code {
        color: #bfbfbf;
      }

      .countries-viewport {
        height: 200px;
        width: auto;
        overflow-x: hidden;
      }

      :focus {
        outline: none;
      }
      .ngx-dropdown-item {
        font-family: var(
          --clr-font,
          Metropolis,
          'Avenir Next',
          'Helvetica Neue',
          Arial,
          sans-serif
        );
        font-size: 0.8rem;
        padding: 0.3rem 0;
        letter-spacing: normal;
        background: #0000;
        border: 0;
        cursor: pointer;
        display: block;
        height: auto;
        line-height: inherit;
        margin: 0;
        width: 100%;
        text-transform: none;
      }

      .ngx-dropdown-item:hover {
        border-bottom: none;
      }

      .dropdown-divider {
        font-size: 0.6rem;
        border-bottom: 0.05rem solid #e8e8e8;
        border-bottom-color: var(--clr-dropdown-divider-color, #e8e8e8);
        border-bottom-width: var(--clr-dropdown-divider-border-width, 0.05rem);
        margin: 0.3rem 0;
      }

      .dropdown-toggle {
        display: inline;
      }
    `,
  ],
})
export class NgxIntlTelInputComponent implements OnInit, OnDestroy {
  //
  public phoneControl!: FormControl;
  @Input() control!: FormControl;
  @Input() required = false;
  @Input() allowDropdown = true;
  @Input() country!: string;
  @Input() class!: string;
  @Input() preferredCountries: string[] = ['tg', 'bj', 'gh'];
  @ViewChild('phoneControlElement', { static: false })
  phoneControlElement!: ElementRef;
  @ContentChild('input') inputTemplateRef!: TemplateRef<any>;
  @Input() index!: number;
  @Input() label!: string;

  //
  allCountries: Country[] = [];
  preferredCountriesInDropDown: Country[] = [];
  selected: Country = {} as Country;

  //
  private _destroy$ = new Subject<void>();

  @Input() set disabled(value: boolean) {
    this._disableState$.next({ disabled: value || false });
  }
  private _disableState$ = new BehaviorSubject({ disabled: false });
  disableState$ = this._disableState$.pipe(
    startWith({ disabled: false }),
    tap((state) => {
      if (
        state.disabled &&
        this.phoneControl.status.toLowerCase() !== 'disabled'
      ) {
        this.phoneControl.disable({ onlySelf: true });
      }
      if (
        !state.disabled &&
        this.phoneControl.status.toLowerCase() === 'disabled'
      ) {
        this.phoneControl.enable({ onlySelf: true });
      }
    })
  );

  //
  public wrapperClass = 'intl-tel-input allow-dropdown input-effect';
  @ContentChild('toggleButton') toggleButtonRef!: TemplateRef<any>;

  constructor(private service: IntlTelInput) {
    this.allCountries = this.service.fetchCountries() ?? [];
  }

  ngOnInit() {
    if (typeof this.control === 'undefined' || this.control === null) {
      this.control = new FormControl();
    }
    for (const iso2 of this.preferredCountries) {
      const prefered = this.allCountries.find((c) => c.iso2 === iso2);
      if (prefered) {
        this.preferredCountriesInDropDown.push(prefered);
      }
    }
    const disabled = this.control!.status.toLowerCase() === 'disabled';
    this._initializePhoneNumberControl(disabled);
    if (this.control!.status.toLowerCase() === 'disabled') {
      this._disableState$.next({ disabled: true });
    }
    // Set the preferred countries
    merge(
      this.subscribeToControlChanges(),
      this.subscribeToPhoneControlChanges()
    ).subscribe();
  }

  private subscribeToPhoneControlChanges() {
    return this.phoneControl.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntil(this._destroy$),
      tap((state) => {
        if (JSObject.isEmpty(state)) {
          this.control!.setErrors({ invalidPhoneNumber: null });
          this.control!.setValue(null);
        }
        if (state) {
          this.setControlValue(this.selected.dialCode, state);
        }
      })
    );
  }

  private subscribeToControlChanges() {
    return this.control!.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntil(this._destroy$),
      tap((state) => {
        if (this.control!.status.toLowerCase() === 'disabled') {
          this._disableState$.next({ disabled: true });
        } else {
          this._disableState$.next({ disabled: false });
        }
        if (typeof state !== 'undefined' && state !== null) {
          this.setPhoneControlValue(state);
        } else {
          this.phoneControl.setValue(null);
        }
      })
    );
  }

  //
  public onCountrySelect(country: Country): void {
    this.selected = country;
    const value = this.phoneControl.value ? this.phoneControl.value : '';
    this.setControlValue(country.dialCode, value);
    this.phoneControlElement.nativeElement.focus();
  }

  //
  onKeyPress(event: any): void {
    const pattern = /[0-9\+\-\ ]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  //
  private _initializePhoneNumberControl(disabled = false): void {
    this.phoneControl = new FormControl({ value: null, disabled });
    // Set the initial country to show
    if (
      typeof this.control!.value !== 'undefined' &&
      this.control!.value !== null
    ) {
      this.setPhoneControlValue(this.control!.value.toString());
    } else if (this.country) {
      const selected = this.allCountries.find((c: Country) => {
        return c.iso2 === this.country;
      });
      if (selected) {
        this.selected = selected;
      }
    } else {
      if (this.preferredCountriesInDropDown.length > 0) {
        this.selected = this.preferredCountriesInDropDown[0];
      } else {
        this.selected = this.allCountries[0];
      }
    }
    // Setting validators on a control
    const validators: ValidatorFn[] = [
      PhoneNumberValidator.ValidatePhoneNumber,
    ];
    if (this.required) {
      validators.push(Validators.required);
    }
    this.control!.setValidators(validators);
    this.control!.updateValueAndValidity({ onlySelf: true });
  }

  //
  private setControlValue(code: string, phoneNumber: string): void {
    this.control!.markAsTouched();
    this.control!.markAsDirty();
    this.control.updateValueAndValidity();
    if (this.control!.value === `${code}${phoneNumber}`) {
      return;
    }
    this.control!.setValue(
      `${code}${phoneNumber?.replace(/[\s\t\/\+\-]/g, '')}`
    );
  }

  //
  setPhoneControlValue(value: string): void {
    const tmpCode = this.service.getCountryCode(value);
    if (tmpCode) {
      const selected = this.allCountries.find((c: Country) => {
        return c.dialCode === tmpCode.toString();
      });
      if (selected && value) {
        this.selected = selected;
        const shortPhoneNumber = value.substring(this.selected.dialCode.length);
        const phoneControlValue = this.phoneControl.value?.replace(
          /[\s\t\/\+\-]/g,
          ''
        );
        if (shortPhoneNumber !== phoneControlValue) {
          this.phoneControl.setValue(shortPhoneNumber);
        }
      }
    }
  }

  //
  isDefined(value: any) {
    return typeof value !== 'undefined' && value !== null;
  }

  //
  ngOnDestroy() {
    this._destroy$.next();
    this.allCountries = [];
  }

  //
  onInputFocus() {
    this.control!.markAsTouched();
  }
}
