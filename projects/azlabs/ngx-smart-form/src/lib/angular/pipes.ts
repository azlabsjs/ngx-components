import { Pipe, PipeTransform } from '@angular/core';
import {
  InputGroup,
  InputConfigInterface,
  InputTypes,
} from '@azlabsjs/smart-form-core';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * @description Checks if input has `hidden` property set to true or is of type `hidden`
 * 
 * **Note** We mark the pipe as pure, because it depends on an object which hidden property
 *          might change, while the reference does not change, therefore, for now we wish to
 *          run the change dectector of the current pipe on each cycle
 */
@Pipe({
  name: 'isHidden',
  pure: false,
  standalone: true,
})
export class IsHiddenPipe implements PipeTransform {
  //
  transform(value: InputConfigInterface) {
    return (
      (typeof value !== 'undefined' &&
        value !== null &&
        Boolean(value.hidden) === true) ||
      value?.type === InputTypes.HIDDEN_INPUT
    );
  }
}

@Pipe({
  name: 'hasChildren',
  pure: true,
  standalone: true,
})
export class HasChildrenPipe implements PipeTransform {
  transform(value: InputGroup) {
    return (
      typeof value !== 'undefined' &&
      value !== null &&
      typeof value.children !== 'undefined' &&
      value.children !== null &&
      Array.isArray(value.children) &&
      value.children.length > 0
    );
  }
}

@Pipe({
  name: 'repeatable',
  pure: true,
  standalone: true,
})
export class IsRepeatablePipe implements PipeTransform {
  transform(value: InputConfigInterface) {
    return (
      typeof value !== 'undefined' &&
      value !== null &&
      Boolean(value.isRepeatable)
    );
  }
}

@Pipe({
  name: 'safeHtml',
  standalone: true,
})
export class SafeHTMLPipe implements PipeTransform {
  constructor(private sanitized: DomSanitizer) {}
  transform(value: string) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}

/** @description Exported pipes */
export const PIPES = [
  SafeHTMLPipe,
  IsRepeatablePipe,
  HasChildrenPipe,
  IsHiddenPipe,
] as const;
