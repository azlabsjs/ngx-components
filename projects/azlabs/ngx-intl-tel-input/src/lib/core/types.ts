import { InjectionToken } from "@angular/core";
import { Country } from "./model";

/**
 * @description ISO3166 Injectable instance
 */
export const COUNTRIES = new InjectionToken<Country[]>('ISO3166 countries injectable token');
