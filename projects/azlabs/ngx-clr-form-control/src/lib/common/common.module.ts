import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DateInputPipe } from './date-input.pipe';
import { FileInputPipe } from './file-input.pipe';
import { NumberInputPipe } from './number-input.pipe';
import { SelectInputPipe } from './select-input.pipe';
import { TextAreaInputPipe } from './text-area.input.pipe';
import { TextInputPipe } from './text-input.pipe';
import { TimeInputPipe } from './time-input.pipe';
import { TranslatePipe } from './translate.pipe';
import { TrustHTMLPipe } from './safe-html.pipe';
import { IncludesPipe } from './includes.pipe';
import { DefinedPipe } from './defined.pipe';
import { JoinPipe } from './join.pipe';
import { IsObjectPipe } from './is-object.pipe';
import { NoAutoCompleteDirective } from './auto-complete-off.directive';

@NgModule({
  imports: [
    CommonModule,
    DateInputPipe,
    FileInputPipe,
    NumberInputPipe,
    SelectInputPipe,
    TextAreaInputPipe,
    TextInputPipe,
    TimeInputPipe,
    TranslatePipe,
    TrustHTMLPipe,
    IncludesPipe,
    DefinedPipe,
    JoinPipe,
    IsObjectPipe,
    NoAutoCompleteDirective,
  ],
  exports: [
    DateInputPipe,
    FileInputPipe,
    NumberInputPipe,
    SelectInputPipe,
    TextAreaInputPipe,
    TextInputPipe,
    TimeInputPipe,
    TranslatePipe,
    TrustHTMLPipe,
    IncludesPipe,
    DefinedPipe,
    JoinPipe,
    IsObjectPipe,
    NoAutoCompleteDirective,
    CommonModule
  ],
})
export class NgxCommonModule {}
