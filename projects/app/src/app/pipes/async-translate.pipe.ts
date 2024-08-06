import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { distinctUntilChanged } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
@Pipe({
  name: 'asyncTranslate',
  standalone: true,
  pure: true,
})
export class AsyncTranslatePipe implements PipeTransform {
  constructor(private translate: TranslateService) {}
  transform(value: any, args: Record<string, unknown>) {
    return this.translate.get(value, args).pipe(distinctUntilChanged());
  }
}

export const TRANSLATE_PIPES = [AsyncTranslatePipe] as const;
