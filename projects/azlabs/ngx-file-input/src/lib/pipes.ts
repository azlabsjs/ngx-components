import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { StateType } from './types';

@Pipe({
  pure: true,
  standalone: true,
  name: 'safehtml',
})
export class SafeHTMLPipe implements PipeTransform {
  constructor(private sanitized: DomSanitizer) {}
  transform(value: string) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}

@Pipe({
  name: 'haserror',
  pure: true,
  standalone: true,
})
export class HasErrorPipe implements PipeTransform {
  transform(value: StateType) {
    return typeof value.error !== 'undefined' && value.error !== null;
  }
}

export const PIPES = [SafeHTMLPipe, HasErrorPipe] as const;
