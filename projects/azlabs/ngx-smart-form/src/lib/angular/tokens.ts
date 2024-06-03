import { InjectionToken, inject } from '@angular/core';
import { RequestClient } from '../http';
import { AngularReactiveFormBuilderBridge, FormsClient } from './types/form';
import { CacheProvider, FormsLoader } from '@azlabsjs/smart-form-core';
import { FormsCacheProvider } from './services/cache';
import { JSONFormsClient } from './services/client';
import { ReactiveFormBuilder } from './services/forms';

export const FORMS_LOADER = new InjectionToken<FormsLoader>(
  'PROVIDE DYNAMIC FORM LOADER'
);

/**
 * @description Cache provider injection token
 */
export const CACHE_PROVIDER = new InjectionToken<CacheProvider>(
  'PROVIDES AN INSTANCE OF CacheProvider::Interface',
  {
    providedIn: 'root',
    factory: () => {
      return new FormsCacheProvider(inject(FORMS_LOADER));
    },
  }
);

export const FORM_CLIENT = new InjectionToken<FormsClient>(
  'FORM CLIENT FOR LOADING FORM THE DATA SOURCE',
  {
    providedIn: 'root',
    factory: () => {
      return inject(JSONFormsClient);
    },
  }
);

export const ANGULAR_REACTIVE_FORM_BRIDGE =
  new InjectionToken<AngularReactiveFormBuilderBridge>(
    'PROVIDE AN INSTANCE THAT CREATE ANGULAR REACTIVE FORM ELEMENT FROM A FORM CONFIG',
    {
      providedIn: 'any',
      factory: () => {
        return inject(ReactiveFormBuilder);
      },
    }
  );

export const API_HOST = new InjectionToken<string>(
  'API HOST FOR FORM MANAGEMENT'
);

/**
 * HTTP requests client injection token
 */
export const HTTP_REQUEST_CLIENT = new InjectionToken<RequestClient>(
  'CLIENT INSTANCE FOR HANDLING FORM SUBMISSION'
);
