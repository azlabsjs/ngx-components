import { InjectionToken } from '@angular/core';
import { TranslationsType } from './types';
import { Observable } from 'rxjs';

/** @description Common strings provider injection token */
export const COMMON_STRINGS = new InjectionToken<Observable<TranslationsType>>(
  'Common Strings Provider Token'
);
