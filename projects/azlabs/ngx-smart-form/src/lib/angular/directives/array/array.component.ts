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
import { distinctUntilChanged, filter, takeUntil, tap } from 'rxjs/operators';
import { cloneAbstractControl } from '../../helpers';
import { AngularReactiveFormBuilderBridge } from '../../types';
import { ANGULAR_REACTIVE_FORM_BRIDGE } from '../../tokens';
import { CommonModule } from '@angular/common';
import { BUTTON_DIRECTIVES } from '../buttons';
import { PIPES as BASE_PIPES } from '../../pipes';
import { NgxTableForm } from '../table';
import { NgxFormArrayOutletComponent } from './array-outlet.component';
import { RefType, ViewRefFactory } from '../types';
import { ModalDirective } from '../modal';
import { PIPES } from './pipes';
import { Optional } from './types';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    NgxTableForm,
    NgxFormArrayOutletComponent,
    ...BUTTON_DIRECTIVES,
    ...BASE_PIPES,
    ...PIPES,
  ],
  selector: 'ngx-smart-form-array',
  templateUrl: './array.component.html',
  styleUrls: ['./array.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxSmartFormArrayComponent implements AfterContentInit, OnDestroy, AfterViewInit {
  @Input() autoupload = true;
  @Input() modal!: ModalDirective;
  @Input() detached!: AbstractControl[];
  @Input() template!: TemplateRef<any>;
  @Input() label!: Optional<TemplateRef<any>>;
  @Input() description!: Optional<string>;
  @Input() name!: string;
  @Input() title!: string;
  /** @deprecated */
  @Input() placeholder!: Optional<string>;
  @Input({ alias: 'add-button' }) addref!: Optional<TemplateRef<Node>>;
  @Input({ alias: 'controls' }) inputs!: InputConfigInterface[];

  private _length = 0;
  @Input({ alias: 'formArray' }) array!: FormArray;
  @Input({ alias: 'no-grid-layout' }) noGridLayout = false;
  @Input({ alias: 'class', transform: (value: string | string[]) => (typeof value === 'string' ? [value] : value).map((v) => v.split(' ').map((i) => i.split(',')).flat().map((v) => v.trim())).flat() })
  cssClass!: string | string[];
  @Input() hidden: boolean = false;
  @Input({ alias: 'table-description' }) tabledescription!: Optional<TemplateRef<any>>;

  @Output() listChange = new EventEmitter<number>();
  @Output('item-removed') _removed = new EventEmitter<{ index: number, control: AbstractControl }>();

  @ViewChild('container', { static: false }) viewFactory!: ViewRefFactory<any>;

  _ref: number = 0;
  get refCount() {
    return this._ref;
  }
  private refs: RefType<unknown>[] = [];
  private destroy$ = new Subject<void>();
  private triggered = false;

  constructor(private cdRef: ChangeDetectorRef | null, @Inject(ANGULAR_REACTIVE_FORM_BRIDGE) private builder: AngularReactiveFormBuilderBridge) { }

  ngAfterViewInit(): void {
    // this.update(this.array.length);

    if (this.array) {
      this.array.valueChanges.pipe(takeUntil(this.destroy$), filter((items: any[]) => items.length !== 0 && items.length !== this._length), distinctUntilChanged(), tap((value: any[]) => this._length === value.length ), tap(value => console.log('ngAfterViewInit -> valueChanges', value))).subscribe();
    } else {
      console.log('No array');
    }
  }

  ngAfterContentInit(): void { }

  add(_: Event) {
    const g = this.builder.group(this.inputs);
    const clone = cloneAbstractControl(g) as FormGroup;
    this.triggered = true;
    this.array.push(clone);
  }

  removed<T>(ref: RefType<T>) {
    if (this._ref >= 0) {
      const index = this.refs.findIndex((c) => c.index === ref.index);
      if (index === -1) {
        return;
      }


      const control = this.array.at(index);
      this.refs.splice(index, 1);
      this.array.removeAt(index, { emitEvent: true });
      this.array.updateValueAndValidity();

      if (control) {
        control.clearAsyncValidators();
        control.clearValidators();
        control.updateValueAndValidity();
        // control.setParent(null); // we set current control parent to null to remove it from validation
        this._removed.emit({ index, control });
      }

      console.log(this.array, this.array.getRawValue());
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  private update(length: number) {
    const count = length - this._ref;
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const index = this._ref + i;
        const view = this.viewFactory.createView(index, this.array.at(index), this.triggered);
        this.refs.push(view);
      }
      this.setRefCount(this._ref + count);
    }

    if (count < 0) {
      const refCount = this._ref > 0 ? this._ref - 1 : 0;
      this.setRefCount(refCount);
      this.listChange.emit(refCount);
    }

    // set the tiggered value to false after each update call to reset it state
    this.triggered = false;
  }

  private setRefCount(value: number) {
    this._ref = value;
    this.cdRef?.markForCheck();
  }
}
