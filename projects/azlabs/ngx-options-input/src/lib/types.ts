import { Injector } from '@angular/core';
import { HTTPRequest, Interceptor } from '@azlabsjs/requests';
import {
  InputOptionsInterface,
  OptionsConfig,
} from '@azlabsjs/smart-form-core';
import { Observable } from 'rxjs';

export type InputOptionsClient = {
  //
  /**
   * @description Query list of select options from forms provider database
   *
   */
  request(
    optionsConfig: OptionsConfig & { name?: string }
  ): Observable<InputOptionsInterface>;
};

/**
 * @internal
 */
type QueryConfigType = {
  [name: string]:
    | string
    | (() => string)
    | {
        host?: string | (() => string);
        interceptor?: InterceptorFactory<HTTPRequest>;
      };
};

export type InterceptorFactory<T> = (injector: Injector) => Interceptor<T>;

/**
 * @internal
 */
export type OptionsQueryConfigType = {
  interceptorFactory?: InterceptorFactory<HTTPRequest>;
  queries?: QueryConfigType;
};
