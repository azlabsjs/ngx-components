import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { InputInterface } from '../../../core';
import { cloneAbstractControl } from '../../helpers';
import {
  AngularReactiveFormBuilderBridge,
  ANGULAR_REACTIVE_FORM_BRIDGE,
} from '../../types';
import { NgxSmartFormArrayChildComponent } from './ngx-smart-form-array-child.component';

@Component({
  selector: 'ngx-smart-form-array',
  templateUrl: './ngx-smart-form-array.component.html',
  styles: [
    `
      .ngx__smart_form_array__button svg path {
        fill: #fff;
      }

      .ngx__smart_form_array__button {
        margin: 16px 0 auto 0;
        cursor: pointer;
        width: 32px;
        height: 32px;
        background: #0072a3;
        box-shadow: 1px 1px 1px rgb(114, 110, 110);
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
      }

      .ngx__smart_form_array__button:hover {
        background: #004b6b;
        box-shadow: 1px 1px 1px rgb(68, 64, 64);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxSmartFormArrayComponent implements OnInit, OnDestroy {
  //#region Component inputs definitions
  @Input() formArray!: FormArray;
  private _controls!: InputInterface[];
  @Input() set controls(value: InputInterface | InputInterface[]) {
    this._controls = Array.isArray(value)
      ? value
      : [value].filter(
          (current) => typeof current !== 'undefined' && current !== null
        );
  }
  get controls() {
    return this._controls;
  }
  @Input() template!: TemplateRef<any>;
  @Input() addGroupRef!: TemplateRef<Node>;
  @Input() name!: string;
  //#endregion Component inputs definitions

  //@internal
  private formGroup!: FormGroup;
  @ViewChild('container', { read: ViewContainerRef, static: true })
  viewContainerRef!: ViewContainerRef;

  private _destroy$ = new Subject<void>();
  private childCount = 0;
  private children: ComponentRef<NgxSmartFormArrayChildComponent>[] = [];

  //#region Component outputs
  @Output() listChange = new EventEmitter<number>();
  @Output() formArrayChange = new EventEmitter<any[]>();
  //#endregion Component outputs

  // Component instance initializer
  constructor(
    @Inject(ANGULAR_REACTIVE_FORM_BRIDGE)
    private builder: AngularReactiveFormBuilderBridge
  ) {}

  ngOnInit(): void {
    this.formGroup = this.builder.group(this._controls) as FormGroup;
    if (this.formArray.getRawValue().length === 0) {
      this.addNewComponent(this.childCount);
    } else {
      // Add elements
      let index = 0;
      for (const control of this.formArray.controls) {
        this.addComponent(control as FormGroup, index);
        index++;
      }
    }

    // Simulate form array
    this.formArray.valueChanges
      .pipe(tap((state) => this.formArrayChange.emit(state)))
      .subscribe();
  }

  onTemplateButtonClicked(event: Event) {
    this.childCount++;
    this.addNewComponent(this.childCount);
    event.preventDefault();
  }

  // tslint:disable-next-line: typedef
  addNewComponent(index: number) {
    const formGroup = cloneAbstractControl(this.formGroup) as FormGroup;
    this.addComponent(formGroup, index);
    this.formArray.push(formGroup);
  }

  addComponent(formGroup: FormGroup, index: number) {
    const componentRef = this.viewContainerRef.createComponent(
      NgxSmartFormArrayChildComponent
    );
    formGroup.addControl('__FORM_ARRAY__INDEX__', new FormControl(index));
    // Initialize child component input properties
    componentRef.instance.controls = [...this._controls];
    componentRef.instance.formGroup = formGroup;
    componentRef.instance.template = this.template;
    componentRef.instance.formGroup.addControl('index', new FormControl(index));
    // Ends child component properties initialization

    componentRef.instance.componentDestroyer
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        if (this.childCount > 0) {
          componentRef.destroy();
          this.childCount -= 1;
          // Remove the elment from the list of reference components
          this.children = this.children.filter(
            (component: ComponentRef<NgxSmartFormArrayChildComponent>) => {
              return component.instance === componentRef.instance
                ? false
                : true;
            }
          );
          this.formArray.removeAt(
            componentRef.instance.formGroup.getRawValue()[
              '__FORM_ARRAY__INDEX__'
            ]
          );
          this.listChange.emit(this.childCount);
        } else {
          componentRef.instance.formGroup.reset();
          this.formArray.updateValueAndValidity();
        }
      });
    this.children.push(componentRef);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }
}
