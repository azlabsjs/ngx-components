import { CommonModule } from '@angular/common';
import {
  Component,
  ComponentRef,
  EventEmitter,
  Injector,
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
import { withRefetchObservable } from '../../helpers';
import { Optional } from './types';

// @internal
type ComponentRefType = RefType<ComponentRef<NgxSmartFormArrayItemComponent>>;

@Component({
  standalone: true,
  imports: [CommonModule, ...BUTTON_DIRECTIVES, ...PIPES],
  selector: 'ngx-form-array-outlet',
  templateUrl: './array-outlet.component.html',
  styleUrls: ['./array-outlet.component.scss'],
})
export class NgxFormArrayOutletComponent implements OnDestroy, ViewRefFactory<ComponentRef<NgxSmartFormArrayItemComponent>> {

  @Input() name!: string;
  //
  _addref!: Optional<TemplateRef<any>>;
  @Input() set addref(value: Optional<TemplateRef<any>>) {
    this._addref = value;

    for (const ref of this.componentRefs) {
      ref.instance.addref = value;
      ref.changeDetectorRef.markForCheck();
    }
  }
  get addref() {
    return this._addref;
  }

  _label!: Optional<TemplateRef<any>>;
  @Input() set label(value: Optional<TemplateRef<any>>) {
    this._label = value;

    for (const ref of this.componentRefs) {
      ref.instance.label = value;
      ref.changeDetectorRef.markForCheck();
    }
  }
  get label() {
    return this._label;
  }

  _nogridlayout!: boolean;
  @Input({ alias: 'no-grid-layout' }) set nogridlayout(value: boolean) {
    this._nogridlayout = value;
    if (!value) {
      return;
    }

    for (const ref of this.componentRefs) {
      ref.instance.nogridlayout = value;
      ref.changeDetectorRef.markForCheck();
    }
  }
  get nogridlayout() {
    return this._nogridlayout;
  }


  _template!: Optional<TemplateRef<any>>;
  @Input({ alias: 'template' }) set template(value: Optional<TemplateRef<any>>) {
    this._template = value;
    if (!value) {
      return;
    }

    for (const ref of this.componentRefs) {
      ref.instance.template = value;
      ref.changeDetectorRef.markForCheck();
    }
  }
  get template() {
    return this._template;
  }

  _inputs: InputConfigInterface[] = [];
  @Input() set inputs(value: InputConfigInterface[]) {
    this._inputs = value;
    for (const ref of this.componentRefs) {
      ref.instance.controls = withRefetchObservable([...this.inputs], ref.instance.formgroup, this.name);
      ref.changeDetectorRef.markForCheck();
    }
  }
  get inputs() {
    return this._inputs;
  }

  _autoupload: boolean = true;
  @Input({ alias: 'auto-upload' }) set autoupload(value: boolean) {
    this._autoupload = value;

    for (const ref of this.componentRefs) {
      ref.instance.autoupload = value;
      ref.changeDetectorRef.markForCheck();
    }
  }
  get autoupload() {
    return this._autoupload;
  }

  _detached: Optional<AbstractControl[]> = [];
  @Input() set detached(value: Optional<AbstractControl[]>) {
    this._detached = value;
    for (const ref of this.componentRefs) {
      ref.instance.detached = value ?? [];
      ref.changeDetectorRef.markForCheck();
    }
  }
  get detached() {
    return this._detached;
  }


  @Output() removed = new EventEmitter<ComponentRefType>();

  @ViewChild('container', { read: ViewContainerRef, static: false }) _container!: ViewContainerRef;

  private destroy$ = new Subject<void>();
  private componentRefs: ComponentRef<NgxSmartFormArrayItemComponent>[] = [];


  constructor(private injector: Injector) { }

  createView(index: number, input: AbstractControl) {
    const element = this._container?.createComponent(NgxSmartFormArrayItemComponent, { index, injector: this.injector });
    this.componentRefs.push(element);

    const formgroup = input as FormGroup;
    element.instance.controls = withRefetchObservable([...this.inputs], formgroup, this.name);
    if (this.template) {
      element.instance.template = this.template;
    }

    element.instance.formgroup = formgroup;
    element.instance.autoupload = this.autoupload;
    element.instance.index = index;
    element.instance.nogridlayout = this.nogridlayout;
    element.instance.detached = this.detached ?? [];
    element.instance.label = this.label;
    element.instance.addref = this.addref;

    const ref: ComponentRefType = { index, element, destroy: () => element.destroy() };
    element.instance.componentDestroyer
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        element?.destroy();
        this.removed.emit(ref);
      });

    return ref;
  }

  updateView(ref: RefType<ComponentRef<NgxSmartFormArrayItemComponent>>, element: AbstractControl): void {
    ref.element.instance.formgroup = element as FormGroup;
    ref.element.changeDetectorRef.detectChanges();
  }

  clear(): void {
    for (const element of this.componentRefs) {
      element.destroy();
    }

    this.componentRefs = [];
    this._container?.clear();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
