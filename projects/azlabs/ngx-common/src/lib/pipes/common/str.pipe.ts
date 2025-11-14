import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  pure: true,
  standalone: true,
  name: 'parseStr',
})
@Injectable({ providedIn: 'any' })
export class ParseStrPipe implements PipeTransform {
  // parses a string replacing template variable `[name]` with the corresponding value in the provided object
  transform(
    value: string | null | undefined,
    params: Record<string, unknown> | null | undefined
  ) {
    const _params = params ?? {};
    value = value ?? '';
    for (const prop of Object.keys(_params)) {
      value = value.replace(`[${prop}]`, String(_params[prop]));
    }

    // we return the string with template properties replaced with the corresponding properties values
    return value;
  }
}

@Pipe({
  pure: true,
  standalone: true,
  name: 'format',
})
@Injectable({ providedIn: 'any' })
export class FormatPipe implements PipeTransform {
  // parses a string replacing template variable `[name]` with the corresponding value in the provided object
  transform(
    value: string | null | undefined,
    params: Record<string, unknown> | null | undefined
  ) {
    const _params = params ?? {};
    value = value ?? '';
    for (const prop of Object.keys(_params)) {
      value = value.replace(`{${prop}}`, String(_params[prop]));
    }

    // we return the string with template properties replaced with the corresponding properties values
    return value;
  }
}

@Pipe({
  pure: true,
  standalone: true,
  name: 'strlen',
})
@Injectable({ providedIn: 'any' })
export class StrLengthPipe implements PipeTransform {
  /** @description Returns the length of string object */
  transform(value: any): number {
    return typeof value === 'undefined' || value === null
      ? 0
      : String(value).length;
  }
}
