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
import { Optional } from './types';

@Component({
  standalone: true,
  imports: [CommonModule, ...BUTTON_DIRECTIVES, ...PIPES],
  selector: 'ngx-form-control-array-outlet',
  templateUrl: './control-array-outlet.component.html',
  styleUrls: ['./control-array-outlet.component.scss'],
})
export class NgxFormControlArrayOutletComponent implements OnDestroy, ViewRefFactory<ComponentRef<NgxArrayItemComponent>> {
  _template!: Optional<TemplateRef<any>>;
  @Input() set template(value: Optional<TemplateRef<any>>) {
    this._template = value;
    for (const ref of this.componentRefs) {
      ref.instance.template = value;
      ref.changeDetectorRef.markForCheck();
    }
  }

  _config!: InputConfigInterface;
  @Input() set config(value: InputConfigInterface) {
    this._config = value;
    for (const ref of this.componentRefs) {
      ref.instance.config = {...value};
      ref.changeDetectorRef.markForCheck();
    }
  }

  _autoupload: boolean = true;
  @Input({ alias: 'auto-upload' }) set autoupload(value: boolean) {
    this._autoupload = value;
    for (const ref of this.componentRefs) {
      ref.instance.autoupload = value;
      ref.changeDetectorRef.markForCheck();
    }
  }

  _detached!: Optional<AbstractControl[]>;
  @Input() set detached(value: Optional<AbstractControl[]>) {
    this._detached = value;
    for (const ref of this.componentRefs) {
      ref.instance.detached = value;
      ref.changeDetectorRef.markForCheck();
    }
  }

  @Output() removed = new EventEmitter<RefType<ComponentRef<NgxArrayItemComponent>>>();

  @ViewChild('container', { read: ViewContainerRef, static: false }) container!: ViewContainerRef;
  private destroy$ = new Subject<void>();
  private componentRefs: ComponentRef<NgxArrayItemComponent>[] = [];

  createView(index: number, input: AbstractControl) {
    const e = this.container?.createComponent(NgxArrayItemComponent);
    this.componentRefs.push(e);

    e.instance.config = { ...this._config };
    e.instance.control = input;
    e.instance.template = this._template;
    e.instance.autoupload = this._autoupload;
    e.instance.index = index;
    e.instance.detached = this._detached;

    const ref: RefType<ComponentRef<NgxArrayItemComponent>> = {
      index: e.instance.index,
      element: e,
      destroy: () => e.destroy(),
    };

    e.instance.destroy
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        e?.destroy();
        this.removed.emit(ref);
      });

    return ref;
  }

  updateView(ref: RefType<ComponentRef<NgxArrayItemComponent>>, element: AbstractControl): void {
    ref.element.instance.control = element;
    ref.element.changeDetectorRef.detectChanges();
  }

  clear(): void {
    for (const element of this.componentRefs) {
      element.destroy();
    }

    this.componentRefs = [];
    this.container?.clear();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
