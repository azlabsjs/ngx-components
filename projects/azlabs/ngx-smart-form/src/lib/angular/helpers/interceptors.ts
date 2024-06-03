import { Injector } from '@angular/core';
import { HTTPRequest, HTTPResponse, NextFunction } from '@azlabsjs/requests';

/** @internal Checks if a given value is a promise value */
function isPromise<T>(value: unknown): value is Promise<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Promise<unknown>).then === 'function'
  );
}

/** @description Provide a default interceptor function that intercepts request and add a bearer token to the authorization header */
export function useBearerTokenInterceptor(
  bearerToken?: (injector: Injector) => string | Promise<string>
) {
  return (injector: Injector) => {
    // Replace the interceptor function by using the injector
    return async (
      request: HTTPRequest,
      next: NextFunction<
        HTTPRequest,
        HTTPResponse | Promise<HTTPResponse> | Promise<unknown> | unknown
      >
    ) => {
      if (bearerToken && typeof bearerToken === 'function') {
        const _bearerToken = bearerToken(injector);
        const _value = await (isPromise(_bearerToken)
          ? _bearerToken
          : Promise.resolve(_bearerToken));
        request = request.clone({
          setHeaders: { Authorization: `Bearer ${_value}` },
        });
      }
      return next(request) as Promise<HTTPResponse>;
    };
  };
}
