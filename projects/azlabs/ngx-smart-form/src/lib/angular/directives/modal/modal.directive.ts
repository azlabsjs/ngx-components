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

  /** @deprecated */
  @Output() stateChange = new EventEmitter<void>();
  /** @deprecated listen for close event intead */
  @Output() closeChange = new EventEmitter<boolean>();
  @Output() openChange = new EventEmitter<boolean>();
  @Output() sizeChange = new EventEmitter<SizeType>();
  @Output() closed = new EventEmitter<void>();
  @Output() opened = new EventEmitter<void>();

  close() {
    this.closeChange.emit();
  }

  open() {
    this.openChange.emit(true);
    this.opened.emit();
  }

  openChanged(value: boolean) {
    if(value === true) {
      this.opened.emit();
    } else {
      this.closed.emit();
    }
  }

  resize(size: SizeType) {
    this.sizeChange.emit(size);
  }

  /** @deprecated */
  stateChanged() {
    this.stateChange.emit();
  }


  validate() {
    ComponentReactiveFormHelpers.validateFormGroupFields(this.formgroup);
  }
}
