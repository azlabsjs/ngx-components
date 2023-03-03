import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { DropdownModule } from '@azlabs/ngx-dropdown';
import { PhoneNumberFormat } from 'google-libphonenumber';
import { Country, IntlTelInput, ISO3166 } from './core';
import { getPhoneNumberPlaceholder } from './core/internal';
import { COUNTRIES } from './core/types';
import { NgxIntlTelInputComponent } from './ngx-intl-tel-input.component';

@NgModule({
  declarations: [NgxIntlTelInputComponent],
  imports: [CommonModule, ScrollingModule, DropdownModule],
  exports: [DropdownModule, NgxIntlTelInputComponent],
})
export class NgxIntlTelInputModule {
  static forRoot(configs?: {
    countries: Country[] | (() => Country[]);
  }): ModuleWithProviders<NgxIntlTelInputModule> {
    return {
      ngModule: NgxIntlTelInputModule,
      providers: [
        IntlTelInput,
        {
          provide: COUNTRIES,
          useFactory: () => {
            if (configs) {
              const { countries } = configs;
              if (typeof countries === 'function') {
                return (countries as () => Country[])();
              }
              if (countries instanceof Array) {
                return (countries as Country[]).filter(
                  (country) =>
                    typeof country === 'object' &&
                    typeof country.iso2 !== 'undefined' &&
                    typeof country.name !== 'undefined' &&
                    typeof country.dialCode !== 'undefined'
                );
              }
            }
            return ISO3166.map((country) => ({
              name: country[0].toString(),
              iso2: country[1].toString(),
              dialCode: country[2].toString(),
              priority: +country[3] || 0,
              areaCode: +country[4] || undefined,
              flagClass: country[1].toString().toLocaleLowerCase(),
              placeHolder: `${getPhoneNumberPlaceholder(
                country[1].toString().toUpperCase(),
                PhoneNumberFormat.NATIONAL
              )}`,
            }));
          },
        },
      ],
    };
  }
}
