import { Injector, Provider, inject } from '@angular/core';
import { FormsCollection, LoadFormsRequestHandler } from './types';
import { API_HOST, FORMS_LOADER, FORMS_COLLECTION } from './tokens';
import { LocationStrategy, PlatformLocation } from '@angular/common';
import { useHTTPFormLoader } from '../http/factories';
import { BehaviorSubject, map } from 'rxjs';
import { FormConfigInterface, FormsLoader } from '@azlabsjs/smart-form-core';

/** @deprecated use `{provideFormsCollection}` with `useHTTPFormLoader` as form loader or a custom forms loader implementation  */
export function provideFormsLoader(url: string, handler?: LoadFormsRequestHandler, interceptor?: (items: { [prop: string]: unknown }[]) => FormConfigInterface[]) {
  return {
    provide: FORMS_LOADER,
    useFactory: (location: LocationStrategy, platform: PlatformLocation) => useHTTPFormLoader(location, platform, { url, handler, interceptor }),
    deps: [LocationStrategy, PlatformLocation],
  } as Provider;
}


/** provides an in-memory rxjs subject that act as a form collection. <br /> Note: register this a the root of the application for provide application wide forms collection instance */
export function provideFormsCollection(loader?: FormsLoader | ((injector: Injector) => FormsLoader)) {
  return {
    provide: FORMS_COLLECTION,
    useFactory: () => {
      const cache = new BehaviorSubject<FormConfigInterface[]>([]);
      const formsLoader = loader ?? inject(FORMS_LOADER);
      const injector = inject(Injector);

      return {
        get(id: string | number) {
          return cache.asObservable().pipe(map((state) => state.find((x) => x.id && (id.toString() === x.id.toString()))));
        },

        async init(options: { [index: string]: any } = {}) {
          const loader = typeof formsLoader === 'function' ? formsLoader(injector) : formsLoader;
          if (!loader) {
            return;
          }

          cache.next(await loader.load(options));
        }

      } as FormsCollection<FormConfigInterface>
    }
  } as Provider;
}

/** @description provides forms endpoints host url */
export function provideFormsHost(host?: string) {
  return { provide: API_HOST, useValue: host } as Provider;
}