import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { CdsModule } from '@cds/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClarityIcons, uploadCloudIcon } from '@cds/core/icon';
import { NgxDropzoneModule } from '@azlabsjs/ngx-dropzone';
import { NgxIntlTelInputModule } from '@azlabsjs/ngx-intl-tel-input';
import { NgxSmartFormModule } from '@azlabsjs/ngx-smart-form';
import { HttpClientModule } from '@angular/common/http';
import { NgxClrSmartGridModule } from '@azlabsjs/ngx-clr-smart-grid';
import { NgxSlidesModule } from '@azlabsjs/ngx-slides';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

ClarityIcons.addIcons(uploadCloudIcon);

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CdsModule,
    NgxIntlTelInputModule.forRoot(),
    NgxSmartFormModule.forRoot({
      // Optional : Required only to get data dynamically from the server
      // Server configuration for dynamically loading
      // Select, Checkbox and Radio button from server
      serverConfigs: {
        api: {
          host: 'http://localhost:3000',
          // Custom path on the server else the default is used
          bindings: 'api/v2/bindings',
          // Files upload url
          uploadURL: 'https://storage.lik.tg/api/storage/object/upload',
        },
      },
      uploadOptions: {
        createInterceptor: (injector: Injector) => {
          // Replace the interceptor function by using the injector
          return (request, next) => {
            request = request.clone({
              options: {
                ...request.options,
                headers: {
                  ...request.options.headers,
                  'x-client-id': '96a6bba2-73e4-404c-9bb3-0d61c31bba44',
                  'x-client-secret':
                    '9NYHbYhzNXX2AbrxHs4H0cTmM7udeKEdqfwyTCXGLjnaU2IhmVldNwAknIpysbx5QZ8KBytvw1hW7qQE6iA',
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
    NgxClrSmartGridModule,
    NgxSlidesModule.forRoot(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
