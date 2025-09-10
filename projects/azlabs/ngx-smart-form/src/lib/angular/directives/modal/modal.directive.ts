import {
  Directive,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';

/** @description modal size type declaration */
export type SizeType = 'sm' | 'md' | 'lg' | 'xl' | 'full';

@Directive({
  standalone: true,
  selector: '[ngxformmodal]',
})
export class ModalDirective {
  //#region directive inputs
  @Input() formgroup!: FormGroup;
  @Input() input!: InputConfigInterface[];
  @Input() autoupload!: boolean;
  @Input() title!: string;
  @Input() detached!: AbstractControl[];
  @Input() view!: TemplateRef<any>;
  //#endregion

  //#region directive outputs
  @Output() stateChange = new EventEmitter<void>();
  @Output() closeChange = new EventEmitter<void>();
  @Output() openChange = new EventEmitter<void>();
  @Output() sizeChange = new EventEmitter<SizeType>();
  //#endregion

  close() {
    this.closeChange.emit();
  }

  open() {
    this.openChange.emit();
  }

  resize(size: SizeType) {
    this.sizeChange.emit(size);
  }

  stateChanged() {
    this.stateChange.emit();
  }
}
