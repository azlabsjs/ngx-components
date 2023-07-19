import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { DropdownModule } from '@azlabsjs/ngx-dropdown';
import { Country, SUPPORTED_COUNTRIES } from './core';
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
        {
          provide: SUPPORTED_COUNTRIES,
          useFactory: () => {
            if (configs) {
              const { countries } = configs;
              const _countries =
                typeof countries === 'function'
                  ? (countries as () => Country[])()
                  : (countries as Country[]);
              if (countries instanceof Array) {
                return _countries.filter(
                  (country) =>
                    typeof country === 'object' &&
                    typeof country.iso2 !== 'undefined' &&
                    typeof country.name !== 'undefined' &&
                    typeof country.dialCode !== 'undefined'
                );
              }
            }
            return [] as Country[];
          },
        },
      ],
    };
  }
}
