import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
import {
  controlAttributesDataBindings,
  createHiddenAttributeSetter,
  setControlsAttributes,
} from '../../helpers';
import { BindingInterface } from '../../types';

@Component({
  selector: 'ngx-smart-form-group',
  templateUrl: './ngx-smart-form-group.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxSmartFormGroupComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  //#region Component inputs definitions
  @Input() formGroup!: FormGroup;
  @Input() controls!: InputConfigInterface[];
  @Input() template!: TemplateRef<HTMLElement>;
  //#endregion Component inputs definitions

  //#region Component internal properties
  // @internal
  private _destroy$ = new Subject<void>();

  //#endregion Component internal properties

  //#region Component output
  @Output() formGroupChange = new EventEmitter<FormGroup>();
  //#endregion Component outputs

  //
  ngOnInit(): void {
    // Simulate formgroup changes
    this.formGroup.valueChanges
      .pipe(tap((state) => this.formGroupChange.emit(this.formGroup)))
      .subscribe();
  }

  ngAfterViewInit(): void {
    this.setBindings();
  }

  setBindings() {
    if (this.controls && this.formGroup) {
      const [bindings, formgroup, controls] = controlAttributesDataBindings(
        this.controls
      )(this.formGroup);
      this.controls = controls as InputConfigInterface[];
      this.formGroup = formgroup as FormGroup;
      // Get control entries from the formgroup
      const entries = Object.entries(this.formGroup.controls);
      // Handle form control value changes
      for (const [name, abstractControl] of entries) {
        abstractControl.valueChanges
          .pipe(
            tap((state) =>
              this.handleControlChanges(
                state,
                name,
                bindings as Map<string, BindingInterface>
              )
            ),
            takeUntil(this._destroy$)
          )
          .subscribe();
      }
    }
  }

  // tslint:disable-next-line: typedef
  handleControlChanges(
    event: any,
    name: string,
    bindings: Map<string, BindingInterface>
  ) {
    for (const current of bindings.values()) {
      if (current.binding?.name.toString() === name.toString()) {
        const [control, controls] = setControlsAttributes(
          this.controls,
          current,
          event,
          createHiddenAttributeSetter
        )(this.formGroup);
        this.formGroup = control as FormGroup;
        this.controls = controls;
      }
    }
  }

  //#region Destructor
  ngOnDestroy(): void {
    this._destroy$.next();
  }
}
