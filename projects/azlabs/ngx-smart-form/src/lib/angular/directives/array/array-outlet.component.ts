import { CommonModule } from '@angular/common';
import {
  Component,
  ComponentRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { PIPES } from '../../pipes';
import { RefType, ViewRefFactory } from '../types';
import { AbstractControl, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
import { NgxSmartFormArrayItemComponent } from './array-item.component';
import { BUTTON_DIRECTIVES } from '../buttons';

@Component({
  standalone: true,
  imports: [CommonModule, ...BUTTON_DIRECTIVES, ...PIPES],
  selector: 'ngx-form-array-outlet',
  templateUrl: './array-outlet.component.html',
  styleUrls: ['./array-outlet.component.scss'],
})
export class NgxFormArrayOutletComponent
  implements
    OnDestroy,
    ViewRefFactory<ComponentRef<NgxSmartFormArrayItemComponent>>
{
  //#region input properties
  @Input() inputs: InputConfigInterface[] = [];
  @Input({ alias: 'auto-upload' }) autoupload: boolean = true;
  @Input({ alias: 'no-grid-layout' }) noGridLayout = true;
  @Input() template!: TemplateRef<any>;
  @Input({ required: true }) detached!: AbstractControl[];
  //#endregion

  //#region output properties
  @Output() removed = new EventEmitter<
    RefType<ComponentRef<NgxSmartFormArrayItemComponent>>
  >();
  //#endregion

  //#region local properties
  @ViewChild('container', { read: ViewContainerRef, static: false })
  containerRef!: ViewContainerRef;
  private destroy$ = new Subject<void>();
  //#endregion

  createView(index: number, input: AbstractControl) {
    const element = this.containerRef?.createComponent(
      NgxSmartFormArrayItemComponent
    );

    element.instance.controls = [...this.inputs];
    element.instance.formGroup = input as FormGroup;
    element.instance.template = this.template;
    element.instance.autoupload = this.autoupload;
    element.instance.index = index;
    element.instance.noGridLayout = this.noGridLayout;
    element.instance.detached = this.detached;

    const ref: RefType<ComponentRef<NgxSmartFormArrayItemComponent>> = {
      index: element.instance.index,
      element,
      destroy: () => element.destroy(),
    };

    element.instance.componentDestroyer
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        element?.destroy();
        this.removed.emit(ref);
      });

    return ref;
  }

  clear(): void {
    this.containerRef?.clear();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
