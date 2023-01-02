import {
  AsyncPipe, CurrencyPipe,
  DecimalPipe,
  JsonPipe, LowerCasePipe, PercentPipe,
  SlicePipe, UpperCasePipe
} from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { GetTimeAgo, JSDate, ParseMonth } from '@azlabsjs/js-datetime';
import { after, before } from '@azlabsjs/str';

/**
 * Supported pipe transform type
 */
type PipeTransformType =
  | string
  | ((value: unknown) => unknown)
  | undefined
  | PipeTransform;

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
  name: 'data',
})
export class NgxGridDataPipe implements PipeTransform {
  constructor(
    private uppercasePipe: UpperCasePipe,
    private lowerCasePipe: LowerCasePipe,
    private currencyPipe: CurrencyPipe,
    private decimalPipe: DecimalPipe,
    private jsonPipe: JsonPipe,
    private percentPipe: PercentPipe,
    private slicePipe: SlicePipe,
    private asyncPipe: AsyncPipe
  ) {}

  /**
   * Transform template value to it corresponding converted value using the user pipe
   *
   * @param value
   * @param transform
   * @returns
   */
  transform(value: any, transform: PipeTransformType) {
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
    if (
      typeof transform === 'object' &&
      typeof transform.transform === 'function'
    ) {
      return transform.transform(value);
    }
    const _transform = transform as string;
    const hasParams = _transform.includes(':');
    const pipe = hasParams ? before(':', _transform) : transform;
    const params = hasParams
      ? after(':', _transform)
          .split(',')
          .map((x) => x.trim()) ?? []
      : [];
    switch (pipe) {
      case 'date':
        return this.formatDate(value, ...params);
      case 'datetime':
        return this.dateTime(value, ...params);
      case 'timeago':
        return this.timeAgo(value, ...params);
      case 'month':
        return this.getMonth(value);
      case 'masked':
        return this.mask(value, ...params.map((x) => Number(x)));
      case 'uppercase':
        return this.uppercasePipe.transform(value);
      case 'lowercase':
        return this.lowerCasePipe.transform(value); //
      case 'currency':
        return this.currencyPipe.transform(value); //
      case 'decimal':
        return this.decimalPipe.transform(value, ...params);
      case 'json':
        return this.jsonPipe.transform(value);
      case 'percent':
        return this.percentPipe.transform(value, ...params);
      case 'slice':
        return this.slicePipe.transform(
          value,
          +params[0],
          +params[1] ?? undefined
        );
      case 'async':
        return this.asyncPipe.transform(value);
      default:
        return value;
    }
  }

  mask(value?: string, length: number = 5): string {
    return value ? `*******${substr(value, -length)}` : '*******';
  }

  timeAgo(value: any, locale: string = 'fr-FR'): string {
    return typeof value === 'undefined' || value === null
      ? ''
      : JSDate.isValid(value)
      ? GetTimeAgo()(JSDate.create(value), locale ?? 'fr-FR')
      : value;
  }

  dateTime(value: any, args?: any): any {
    return typeof value === 'undefined' || value === null
      ? ''
      : JSDate.isValid(value)
      ? JSDate.format(value, args ? args : 'lll')
      : value;
  }

  formatDate(value: any, args?: any): any {
    return typeof value === 'undefined' || value === null
      ? ''
      : JSDate.isValid(value)
      ? JSDate.format(value, args ? args : 'DD/MM/YYYY')
      : value;
  }

  getMonth(value: any): any {
    return typeof value === 'undefined' || value === null
      ? ''
      : ParseMonth(value);
  }
}
