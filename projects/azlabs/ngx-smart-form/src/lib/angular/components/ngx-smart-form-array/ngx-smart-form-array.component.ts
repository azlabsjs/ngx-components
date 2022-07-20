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
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
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
  private _controls!: InputConfigInterface[];
  @Input() set controls(value: InputConfigInterface | InputConfigInterface[]) {
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
  private _autoupload: boolean = false;
  @Input() set autoupload(value: boolean) {
    this._autoupload = !!value;

    // update child component instance autoupload values
    this.componentRefs.forEach(ref => ref.instance.autoupload = this._autoupload);
  }
  private _submitupload: boolean = false;
  @Input() set submitupload(value: boolean) {
    this._submitupload = !!value;
    // update child component instance submitupload values
    this.componentRefs.forEach(ref => ref.instance.submitupload = this._submitupload);
  }
  //#endregion Component inputs definitions

  //@internal
  private formGroup!: FormGroup;
  @ViewChild('container', { read: ViewContainerRef, static: true })
  viewContainerRef!: ViewContainerRef;

  private _destroy$ = new Subject<void>();
  private componentRefCount = 0;
  private componentRefs: ComponentRef<NgxSmartFormArrayChildComponent>[] = [];

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
      this.addNewComponent(this.componentRefCount);
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
    this.componentRefCount++;
    this.addNewComponent(this.componentRefCount);
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
    componentRef.instance.autoupload = this._autoupload;
    componentRef.instance.submitupload = this._submitupload;
    // Ends child component properties initialization

    componentRef.instance.componentDestroyer
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        if (this.componentRefCount > 0) {
          componentRef.destroy();
          this.componentRefCount -= 1;
          // Remove the elment from the list of reference components
          this.componentRefs = this.componentRefs.filter(
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
          this.listChange.emit(this.componentRefCount);
        } else {
          componentRef.instance.formGroup.reset();
          this.formArray.updateValueAndValidity();
        }
      });
    this.componentRefs.push(componentRef);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }
}
