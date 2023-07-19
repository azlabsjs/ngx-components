import { InjectionToken } from '@angular/core';
import { RequestClient } from '../../http';
import { FormsClient } from './form';
import { AngularReactiveFormBuilderBridge } from './bridge';
import { CacheProvider, FormsLoader } from '@azlabsjs/smart-form-core';

export const FORMS_LOADER = new InjectionToken<FormsLoader>(
  'PROVIDE DYNAMIC FORM LOADER'
);

/**
 * @description Cache provider injection token
 */
export const CACHE_PROVIDER = new InjectionToken<CacheProvider>(
  'PROVIDES AN INSTANCE OF CacheProvider::Interface'
);

export const FORM_CLIENT = new InjectionToken<FormsClient>(
  'FORM CLIENT FOR LOADING FORM THE DATA SOURCE'
);

export const ANGULAR_REACTIVE_FORM_BRIDGE =
  new InjectionToken<AngularReactiveFormBuilderBridge>(
    'PROVIDE AN INSTANCE THAT CREATE ANGULAR REACTIVE FORM ELEMENT FROM A FORM CONFIG'
  );

export const API_HOST = new InjectionToken<string>(
  'API HOST FOR FORM MANAGEMENT'
);

export const HTTP_REQUEST_CLIENT = new InjectionToken<RequestClient>(
  'CLIENT INSTANCE FOR HANDLING FORM SUBMISSION'
);
