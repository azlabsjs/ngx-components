import { HTTPRequestMethods, HttpResponseType } from '@azlabsjs/requests';
import { ObservableInput } from 'rxjs';

export interface RequestClient {
  /**
   * Makes an HTTP Request to a server enpoint and returns
   * an observable of response type
   *
   * @param path The path to API resource or full server url
   * @param method
   * @param body
   * @param options
   */
  request<T>(
    path: string,
    method: HTTPRequestMethods,
    body: unknown,
    options?: {
      headers?: HeadersInit;
      responseType?: HttpResponseType;
    }
  ): ObservableInput<T>;
}

// TODO: Add a REST CLIENT interface with methods like get(), post(), put(), delete(), path(), options(), head(), etc...
