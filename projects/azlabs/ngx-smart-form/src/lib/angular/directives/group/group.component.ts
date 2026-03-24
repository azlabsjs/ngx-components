import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { PIPES } from '../../pipes';
import { ANGULAR_REACTIVE_FORM_BRIDGE } from '../../tokens';
import { AngularReactiveFormBuilderBridge } from '../../types';

@Component({
  standalone: true,
  imports: [CommonModule, ...PIPES],
  selector: 'ngx-smart-form-group',
  templateUrl: './group.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxSmartFormGroupComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
  //#region Component inputs definitions
  private _formGroup!: FormGroup;
  @Input({ alias: 'formGroup' }) set setFormGroup(value: FormGroup) {
    this._formGroup = value;
  }
  get formGroup() {
    return this._formGroup;
  }
  private _inputs!: InputConfigInterface[];
  @Input({ alias: 'controls' }) set setinput(value: InputConfigInterface[]) {
    this._inputs = value;
  }
  get inputs() {
    return this._inputs;
  }
  @Input() template!: TemplateRef<any>;
  @Input() autoupload: boolean = false;
  @Input({ alias: 'no-grid-layout' }) noGridLayout = false;
  @Input({required: true}) detached!: AbstractControl[];
  //#endregion

  //#region Component internal properties
  // @internal
  private _destroy$ = new Subject<void>();
  //#endregion Component internal properties

  //#region Component output
  @Output() formGroupChange = new EventEmitter<FormGroup>();
  //#endregion Component outputs

  /** @description smart form group component constructor */
  constructor(
    @Inject(ANGULAR_REACTIVE_FORM_BRIDGE)
    private builder: AngularReactiveFormBuilderBridge,
    private cdRef: ChangeDetectorRef
  ) {}

  //
  ngOnInit(): void {
    // Simulate formgroup changes
    this.formGroup.valueChanges
      .pipe(
        tap(() => this.formGroupChange.emit(this.formGroup)),
        takeUntil(this._destroy$)
      )
      .subscribe();
  }

  ngAfterViewInit(): void {
    this.registerControlChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('controls' in changes || 'formGroup' in changes) {
      this.registerControlChanges();
    }
  }

  registerControlChanges() {
    // unsubscribe from any previous subscription
    this._destroy$.next();

    // each time we listen for form controls changes, we query for
    // input binding and set input properties based on their binding value
    if (this._inputs && this.formGroup) {
      // TODO: fix bug and uncomment code below
      // const b = bindingsFactory(this._inputs)(this._formGroup);
      // const [g, _inputs] = setInputsProperties(
      //   this.builder,
      //   this._inputs,
      //   b,
      //   this._formGroup
      // );
      // // We update formgroup and inputs properties value and mark the component as dirty
      // this.setFormState(_inputs, g);

      // // Handle form control value changes
      // for (const n in this.formGroup.controls) {
      //   this.formGroup
      //     .get(n)
      //     ?.valueChanges.pipe(
      //       takeUntil(this._destroy$),
      //       tap((state) => {
      //         const [g, _inputs] = setInputsProperties(
      //           this.builder,
      //           this._inputs,
      //           b,
      //           this.formGroup,
      //           state,
      //           n
      //         );

      //         // When we listen for changes on form group controls
      //         // each changes that update the form group should trigger the change detector
      //         this.setFormState(_inputs, g, true);
      //       })
      //     )
      //     .subscribe();
      // }
    }
  }

  /** @description set inputs and formgroup properties value and trigger change detection */
  private setFormState(
    inputs: InputConfigInterface[],
    g: FormGroup,
    detect: boolean = false
  ) {
    this._inputs = inputs;
    this._formGroup = g;
    detect === false ? this.cdRef?.markForCheck() : this.cdRef?.detectChanges();
  }

  //#region Destructor
  ngOnDestroy(): void {
    this._destroy$.next();
  }
}
