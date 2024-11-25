import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxClrSmartGridModule } from '@azlabsjs/ngx-clr-smart-grid';
import { NgxDropzoneModule } from '@azlabsjs/ngx-dropzone';
import {
  NgxIntlTelInputModule,
  providePreferredCountries,
  provideSupportedCountries,
} from '@azlabsjs/ngx-intl-tel-input';
// import { NgxSlidesModule } from '@azlabsjs/ngx-slides';
import { NgxSmartFormModule } from '@azlabsjs/ngx-smart-form';
import { CdsModule } from '@cds/angular';
import { ClarityIcons, uploadCloudIcon } from '@cds/core/icon';
import { AppComponent } from './app.component';
import { TestPipe } from './test.pipe';
import {
  NgxClrFormControlModule,
  useOptionsInterceptor,
} from '@azlabsjs/ngx-clr-form-control';
import { FormControlComponent } from './form-control/form-control.component';
import { NgxCommonModule } from '@azlabsjs/ngx-common';
import { RouterModule } from '@angular/router';
import { HTTPValuePipe } from './pipes';
import { TranslateService } from '@ngx-translate/core';
import { of, tap } from 'rxjs';

ClarityIcons.addIcons(uploadCloudIcon);

@NgModule({
  declarations: [AppComponent, FormControlComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot([], { useHash: true }),
    HTTPValuePipe,
    CdsModule,
    NgxIntlTelInputModule.forRoot(),
    NgxSmartFormModule.forRoot({
      // Optional : Required only to get data dynamically from the server
      // Server configuration for dynamically loading
      // Select, Checkbox and Radio button from server
      serverConfigs: {
        api: {
          host: 'http://localhost:4000',
          // Custom path on the server else the default is used
          bindings: 'api/v2/bindings',
        },
      },
      submitRequest: {
        interceptorFactory: (injector: Injector) => {
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
        },
      },
      // Path to the form assets
      // This path will be used the http handler to load the forms in cache
      formsAssets: '/assets/forms.json',
    }),

    NgxCommonModule.forRoot({
      pipeTransformMap: {
        testPipe: TestPipe,
        httpValue: HTTPValuePipe,
      },
    }),
    NgxClrSmartGridModule,
    // NgxSlidesModule.forRoot(),

    NgxDropzoneModule.forRoot(),

    // Configure clr control module
    NgxClrFormControlModule.forRoot({
      options: {
        url: 'http://127.0.0.1:3000/control-bindings',
        refreshInterval: 1800,
        cacheTTL: 1820,
        requests: {
          interceptorFactory: useOptionsInterceptor((request) =>
            request.clone({})
          ),
          queries: {
            // category_id : 'https://coopecclients.lik.tg/',
            zone_id: () => 'https://coopecclients.liksoft.tg/', // TODO: In future release pass the form id to the function
            category_id: {
              host: 'https://coopecclients.azlabs.xyz/',
            },
          },
        },
      },
      uploads: {
        options: {
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
        },
        // Files upload url
        url: 'https://storagev2.lik.tg/api/storage/object/upload',
      },
      translationsProvider: (i: Injector | null) => {
        return of({
          loadingText: 'Loading...',
          uploadFileLabel: 'to upload',
          dragFileLabel: 'Drag file(s) here or',
          clickUploadButtonLabel: 'Click',
          fileUploadError: 'Error while uploading file to server',
          fileSizeError:
            'File size must be less than or equal to {{maxFilesize}}Mo.',
          addButtonText: 'Click on the the button to add a new input element',
          validation: {
            minlength:
              'input value must contain at least {{requiredLength}} characters',
            maxlength:
              'maximum number of characters for this input is {{requiredLength}}',
            maxLength:
              'maximum number of characters for this input is {{requiredLength}}',
            minLength: 'input value must contain at least {{requiredLength}} characters',
            invalid: 'input value this input is invalid',
            required: 'Le champ est requis',
            unique: 'input value is already taken',
            email: 'input has invalid email format [example@email.com]',
            pattern: 'input value does not match the input pattern',
            min: 'La valeur minimale de ce champ est {{min}}',
            max: 'La valeur maximale de ce champ est {{max}}',
            phone: 'please enter a valid phone number',
            minDate: 'Veuillez saisir une date postérieure à la date du {{min}}',
            maxDate:
              'Veuillez saisir une date antérieure à la date du {{max}}',
            exists: 'input value does not exists',
            equals: 'input and {{value}} input values does not match',
          },
        });
      },
    }),
  ],
  providers: [
    provideSupportedCountries(['tg', 'ci', 'gh']),
    providePreferredCountries(['ci']),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
