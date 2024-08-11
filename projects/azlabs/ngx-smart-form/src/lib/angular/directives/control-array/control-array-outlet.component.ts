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
import { AbstractControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
import { BUTTON_DIRECTIVES } from '../buttons';
import { NgxSmartFormControlArrayItemComponent } from './control-array-item.component';

@Component({
  standalone: true,
  imports: [CommonModule, ...BUTTON_DIRECTIVES, ...PIPES],
  selector: 'ngx-form-control-array-outlet',
  templateUrl: './control-array-outlet.component.html',
  styleUrls: ['./control-array-outlet.component.scss'],
})
export class NgxFormControlArrayOutletComponent
  implements
    OnDestroy,
    ViewRefFactory<ComponentRef<NgxSmartFormControlArrayItemComponent>>
{
  //#region Component inputs
  @Input({ required: true }) inputConfig!: InputConfigInterface;
  @Input({ alias: 'auto-upload' }) autoupload: boolean = true;
  @Input({ required: true }) template!: TemplateRef<any>;
  //#endregion Component inputs

  //#region Component output
  @Output() removed = new EventEmitter<
    RefType<ComponentRef<NgxSmartFormControlArrayItemComponent>>
  >();
  //#endregion Component output

  //#region Component properties
  @ViewChild('container', { read: ViewContainerRef, static: false })
  containerRef!: ViewContainerRef;
  private destroy$ = new Subject<void>();
  //#endregion Component properties

  createView(index: number, input: AbstractControl) {
    const element = this.containerRef?.createComponent(
      NgxSmartFormControlArrayItemComponent
    );
    // Initialize child component input properties
    element.instance.inputConfig = { ...this.inputConfig };
    element.instance.control = input;
    element.instance.template = this.template;
    element.instance.autoupload = this.autoupload;
    element.instance.index = index;
    // Ends child component properties initialization

    const ref: RefType<ComponentRef<NgxSmartFormControlArrayItemComponent>> = {
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
