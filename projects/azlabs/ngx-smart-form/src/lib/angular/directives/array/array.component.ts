import {
  AfterContentInit,
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
export class NgxSmartFormArrayComponent implements OnDestroy, AfterContentInit {
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

  @Input({ alias: 'formArray' }) array!: FormArray;
  @Input({ alias: 'no-grid-layout' }) noGridLayout = false;
  @Input({ alias: 'class', transform: (value: string | string[]) => (typeof value === 'string' ? [value] : value).map((v) => v.split(' ').map((i) => i.split(',')).flat().map((v) => v.trim())).flat() })
  cssClass!: string | string[];
  @Input() hidden: boolean = false;
  @Input({ alias: 'table-description' }) tabledescription!: Optional<TemplateRef<any>>;

  @Output() listChange = new EventEmitter<number>();
  @Output('item-removed') _removed = new EventEmitter<{ index: number, control: AbstractControl }>();
  @ViewChild('container', { static: false }) viewFactory!: ViewRefFactory<any>;

  private refs: RefType<unknown>[] = [];
  private destroy$ = new Subject<void>();
  private triggered = false;
  protected capacity = 0;

  constructor(private cdRef: ChangeDetectorRef | null, @Inject(ANGULAR_REACTIVE_FORM_BRIDGE) private builder: AngularReactiveFormBuilderBridge) { }

  ngAfterContentInit(): void {
    if (this.array) {
      this.array.valueChanges.pipe(takeUntil(this.destroy$), distinctUntilChanged()).subscribe((values) => {
        const cap0 = this.capacity;
        this.capacity = values.length;
        if (this.capacity !== cap0) {
          this.update(this.array);
        }
      });
    }
  }

  add(_: Event) {
    const g = this.builder.group(this.inputs);
    const clone = cloneAbstractControl(g) as FormGroup;
    this.triggered = true;
    this.array.push(clone);
  }

  removed<T>(ref: RefType<T>) {
    if (this.capacity >= 0) {
      const index = this.refs.findIndex((c) => c.index === ref.index);
      if (index === -1) {
        return;
      }

      const control = this.array.at(index);
      this.refs.splice(index, 1);
      this.capacity -= 1;
      this.array.removeAt(index, { emitEvent: true }); // this will set _parent property null on the removed control
      this.array.updateValueAndValidity();

      if (control) {
        control.clearAsyncValidators();
        control.clearValidators();
        control.setErrors(null); // remove any errors on the control to make it valid
        control.updateValueAndValidity();
        this._removed.emit({ index, control });
      }

      this.cdRef?.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  private update(array: FormArray) {
    const length = array.controls.length;
    const max = this.refs.length - 1;
    const refs = []; //# if supported by javascript create a fixed size array

    for (let i = 0; i < length; i++) {
      const element = array.at(i);
      if (i > max) {
        refs.push(this.viewFactory.createView(i, element, this.triggered));
        continue;
      }
      this.viewFactory.updateView(this.refs[i], array.at(i));
    }

    if (refs.length > 0) {
      this.refs = this.refs.concat(...refs);
    }

    this.triggered = false;
  }
}
