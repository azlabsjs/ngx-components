import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';
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
  CLR_FORM_CONTROL_DIRECTIVES,
  useOptionsInterceptor,
} from '@azlabsjs/ngx-clr-form-control';
import { FormControlComponent } from './form-control/form-control.component';
import {
  COMMON_PIPES,
  provideCommonStrings,
  providePipes,
} from '@azlabsjs/ngx-common';
import { RouterModule } from '@angular/router';
import { HTTPValuePipe } from './pipes';
import {
  provideCacheConfig,
  provideQueryClient,
} from '@azlabsjs/ngx-options-input';
import { provideUploadOptions } from '@azlabsjs/ngx-file-input';
import { ClarityModule } from '@clr/angular';
import { map, timer } from 'rxjs';

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
    ClarityModule,
    // CdsModule,
    ...DIRECTIVES,
    ...COMMON_PIPES,
    ...CLR_FORM_CONTROL_DIRECTIVES,
    ...FORM_DIRECTIVES,
    NgxDropzoneModule.forRoot(),
  ],
  providers: [
    provideSupportedCountries(['tg', 'ci', 'gh']),
    providePreferredCountries(['ci']),
    providePipes({
      pipes: {
        testPipe: TestPipe,
        httpValue: HTTPValuePipe,
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

    provideCommonStrings(
      timer(2000).pipe(
        map(() => ({
          app: {
            modules: {
              users: {
                title: 'Users Administration',
              },
            },
          },
        }))
      )
    ),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
