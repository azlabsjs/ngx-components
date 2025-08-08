import { Observable } from 'rxjs';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import {
  FormConfigInterface,
  InputConfigInterface,
  FormInterface,
} from '@azlabsjs/smart-form-core';

/** @internal */
export type Builder = FormBuilder;

export interface AngularReactiveFormBuilderBridge {
  /** @var Builder */
  readonly builder: Builder;

  /** creates a reactive form element from the configuration from dynamic form or list of dynamic inputs */
  group(source: FormConfigInterface | InputConfigInterface[]): FormGroup;

  /** creates a form control instance from form configuration interface */
  control(state: InputConfigInterface): AbstractControl;

  /** creates a form array instance */
  array(state: InputConfigInterface): FormArray;
}

/**
 * @description Form client type definition. Implementation class must provide
 * functionality to load the form using form id from a given data source
 */
export interface FormsClient {
  /**
   * @description Get form definitions using the user provided id
   * @param id
   */
  get(id: string | number): Observable<FormConfigInterface>;

  /**
   * @description Get form definitions using the list of user provided ids
   * @param id
   */
  getAll(id: string[] | number[]): Observable<FormConfigInterface[]>;
}

/**
 * @description Provide implementation for preloading application form
 * into developper defined cache
 */
export interface FormsLoader {
  /**
   * @descritpion Provides an abstraction for loading dynamic form definitions
   * from an asset configuration file, a remote server
   *
   * @param endpoint
   * @param options
   */
  load(
    endpoint: string,
    options?: { [index: string]: any }
  ): Observable<FormInterface[]>;
}

/**
 * Forms cache provider. 
 * For form object query efficiency, object are loaded
 * and managed by the cache provider
 */
export interface CacheProvider {

  get(id: string | number): Observable<FormInterface>;

  getList(values: (string | number)[]): Observable<FormInterface[]>;

  /** provides predefined dynamic forms loader implementation */
  cache(
    endpoint: string,
    options?: { [index: string]: any }
  ): Observable<never> | Observable<FormInterface[]>;
}

/** @internal type definition for load form request handler function */
export type LoadFormsRequestHandler = (
  path: string,
  options?: Record<string, unknown>
) => Observable<Record<string, unknown>[]>;
