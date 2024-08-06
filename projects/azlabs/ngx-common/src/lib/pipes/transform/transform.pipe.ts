import {
  CurrencyPipe,
  DecimalPipe,
  JsonPipe,
  LowerCasePipe,
  PercentPipe,
  SlicePipe,
  UpperCasePipe,
} from '@angular/common';
import { Inject, Injectable, Injector, Pipe, PipeTransform } from '@angular/core';
import { GetTimeAgo, JSDate, ParseMonth } from '@azlabsjs/js-datetime';
import { PipeTransformTokenMapType, PipeTransformType } from './types';
import { PIPE_TRANSFORMS } from './tokens';
import { createParams, substr } from './internal';

@Pipe({
  pure: true,
  standalone: true,
  name: 'transform',
})
@Injectable({providedIn: 'any'})
export class NgxTransformPipe implements PipeTransform {
  /** @description Creates an instance {@see NgxTransformPipe} pipe */
  constructor(
    private uppercasePipe: UpperCasePipe,
    private lowerCasePipe: LowerCasePipe,
    private currencyPipe: CurrencyPipe,
    private decimalPipe: DecimalPipe,
    private jsonPipe: JsonPipe,
    private percentPipe: PercentPipe,
    private slicePipe: SlicePipe,
    private injector: Injector,
    @Inject(PIPE_TRANSFORMS) private transforms?: PipeTransformTokenMapType
  ) {}

  /** @description Transform template value to it corresponding converted value using the user pipe */
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
    if (!this.transforms) {
      return value;
    }
    const pipeToken = this.transforms[pipename];
    if (!!!pipeToken) {
      return value;
    }
    const pipe = this.injector.get(pipeToken);
    const result = pipe?.transform(value, ...params) ?? value;
    console.log('Injection token result: ', value, result);
    return result;
  }
}
