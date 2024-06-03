import { Injector } from '@angular/core';
import { Interceptor } from '@azlabsjs/requests';

/** @description Interceptors type declaration */
export type InterceptorFactory<T> = (injector: Injector) => Interceptor<T>;
