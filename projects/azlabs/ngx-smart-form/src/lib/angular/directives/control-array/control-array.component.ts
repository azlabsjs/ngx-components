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
import { AbstractControl, FormArray } from '@angular/forms';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
import { Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil, tap } from 'rxjs/operators';
import { cloneAbstractControl } from '../../helpers';
import { AngularReactiveFormBuilderBridge } from '../../types';
import { ANGULAR_REACTIVE_FORM_BRIDGE } from '../../tokens';
import { CommonModule } from '@angular/common';
import { BUTTON_DIRECTIVES } from '../buttons';
import { RefType, ViewRefFactory } from '../types';
import { NgxFormControlArrayOutletComponent } from './control-array-outlet.component';
import { PIPES } from '../../pipes';
import { Optional } from './types';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    NgxFormControlArrayOutletComponent,
    ...BUTTON_DIRECTIVES,
    ...PIPES,
  ],
  selector: 'ngx-smart-form-control-array',
  templateUrl: './control-array.component.html',
  styles: [
    `
    .add-button {
      display: inline-block;
      margin: 0;
      margin-top: var(--table-footer-v-margin, 16px);
      margin-bottom: var(--table-footer-v-margin, 16px);
    }
`
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxSmartFormControlArrayComponent implements AfterContentInit, OnDestroy {
  @Input({ alias: 'formArray' }) array!: FormArray;
  @Input('no-grid-layout') nogridlayout = false;
  @Input('add-button') addButtonRef: Optional<TemplateRef<any>>;
  @Input() template: Optional<TemplateRef<any>>;
  @Input() name!: string;
  @Input() autoupload = true;
  @Input() config!: InputConfigInterface;
  @Input({ required: true }) detached!: AbstractControl[];

  @Output() listChange = new EventEmitter<number>();
  @Output('item-removed') _removed = new EventEmitter<{ index: number, control: AbstractControl }>();

  @ViewChild('container', { static: false }) viewFactory!: ViewRefFactory<any>;

  private refs: RefType<unknown>[] = [];
  private destroy$ = new Subject<void>();
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

  add(event: Event) {
    const input = this.builder.control(this.config);
    this.array.push(cloneAbstractControl(input));
    event.preventDefault();
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
        refs.push(this.viewFactory.createView(i, element));
        continue;
      }
      this.viewFactory.updateView(this.refs[i], array.at(i));
    }

    if (refs.length > 0) {
      this.refs = this.refs.concat(...refs);
    }
  }
}
