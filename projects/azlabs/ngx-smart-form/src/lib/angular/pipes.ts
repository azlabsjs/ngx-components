import { Pipe, PipeTransform } from '@angular/core';
import { InputGroup, InputConfigInterface, InputTypes } from '@azlabsjs/smart-form-core';

/**
 * @description checks if input has `hidden` property set to true or is of type `hidden`
 *
 * **Note** We mark the pipe as pure, because it depends on an object which hidden property
 *          might change, while the reference does not change, therefore, for now we wish to
 *          run the change dectector of the current pipe on each cycle
 */
@Pipe({
  name: 'ishidden',
  pure: false,
  standalone: true,
})
export class IsHidden implements PipeTransform {
  transform(value: InputConfigInterface) {
    return (typeof value !== 'undefined' && value !== null && Boolean(value.type === InputTypes.HIDDEN_INPUT) === true) || value?.type === InputTypes.HIDDEN_INPUT;
  }
}

@Pipe({
  name: 'hasChildren',
  pure: true,
  standalone: true,
})
export class HasChildren implements PipeTransform {
  transform(value: InputGroup) {
    return typeof value !== 'undefined' && value !== null && typeof value.inputs !== 'undefined' && value.inputs !== null && Array.isArray(value.inputs) && value.inputs.length > 0;
  }
}

@Pipe({
  name: 'repeatable',
  pure: true,
  standalone: true,
})
export class IsRepeatable implements PipeTransform {
  transform(value: InputConfigInterface) {
    return typeof value !== 'undefined' &&value !== null &&Boolean(value.isRepeatable);
  }
}

@Pipe({
  name: 'asInputs',
  pure: true,
  standalone: true,
})
export class AsInputs implements PipeTransform {
  transform(value: unknown) {
    return value as InputConfigInterface[];
  }
}

@Pipe({
  name: 'asInputGroup',
  pure: true,
  standalone: true,
})
export class AsInputGroup implements PipeTransform {
  transform(value: unknown) {
    return value as InputGroup;
  }
}

@Pipe({
  name: 'keys',
  pure: true,
  standalone: true,
})
export class KeysPipe implements PipeTransform {
  transform(value: { [prop: string]: unknown }) {
    return Object.keys(value);
  }
}

@Pipe({
  name: 'inputConfigArray',
  pure: true,
  standalone: true,
})
export class AsInputConfigArray implements PipeTransform {
  transform(value: InputConfigInterface | InputConfigInterface[]) {
    return Array.isArray(value) ? value : [value].filter((current) => typeof current !== 'undefined' && current !== null);
  }
}

@Pipe({
  name: 'required',
  pure: true,
  standalone: true,
})
export class RequiredPipe implements PipeTransform {
  transform(value: InputConfigInterface) {
    return !!value.constraints && 'required' in value.constraints && !!value.constraints.required;
  }
}

/** @description exported pipes */
export const PIPES = [
  IsRepeatable,
  HasChildren,
  IsHidden,
  AsInputs,
  AsInputGroup,
  KeysPipe,
  AsInputConfigArray,
  RequiredPipe,
] as const;
