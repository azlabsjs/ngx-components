import {
  CurrencyPipe,
  DecimalPipe,
  JsonPipe,
  LowerCasePipe,
  PercentPipe,
  SlicePipe,
  UpperCasePipe,
} from '@angular/common';
import {
  EnvironmentInjector,
  Inject,
  Pipe,
  PipeTransform,
  inject,
  runInInjectionContext,
} from '@angular/core';
import { GetTimeAgo, JSDate, ParseMonth } from '@azlabsjs/js-datetime';
import { PipeTransformTokenMapType, PipeTransformType } from './types';
import { PIPE_TRANSFORMS } from './tokens';

/**
 * Returns the strings after the first occurence the specified character
 *
 * @example
 * const substr = after('o', 'Hello World!'); // output " World!"
 *
 * @param char
 * @param haystack
 */
export function after(char: string, haystack: string) {
  const index = haystack.indexOf(char);
  return haystack.slice(index + char.length);
}

/**
 * Returns the strings before the first occurence the specified character
 *
 * @example
 * const substr = before('W', 'Hello World!'); // outputs -> "Hello "
 *
 * @param char
 * @param haystack
 */
export function before(char: string, haystack: string) {
  return haystack.slice(0, haystack.indexOf(char));
}

/**
 * Creates pipe transform parameter from provided transform definition rules
 */
export function createParams(transform: string) {
  const hasParams = transform.indexOf(':') !== -1;
  const pipe = hasParams ? before(':', transform) : transform;
  let params = hasParams
    ? after(':', transform)
        .split(';')
        .map((x) => x.trim()) ?? []
    : [];
  params = params.map((item) => {
    if (item.indexOf('json:') !== -1) {
      return JSON.parse(after('json:', item));
    }
    if (item.indexOf('js:') !== -1) {
      return JSON.parse(after('js:', item));
    }
    return item;
  });

  return [pipe, ...params];
}

/**
 * Compute the substring of the `value` string
 */
function substr(value: string, start: number, length?: number) {
  if (typeof value !== 'string') {
    return '';
  }
  if (start > value.length) {
    return '';
  }
  start = start >= 0 ? start : value.length - Math.abs(start);
  if (start < 0) {
    return '';
  }
  return String(value).substring(start, length ? start + length : undefined);
}

@Pipe({
  pure: true,
  standalone: true,
  name: 'transform',
})
export class NgxTransformPipe implements PipeTransform {
  private injector = inject(EnvironmentInjector);

  /**
   * Creates an instance {@see NgxGridDataPipe} pipe
   */
  constructor(
    private uppercasePipe: UpperCasePipe,
    private lowerCasePipe: LowerCasePipe,
    private currencyPipe: CurrencyPipe,
    private decimalPipe: DecimalPipe,
    private jsonPipe: JsonPipe,
    private percentPipe: PercentPipe,
    private slicePipe: SlicePipe,
    @Inject(PIPE_TRANSFORMS) private transforms?: PipeTransformTokenMapType
  ) {}

  /**
   * Transform template value to it corresponding converted value using the user pipe
   */
  transform(value: any, transform: PipeTransformType | PipeTransformType[]) {
    if (Array.isArray(transform)) {
      return transform.reduce((carry, current) => {
        carry = this.transformValue(carry, current);
        return carry;
      }, value);
    }
    return this.transformValue(value, transform);
  }

  private transformValue(value: any, transform: PipeTransformType) {
    if (typeof transform === 'function') {
      return transform(value);
    }
    if (typeof transform === 'undefined' || transform === null) {
      return value ?? '';
    }
    // Return an empty string if the value is not defined
    if (typeof value === 'undefined' || value === null) {
      return '';
    }
    // Create pipe transform name and parameter
    const [pipe, ...params] = createParams(transform as string);

    // Switch branch on pipe name and call the matching transformation function
    // TODO: In  future release replace the swith statement with a call to pipe transform
    const transforms: Record<string, () => any> = {
      date: () => this.formatDate(value, ...params),
      datetime: () => this.dateTime(value, ...params),
      timeago: () => this.timeAgo(value, ...params),
      month: () => this.getMonth(value),
      masked: () => this.mask(value, ...params.map((x) => Number(x))),
      uppercase: () => this.uppercasePipe.transform(value),
      lowercase: () => this.lowerCasePipe.transform(value),
      currency: () => this.currencyPipe.transform(value, ...params),
      decimal: () => this.decimalPipe.transform(value, ...params),
      json: () => this.jsonPipe.transform(value),
      percent: () => this.percentPipe.transform(value, ...params),
      slice: () =>
        this.slicePipe.transform(value, +params[0], +params[1] ?? undefined),
    };
    return transforms[pipe]
      ? transforms[pipe]()
      : this.getDefault(pipe, value, ...params);
  }

  private mask(value?: string, length: number = 5): string {
    return value ? `*******${substr(value, -length)}` : '*******';
  }

  private timeAgo(value: any, locale: string = 'fr-FR'): string {
    return typeof value === 'undefined' || value === null
      ? ''
      : JSDate.isValid(value)
      ? GetTimeAgo()(JSDate.create(value), locale ?? 'fr-FR')
      : value;
  }

  private dateTime(value: any, args?: any): any {
    return typeof value === 'undefined' || value === null
      ? ''
      : JSDate.isValid(value)
      ? JSDate.format(value, args ? args : 'lll')
      : value;
  }

  private formatDate(value: any, args?: any): any {
    return typeof value === 'undefined' || value === null
      ? ''
      : JSDate.isValid(value)
      ? JSDate.format(value, args ? args : 'DD/MM/YYYY')
      : value;
  }

  private getMonth(value: any): any {
    return typeof value === 'undefined' || value === null
      ? ''
      : ParseMonth(value);
  }

  private getDefault(pipename: string, value: unknown, ...params: any[]) {
    return runInInjectionContext(this.injector, () => {
      if (!this.transforms) {
        return value;
      }
      const pipeToken = this.transforms[pipename];
      if (pipeToken) {
        return inject(pipeToken)?.transform(value, ...params) ?? value;
      }
      return value;
    });
  }
}
