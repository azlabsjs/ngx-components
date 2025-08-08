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
import { NgxArrayItemComponent } from './control-array-item.component';

@Component({
  standalone: true,
  imports: [CommonModule, ...BUTTON_DIRECTIVES, ...PIPES],
  selector: 'ngx-form-control-array-outlet',
  templateUrl: './control-array-outlet.component.html',
  styleUrls: ['./control-array-outlet.component.scss'],
})
export class NgxFormControlArrayOutletComponent
  implements OnDestroy, ViewRefFactory<ComponentRef<NgxArrayItemComponent>>
{
  //#region component inputs
  @Input({ required: true }) config!: InputConfigInterface;
  @Input({ alias: 'auto-upload' }) autoupload: boolean = true;
  @Input({ required: true }) template!: TemplateRef<any>;
  @Input({ required: true }) detached!: AbstractControl[];
  //#endregion

  //#region component output
  @Output() removed = new EventEmitter<
    RefType<ComponentRef<NgxArrayItemComponent>>
  >();
  //#endregion

  //#region component properties
  @ViewChild('container', { read: ViewContainerRef, static: false })
  container!: ViewContainerRef;
  private destroy$ = new Subject<void>();
  //#endregion

  createView(index: number, input: AbstractControl) {
    const e = this.container?.createComponent(NgxArrayItemComponent);

    e.instance.config = { ...this.config };
    e.instance.control = input;
    e.instance.template = this.template;
    e.instance.autoupload = this.autoupload;
    e.instance.index = index;
    e.instance.detached = this.detached;

    const ref: RefType<ComponentRef<NgxArrayItemComponent>> = {
      index: e.instance.index,
      element: e,
      destroy: () => e.destroy(),
    };

    e.instance.componentDestroyer
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        e?.destroy();
        this.removed.emit(ref);
      });

    return ref;
  }

  clear(): void {
    this.container?.clear();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
