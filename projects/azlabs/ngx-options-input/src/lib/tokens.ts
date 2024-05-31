import { InjectionToken } from '@angular/core';
import { InputOptionsClient, InputOptions } from '@azlabsjs/smart-form-core';
import { CacheType } from './cache';

/** @description Options client provider */
export const INPUT_OPTIONS_CLIENT = new InjectionToken<
  InputOptionsClient | InputOptionsClient
>('CLIENT PROVIDER FOR OPTIONS INPUT');

/** @description Options cache provider */
export const OPTIONS_CACHE = new InjectionToken<
  CacheType<{ [index: string]: unknown }, InputOptions>
>('Options Cache Provider');
