import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ContentChild,
  EmbeddedViewRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { RefType, ViewRefFactory } from '../types';
import { AbstractControl, FormGroup } from '@angular/forms';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { BUTTON_DIRECTIVES } from '../buttons';
import { PIPES } from '../../pipes';
import { COMMON_PIPES } from '@azlabsjs/ngx-common';
import { ModalDirective } from '../modal';

/** @internal */
type ContextType = {
  formgroup: AbstractControl;
  autoupload: boolean;
  inputs: InputConfigInterface[];
  remove: (event: Event) => void;
  destroy: Observable<number>;
};

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ...COMMON_PIPES,
    ...BUTTON_DIRECTIVES,
    ...PIPES,
    // ...MODAL_DIRECTIVES,
  ],
  selector: 'ngx-table-form',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class NgxTableForm
  implements AfterViewInit, ViewRefFactory<EmbeddedViewRef<any>>, OnDestroy
{
  //#region component inputs
  @Input({ alias: 'inputs' }) configs: InputConfigInterface[] = [];
  @Input({ alias: 'auto-upload' }) autoupload: boolean = true;
  @Input({ alias: 'template' }) view!: TemplateRef<any>;
  @Input({ required: true }) detached!: AbstractControl[];
  @Input() title!: string;
  @Input() modal!: ModalDirective;
  @Input() name!: string;
  //#endregion

  //#region component output
  @Output() removed = new EventEmitter<RefType<EmbeddedViewRef<any>>>();
  //#endregion

  //#region component properties
  @ViewChild('container', { read: ViewContainerRef, static: false })
  containerRef!: ViewContainerRef;
  @ViewChild('template', { static: false }) templateRef!: TemplateRef<any>;
  private destroy$ = new Subject<void>();
  //#endregion

  createView(index: number, formgroup: AbstractControl) {
    const subject = new Subject<number>();
    const inputs = [...this.configs];

    // case a modal component is provided we open the modal and pass required input configuration to it
    if (this.modal) {
      this.modal.formgroup = formgroup as FormGroup;
      this.modal.input = inputs;
      this.modal.autoupload = this.autoupload;
      this.modal.title = this.title;
      this.modal.detached = this.detached;
      this.modal.view = this.view;
      this.modal.name = this.name;
      this.modal.stateChanged();
      this.modal.open();
    }

    const element = this.containerRef?.createEmbeddedView<ContextType>(
      this.templateRef,
      {
        formgroup,
        autoupload: this.autoupload,
        inputs,
        remove: (e: Event) => {
          e?.preventDefault();
          ref?.destroy();
          subject.next(ref.index);
        },
        destroy: subject.asObservable(),
      }
    );
    const ref: RefType<EmbeddedViewRef<any>> = {
      index,
      element,
      destroy: () => element.destroy(),
    };

    element.context.destroy
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.removed.emit(ref));

    return ref;
  }

  clear(): void {
    this.containerRef?.clear();
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
