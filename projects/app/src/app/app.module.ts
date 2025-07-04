import { inject, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import {
  HttpClient,
  provideHttpClient as ngProvideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DIRECTIVES } from '@azlabsjs/ngx-clr-smart-grid';
import { NgxDropzoneModule } from '@azlabsjs/ngx-dropzone';
import {
  providePreferredCountries,
  provideSupportedCountries,
} from '@azlabsjs/ngx-intl-tel-input';
import {
  FORM_DIRECTIVES,
  provideFormsInitialization,
  provideFormsLoader,
  provideHttpClient,
} from '@azlabsjs/ngx-smart-form';
import { ClarityIcons, uploadCloudIcon } from '@cds/core/icon';
import { AppComponent } from './app.component';
import { TestPipe } from './pipes/test.pipe';
import {
  FORM_CONTROL_DIRECTIVES,
  useOptionsInterceptor,
  provideTranslations as provideInputTranslations,
} from '@azlabsjs/ngx-clr-form-control';
import { FormControlComponent } from './form-control/form-control.component';
import {
  COMMON_PIPES,
  CommonTextPipe,
  provideTranslations,
  providePipes,
  AsyncTextPipe,
} from '@azlabsjs/ngx-common';
import { RouterModule } from '@angular/router';
import { HTTPValuePipe, TRANSLATE_PIPES } from './pipes';
import {
  provideCacheConfig,
  provideQueryClient,
} from '@azlabsjs/ngx-options-input';
import { provideUploadOptions } from '@azlabsjs/ngx-file-input';
import { ClarityModule } from '@clr/angular';
import {
  TranslateLoader,
  TranslateModule,
  TranslatePipe,
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { useTranslationsFactory } from './translations';

ClarityIcons.addIcons(uploadCloudIcon);

export function createTranslateLoader() {
  return new TranslateHttpLoader(inject(HttpClient), './assets/i18n/', '.json');
}

@NgModule({
  declarations: [AppComponent, FormControlComponent],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot([], { useHash: true }),
    TranslateModule.forRoot({
      defaultLanguage: 'fr',
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
      },
    }),
    HTTPValuePipe,
    ClarityModule,
    // CdsModule,
    ...DIRECTIVES,
    ...COMMON_PIPES,
    ...TRANSLATE_PIPES,
    ...FORM_CONTROL_DIRECTIVES,
    ...FORM_DIRECTIVES,
    NgxDropzoneModule.forRoot(),
  ],
  providers: [
    provideSupportedCountries(['tg', 'ci', 'gh']),
    providePreferredCountries(['ci']),
    providePipes({
      pipes: {
        testPipe: TestPipe,
        text: CommonTextPipe,
        httpValue: HTTPValuePipe,
        translate: TranslatePipe,
        asyncText: AsyncTextPipe,
      },
    }),
    provideFormsLoader(),
    provideQueryClient({
      interceptorFactory: useOptionsInterceptor((request) => request.clone({})),
      queries: {
        // category_id : 'https://coopecclients.lik.tg/',
        zone_id: () => 'https://coopecclients.liksoft.tg/', // TODO: In future release pass the form id to the function
        category_id: {
          host: 'https://coopecclients.azlabs.xyz/',
        },
      },
    }),
    provideCacheConfig(),
    provideUploadOptions('https://storagev2.lik.tg/api/storage/object/upload', {
      interceptorFactory: (injector: Injector) => {
        // Replace the interceptor function by using the injector
        return (request, next) => {
          request = request.clone({
            options: {
              ...request.options,
              headers: {
                ...request.options.headers,
                'x-client-id': '98954592-d85b-43c4-a77f-e7bb4501f655',
                'x-client-secret':
                  'HeP44SYK11FXhIEzFB8efeyo63nZQ12mZrbBA8KcWqwD91tT9K4EfhngL5Vw7hNu9YUglzdJOdp8zigRQ',
              },
            },
          });
          return next(request);
        };
      },
    }),
    provideFormsInitialization('/assets/forms.json'),
    /* injector: Injector */
    provideHttpClient('http://localhost:4000', () => {
      // Replace the interceptor function by using the injector
      return (request, next) => {
        request = request.clone({
          options: {
            ...request.options,
            headers: {
              ...request.options.headers,
              Authorization: `Basic ${btoa('user:password')}`,
            },
          },
        });
        return next(request);
      };
    }),
    provideTranslations(useTranslationsFactory()),
    provideInputTranslations({
      loadingText: 'Chargement en cours...',
      validation: {
        minlength: 'La longueur minimal du champ est de {{requiredLength}}',
        maxlength: 'La longueur maximale du champ est de {{requiredLength}}',
        maxLength: 'La longueur maximale du champ est de {{value}}',
        minLength: 'La longueur minimal du champ est de {{value}}',
        invalid: 'La valeur du champ est invalide',
        required: 'Le champ est requis',
        unique: 'La valeur de ce champ est déja existante',
        email:
          'La valeur de ce champ doit être un adresse mail valid [example@email.com]',
        pattern: 'La valeur du champ est invalide',
        min: 'La valeur minimal du champ est de {{value}}',
        max: 'La valeur maximal du champ est de {{value}}',
        phone: 'Veuillez saisir un numéro de téléphone valid',
        minDate: 'Veuillez saisir une date ultérieure à la date du {{date}}',
        maxDate: 'Veuillez saisir une date antérieure à la date du {{date}}',
        exists:
          "La valeur du champ n'existe pas dans la dans la base de données",
        equals:
          'La valeur du champ {{value}} ne correspond pas à la valeur saisie',
      },
    }),
    TranslatePipe,
    ngProvideHttpClient(withInterceptorsFromDi()),
  ],
})
export class AppModule {}
