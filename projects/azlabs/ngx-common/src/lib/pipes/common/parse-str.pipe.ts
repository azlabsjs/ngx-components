import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'parseStr',
  pure: true,
})
export class ParseStrPipe implements PipeTransform {
  // Parses a string replacing template variable `[name]`
  // with the corresponding value in the provided object
  transform(
    value: string | null | undefined,
    params: Record<string, unknown> | null | undefined
  ) {
    const _params = params ?? {};
    value = value ?? '';
    for (const prop of Object.keys(_params)) {
      value = value.replace(`[${prop}]`, String(_params[prop]));
    }

    // We return the string with template properties replaced
    // with the corresponding properties values
    return value;
  }
}
