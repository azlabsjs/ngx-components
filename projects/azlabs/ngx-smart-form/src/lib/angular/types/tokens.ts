import { InjectionToken } from '@angular/core';
import { RequestClient } from '../../http';
import { Observable } from 'rxjs';
import { InputOptionsClient } from './options';
import { FormsClient } from './form';
import { HttpRequest, HttpResponse } from '@azlabsjs/requests';
import { AngularReactiveFormBuilderBridge } from './bridge';
import { UploadOptionsType } from './upload';

export type ValidationMessagesType = Observable<
  { [index: string]: any } | Record<string, any>
>;

export const FORM_CLIENT = new InjectionToken<FormsClient>(
  'FORM CLIENT FOR LOADING FORM THE DATA SOURCE'
);

export const ANGULAR_REACTIVE_FORM_BRIDGE =
  new InjectionToken<AngularReactiveFormBuilderBridge>(
    'PROVIDE AN INSTANCE THAT CREATE ANGULAR REACTIVE FORM ELEMENT FROM A FORM CONFIG'
  );

export const API_BINDINGS_ENDPOINT = new InjectionToken<string>(
  'API ENDPOINT FOR APPLICATION CONTROLS BINDINGS'
);

export const API_HOST = new InjectionToken<string>(
  'API HOST FOR FORM MANAGEMENT'
);

export const INPUT_OPTIONS_CLIENT =
  new InjectionToken<InputOptionsClient>('CLIENT PROVIDER FOR OPTIONS INPUT');

export const HTTP_REQUEST_CLIENT = new InjectionToken<RequestClient>(
  'CLIENT INSTANCE FOR HANDLING FORM SUBMISSION'
);

export const TEMPLATE_DICTIONARY = new InjectionToken<ValidationMessagesType>(
  'TEMPLATE DICTIONARY PROVIDER'
);

export const UPLOADER_OPTIONS = new InjectionToken<UploadOptionsType<HttpRequest, HttpResponse>>(
  'OPTIONS TO PASS TO THE UPLOADER BY DEFAULT'
)
