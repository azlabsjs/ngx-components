import {
  CommonModule,
  LocationStrategy,
  PlatformLocation,
} from '@angular/common';
import {
  APP_INITIALIZER,
  Injector,
  ModuleWithProviders,
  NgModule,
  Provider,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTPRequest } from '@azlabsjs/requests';
import { CacheProvider } from '@azlabsjs/smart-form-core';
import { from, lastValueFrom, map, ObservableInput } from 'rxjs';
import { createRequestClient } from '../http';
import {
  NgxSmartArrayAddButtonComponent,
  NgxSmartArrayCloseButtonComponent,
  NgxSmartFormArrayChildComponent,
  NgxSmartFormArrayComponent,
  NgxSmartFormComponent,
  NgxSmartFormControlArrayChildComponent,
  NgxSmartFormControlArrayComponent,
  NgxSmartFormGroupComponent,
  NgxSmartFormGroupHeaderPipe,
} from './components';
import {
  SafeHTMLPipe,
  HasChildrenPipe,
  IsRepeatablePipe,
  IsHiddenPipe,
} from './pipes';
import {
  DefaultFormsLoader,
  FormsCacheProvider,
  ReactiveFormBuilderBrige,
} from './services';
import { JSONFormsClient } from './services/client';
import {
  ANGULAR_REACTIVE_FORM_BRIDGE,
  API_HOST,
  CACHE_PROVIDER,
  FORMS_LOADER,
  FORM_CLIENT,
  HTTP_REQUEST_CLIENT,
  InterceptorFactory,
  LoadFormsRequestHandler,
} from './types';
import { useDefaultFormLoader } from './factories';

/**
 * @internal
 * API server configuration type declaration
 */
type FormApiServerConfigs = {
  api: {
    host?: string;
    bindings?: string;
    uploadURL?: string;
  };
};

/**
 * @internal
 * Module configuration type declaration
 */
type ConfigType = {
  serverConfigs: FormApiServerConfigs;
  formsAssets?: string;
  clientFactory?: Function;
  templateTextProvider?: Provider;
  /**
   * Provides configurations that are used by the module during API requests
   */
  requests?: {
    interceptorFactory?: InterceptorFactory<HTTPRequest>;
  };
  /**
   * submitRequest is deprecated and will be removed in future releases. use
   * `requests` option instead
   *
   * @deprecated v0.15.15
   */
  submitRequest?: {
    interceptorFactory?: InterceptorFactory<HTTPRequest>;
  };
  loadFormsHandler?: LoadFormsRequestHandler;
};

/**
 * @internal
 *
 * @param service
 * @param assetsURL
 */
export function preloadAppForms(service: CacheProvider, assetsURL: string) {
  return async () => {
    return await lastValueFrom(
      from(service.cache(assetsURL) as ObservableInput<unknown>)
    );
  };
}

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  declarations: [
    NgxSmartFormComponent,
    NgxSmartFormGroupComponent,
    NgxSmartFormArrayComponent,
    NgxSmartFormArrayChildComponent,
    NgxSmartFormGroupHeaderPipe,
    SafeHTMLPipe,
    HasChildrenPipe,
    IsRepeatablePipe,
    IsHiddenPipe,
    NgxSmartArrayCloseButtonComponent,
    NgxSmartArrayAddButtonComponent,
    NgxSmartFormControlArrayChildComponent,
    NgxSmartFormControlArrayComponent,
  ],
  exports: [
    NgxSmartFormComponent,
    NgxSmartFormGroupComponent,
    NgxSmartFormArrayComponent,
    NgxSmartFormArrayChildComponent,
    SafeHTMLPipe,
  ],
  providers: [],
})
export class NgxSmartFormModule {
  static forRoot(configs: ConfigType): ModuleWithProviders<NgxSmartFormModule> {
    let {
      formsAssets: assets,
      loadFormsHandler,
      serverConfigs,
      requests,
      submitRequest,
    } = configs;
    const _assets = assets ?? '/assets/resources/app-forms.json';
    

    const providers: Provider[] = [
      FormsCacheProvider,
      JSONFormsClient,
      ReactiveFormBuilderBrige,
      {
        provide: FORMS_LOADER,
        useFactory: (
          location: LocationStrategy,
          platformLocation: PlatformLocation
        ) => useDefaultFormLoader(location, platformLocation, loadFormsHandler),
        deps: [LocationStrategy, PlatformLocation],
      },
      {
        provide: CACHE_PROVIDER,
        useClass: FormsCacheProvider,
      },
      {
        provide: FORM_CLIENT,
        useClass: JSONFormsClient,
      },
      {
        provide: API_HOST,
        useValue: serverConfigs?.api.host || undefined,
      },
      {
        provide: APP_INITIALIZER,
        useFactory: (service: CacheProvider) =>
          preloadAppForms(service, _assets),
        multi: true,
        deps: [CACHE_PROVIDER],
      },
      {
        provide: ANGULAR_REACTIVE_FORM_BRIDGE,
        useClass: ReactiveFormBuilderBrige,
      },
      {
        provide: HTTP_REQUEST_CLIENT,
        useFactory: (injector: Injector) =>
          createRequestClient(
            injector,
            serverConfigs?.api.host,
            requests?.interceptorFactory ?? submitRequest?.interceptorFactory
          ),
        deps: [Injector],
      },
    ];
    return {
      ngModule: NgxSmartFormModule,
      providers: providers,
    };
  }
}
