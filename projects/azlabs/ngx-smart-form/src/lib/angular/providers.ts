import { APP_INITIALIZER, Injector, Provider, inject } from '@angular/core';
import { InterceptorFactory, LoadFormsRequestHandler } from './types';
import {
  API_HOST,
  HTTP_REQUEST_CLIENT,
  FORMS_LOADER,
  CACHE_PROVIDER,
} from './tokens';
import { LocationStrategy, PlatformLocation } from '@angular/common';
import { useHTTPFormLoader } from './factories';
import { createRequestClient } from '../http';
import { HTTPRequest } from '@azlabsjs/requests';
import { ObservableInput, from, lastValueFrom } from 'rxjs';
import { CacheProvider } from '@azlabsjs/smart-form-core';

/** @internal */
export function preloadAppForms(service: CacheProvider, assets: string) {
  return async () => {
    return await lastValueFrom(
      from(service.cache(assets) as ObservableInput<any>)
    );
  };
}

/** @description Provides `FORM_LOADER` service implementation */
export function provideFormsLoader(loadFormsHandler?: LoadFormsRequestHandler) {
  return {
    provide: FORMS_LOADER,
    useFactory: (
      location: LocationStrategy,
      platformLocation: PlatformLocation
    ) => {
      return useHTTPFormLoader(location, platformLocation, loadFormsHandler);
    },
    deps: [LocationStrategy, PlatformLocation],
  } as Provider;
}

/** @description Provide an http or request client used when submit forms or form component is sending requests */
export function provideHttpClient(
  host?: string,
  interceptor?: InterceptorFactory<HTTPRequest>
) {
  return {
    provide: HTTP_REQUEST_CLIENT,
    useFactory: () => {
      return createRequestClient(inject(Injector), host, interceptor);
    },
    deps: [Injector],
  };
}

/** @description Provides forms endpoints host url */
export function provideFormsHost(host?: string) {
  return {
    provide: API_HOST,
    useValue: host,
  } as Provider;
}

export function provideFormsInitialization(assets?: string) {
  return {
    provide: APP_INITIALIZER,
    useFactory: () => {
      const _assets = assets ?? '/assets/resources/app-forms.json';
      return preloadAppForms(inject(CACHE_PROVIDER), _assets);
    },
    multi: true,
  } as Provider;
}
