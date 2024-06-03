import { InjectionToken } from '@angular/core';
import { Translations } from './types';

/** @description descriptions, error and helper message translation provider token */
export const TRANSLATIONS_DICTIONARY = new InjectionToken<Translations>(
  'TRANSLATIONS DICTIONARY PROVIDER'
);
