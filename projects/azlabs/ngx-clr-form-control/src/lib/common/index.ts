import { DateInputPipe } from './date-input.pipe';
import { FileInputPipe } from './file-input.pipe';
import { NumberInputPipe } from './number-input.pipe';
import { SelectInputPipe } from './select-input.pipe';
import { TextAreaInputPipe } from './text-area.input.pipe';
import { TextInputPipe } from './text-input.pipe';
import { TimeInputPipe } from './time-input.pipe';
import { TrustHTMLPipe } from './safe-html.pipe';
import { IncludesPipe } from './includes.pipe';
import { DefinedPipe } from './defined.pipe';
import { NoAutoCompleteDirective } from './auto-complete-off.directive';
import { AcceptFilePipe, IntMax, IsDisabled, IsObjectPipe, RequiredPipe } from './utils';


export const SHARED_PIPES = [DateInputPipe, FileInputPipe, NumberInputPipe, SelectInputPipe, TextAreaInputPipe, TextInputPipe, TimeInputPipe, TrustHTMLPipe, IncludesPipe, DefinedPipe, IsObjectPipe, AcceptFilePipe, RequiredPipe, IsDisabled, IntMax] as const;
export const SHARED_DIRECTIVES = [NoAutoCompleteDirective] as const;