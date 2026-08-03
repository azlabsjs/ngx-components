import {
  Directive,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
import { ComponentReactiveFormHelpers } from '../../helpers';

/** @description modal size type declaration */
export type SizeType = 'sm' | 'md' | 'lg' | 'xl' | 'full';

@Directive({
  standalone: true,
  selector: '[ngxformmodal]',
  exportAs: 'formmodal',
})
export class ModalDirective {
  @Input() formgroup!: FormGroup;
  @Input() inputs!: InputConfigInterface[];
  @Input() autoupload!: boolean;
  @Input() title!: string;
  @Input() detached!: AbstractControl[];
  @Input() name!: string;
  @Input() view!: TemplateRef<any>;
  @Input() label!: TemplateRef<any>;

  @Output() stateChange = new EventEmitter<void>();
  @Output() closeChange = new EventEmitter<void>();
  @Output() openChange = new EventEmitter<void>();
  @Output() sizeChange = new EventEmitter<SizeType>();

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

  validate() {
    ComponentReactiveFormHelpers.validateFormGroupFields(this.formgroup);
  }
}
