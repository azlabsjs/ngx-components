import { CommonModule, LocationStrategy, PlatformLocation } from '@angular/common';
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
import { from, lastValueFrom, map, ObservableInput, of } from 'rxjs';
import { createSubmitHttpHandler } from '../http';
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
import { SafeHTMLPipe } from './pipes';
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
import { rxRequest } from '../http/helpers';

type FormApiServerConfigs = {
  api: {
    host?: string;
    bindings?: string;
    uploadURL?: string;
  };
};

type ConfigType = {
  serverConfigs: FormApiServerConfigs;
  formsAssets?: string;
  clientFactory?: Function;
  templateTextProvider?: Provider;
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
    let { formsAssets: assets, loadFormsHandler } = configs;
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
        useFactory: (location: LocationStrategy, platformLocation: PlatformLocation) => {
          return new DefaultFormsLoader(_loadFormsHandler, (path?: string) => {
            const _base = `${platformLocation.protocol}//${platformLocation.hostname}${platformLocation.port ? `:${platformLocation.port}` : ''}`;
            const _path = location.prepareExternalUrl(path ?? '/');
            return `${_base.endsWith('/') ? _base.substring(0, _base.length - 1): _base}/${_path.startsWith('/') ? _path.substring(1) : _path}`;
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
        useValue: configs!.serverConfigs!.api.host || undefined,
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
          createSubmitHttpHandler(
            injector,
            configs!.serverConfigs!.api.host,
            configs.submitRequest?.interceptorFactory
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
