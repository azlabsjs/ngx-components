import { Inject, InjectionToken } from '@angular/core';
import {
  InputOptionsClient,
  InputOptionsInterface,
} from '@azlabsjs/smart-form-core';
import { CacheType } from './cache';

export const INPUT_OPTIONS_CLIENT = new InjectionToken<
  InputOptionsClient | InputOptionsClient
>('CLIENT PROVIDER FOR OPTIONS INPUT');

export const OPTIONS_CACHE = new InjectionToken<
  CacheType<{ [index: string]: unknown }, InputOptionsInterface>
>('Options Cache Provider');
