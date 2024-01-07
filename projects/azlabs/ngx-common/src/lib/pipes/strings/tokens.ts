import { InjectionToken } from '@angular/core';
import { CommonStringsType } from './types';

/**
 * Common strings provider injection token
 */
export const COMMON_STRINGS = new InjectionToken<CommonStringsType>(
  'Common Strings Provider Token'
);
