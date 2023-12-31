import { Provider } from '@angular/core';
import { FORMS_LOADER, LoadFormsRequestHandler } from './types';
import { LocationStrategy, PlatformLocation } from '@angular/common';
import { useDefaultFormLoader } from './factories';

/**
 * Form loader angular provider function
 */
export function provideFormsLoader(loadFormsHandler?: LoadFormsRequestHandler) {
  return {
    provide: FORMS_LOADER,
    useFactory: (
      location: LocationStrategy,
      platformLocation: PlatformLocation
    ) => useDefaultFormLoader(location, platformLocation, loadFormsHandler),
    deps: [LocationStrategy, PlatformLocation],
  } as Provider;
}
