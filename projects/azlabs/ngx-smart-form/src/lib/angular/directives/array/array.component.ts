import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { cloneAbstractControl } from '../../helpers';
import { AngularReactiveFormBuilderBridge } from '../../types';
import { ANGULAR_REACTIVE_FORM_BRIDGE } from '../../tokens';
import { CommonModule } from '@angular/common';
import { BUTTON_DIRECTIVES } from '../buttons';
import { PIPES } from '../../pipes';
import { NgxTableForm } from '../table';
import { NgxFormArrayOutletComponent } from './array-outlet.component';
import { RefType, ViewRefFactory } from '../types';
import { ModalDirective } from '../modal';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    NgxTableForm,
    NgxFormArrayOutletComponent,
    ...BUTTON_DIRECTIVES,
    ...PIPES,
  ],
  selector: 'ngx-smart-form-array',
  templateUrl: './array.component.html',
  styleUrls: ['./array.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxSmartFormArrayComponent
  implements AfterContentInit, OnDestroy, AfterViewInit
{
  //#region component inputs definitions
  @Input() modal!: ModalDirective;
  @Input() detached!: AbstractControl[];
  @Input() template!: TemplateRef<any>;
  @Input() addGroupRef!: TemplateRef<Node>;
  @Input() name!: string;
  @Input() title!: string;
  @Input() autoupload: boolean = true;
  @Input({ alias: 'controls' }) inputs!: InputConfigInterface[];
  @Input({ alias: 'formArray' }) array!: FormArray;
  @Input({ alias: 'no-grid-layout' }) noGridLayout = false;
  @Input({
    alias: 'class',
    transform: (value: string | string[]) => {
      const classes = typeof value === 'string' ? [value] : value;
      return classes
        .map((v) =>
          v
            .split(' ')
            .map((i) => i.split(','))
            .flat()
            .map((v) => v.trim())
        )
        .flat();
    },
  })
  cssClass!: string | string[];
  //#endregion

  //#region component outputs
  @Output() listChange = new EventEmitter<number>();
  //#endregion

  // #region View children
  @ViewChild('container', { static: false })
  viewFactory!: ViewRefFactory<any>;
  // #endregion

  // #region component properties
  _ref = 0;
  get refCount() {
    return this._ref;
  }
  private refs: RefType<unknown>[] = [];
  private destroy$ = new Subject<void>();
  // #endregion

  // component instance initializer
  constructor(
    private cdRef: ChangeDetectorRef | null,
    @Inject(ANGULAR_REACTIVE_FORM_BRIDGE)
    private builder: AngularReactiveFormBuilderBridge
  ) {}

  ngAfterViewInit(): void {
    this.update.bind(this).call(null);
  }

  ngAfterContentInit(): void {
    this.array.valueChanges
      .pipe(takeUntil(this.destroy$), tap(this.update.bind(this)))
      .subscribe();
  }

  add(event: Event) {
    const g = this.builder.group(this.inputs);
    const clone = cloneAbstractControl(g) as FormGroup;
    this.array.push(clone);
    event.preventDefault();
  }

  removed<T>(ref: RefType<T>) {
    if (this._ref >= 0) {
      const index = this.refs.findIndex((c) => {
        return c.index === ref.index;
      });
      if (index === -1) {
        return;
      }
      this.refs.splice(index, 1);
      this.array.removeAt(index, { emitEvent: true });
      this.array.updateValueAndValidity();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  private update() {
    const length = this.array.controls.length;
    const count = length - this._ref;
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const index = this._ref + i;
        const { viewFactory: factory } = this;
        const view = factory.createView(index, this.array.at(index));
        this.refs.push(view);
      }
      this.setRefCount(this._ref + count);
    }

    if (count < 0) {
      const refCount = this._ref > 0 ? this._ref - 1 : 0;
      this.setRefCount(refCount);
      this.listChange.emit(refCount);
    }
  }

  private setRefCount(value: number) {
    this._ref = value;
    this.cdRef?.markForCheck();
  }
}
