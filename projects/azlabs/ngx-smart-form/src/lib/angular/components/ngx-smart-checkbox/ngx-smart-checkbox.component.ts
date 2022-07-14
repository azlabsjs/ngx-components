import {
  ChangeDetectorRef,
  Component,
  ContentChild,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import {
  InputOptionsInterface,
  InputTypes,
  mapIntoInputOptions,
  OptionsInputConfigInterface,
} from '@azlabsjs/smart-form-core';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'ngx-smart-checkbox-input',
  templateUrl: './ngx-smart-checkbox.component.html',
})
export class NgxSmartCheckBoxComponent implements OnInit, OnDestroy {
  //#region Component inputs
  @Input() control!: AbstractControl;
  @Input() inputConfig!: OptionsInputConfigInterface;
  @Input() describe = true;
  @ContentChild('input') inputRef!: TemplateRef<any>;
  //#endregion Component inputs

  public inputTypes = InputTypes;
  public formGroup!: FormGroup;
  public loaded: boolean = false;

  private _destroy$ = new Subject<void>();

  constructor(private builder: FormBuilder, private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.formGroup = this.builder.group({});
    if (this.inputConfig) {
      this.loaded = this.inputConfig.options!.length !== 0;
    }
    if ((this.inputConfig!.options ?? []).length !== 0) {
      this.initializeFormArray();
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  onOptionsChange(state: InputOptionsInterface) {
    this.loaded = true;
    this.inputConfig = { ...this.inputConfig, options: state };
    this.initializeFormArray();
    this.cdRef.detectChanges();
  }

  private initializeFormArray() {
    const control = new FormArray([]);
    // We get the value of the injected control
    // if the value is not an array we wrap it as array
    const value = (
      Array.isArray(this.control.value)
        ? this.control.value
        : [this.control.value]
    ).filter((current) => typeof current !== 'undefined' && current !== null);

    // We add controls to the form array element
    if ((this.inputConfig!.options ?? []).length === 1) {
      control.push(new FormControl(value.length === 0 ? false : true));
    } else if ((this.inputConfig!.options ?? []).length !== 0) {
      for (const option of this.inputConfig.options) {
        const index = value.find((current) => current == option.value);
        control.push(new FormControl(index ? true : false));
      }
    }
    this.formGroup.addControl('options', control);
    this.subscribeToFormArrayChange();
  }

  private subscribeToFormArrayChange() {
    this.formGroup.controls['options'].valueChanges
      .pipe(
        takeUntil(this._destroy$),
        tap((state: boolean[]) => {
          this.control.setValue(
            this.getValue(this.inputConfig.options ?? [], state)
          );
        })
      )
      .subscribe();
  }

  private getValue(options: InputOptionsInterface, state: boolean[]) {
    if (options.length === 0) {
      return undefined;
    }
    if (options.length === 1) {
      return state[0];
    }
    return state
      .filter((current) => current === true)
      .map((current, index) => {
        if (this.inputConfig.options[index]) {
          return this.inputConfig.options[index].value;
        }
        return undefined;
      })
      .filter((current) => typeof current !== 'undefined' && current !== null);
  }

  asFormControl(control: AbstractControl) {
    return control as FormControl;
  }
}
