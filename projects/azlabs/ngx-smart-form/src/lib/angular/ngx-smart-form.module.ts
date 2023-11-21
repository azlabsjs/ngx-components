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
import { isValidURL, rxRequest } from '../http';

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
    const _loadFormsHandler =
      loadFormsHandler ??
      ((url: string) => {
        return rxRequest({
          url,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
          },
          responseType: 'json',
        }).pipe(
          map(
            (response) => response.body as unknown as Record<string, unknown>[]
          )
        );
      });

    const providers: Provider[] = [
      FormsCacheProvider,
      JSONFormsClient,
      ReactiveFormBuilderBrige,
      {
        provide: FORMS_LOADER,
        useFactory: (
          location: LocationStrategy,
          platformLocation: PlatformLocation
        ) => {
          return new DefaultFormsLoader(_loadFormsHandler, (path?: string) => {
            if (path && isValidURL(path)) {
              return path;
            }
            let { hostname, port } = platformLocation;
            port = port ? `:${port}` : '';
            hostname = hostname.endsWith('#')
              ? hostname.substring(0, hostname.length - 1)
              : hostname;
            const _base = `${platformLocation.protocol}//${hostname}${port}`;
            path = location.prepareExternalUrl(path ?? '/');
            const _path = path.startsWith('#') ? path.substring(1) : path;
            const _hostname = _base.endsWith('/')
              ? _base.substring(0, _base.length - 1)
              : _base;
            const hostPath = _path.startsWith('/') ? _path.substring(1) : _path;

            // return the constructed url as an output
            return `${_hostname}/${hostPath}`;
          });
        },
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
