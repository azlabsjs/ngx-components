import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
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
import { AbstractControl } from '@angular/forms';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { BUTTON_DIRECTIVES } from '../buttons';
import { PIPES } from '../../pipes';
import { COMMON_PIPES } from '@azlabsjs/ngx-common';

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
  imports: [CommonModule, ...COMMON_PIPES, ...BUTTON_DIRECTIVES, ...PIPES],
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

  createView(index: number, input: AbstractControl) {
    const subject = new Subject<number>();
    const element = this.containerRef?.createEmbeddedView<ContextType>(
      this.templateRef,
      {
        formgroup: input,
        autoupload: this.autoupload,
        inputs: [...this.configs],
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
