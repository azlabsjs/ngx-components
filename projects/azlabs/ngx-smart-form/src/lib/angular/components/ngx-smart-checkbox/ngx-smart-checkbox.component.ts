import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import {
  BindingControlInterface,
  InputTypes,
  SelectableControlItems,
  setControlOptions,
} from '../../../core';

@Component({
  selector: 'ngx-smart-checkbox-input',
  templateUrl: './ngx-smart-checkbox.component.html',
  styles: [],
})
export class NgxSmartCheckBoxComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line: variable-name
  @Input() control!: AbstractControl;
  // tslint:disable-next-line: variable-name
  @Input() inputConfig!: BindingControlInterface;
  @Input() showLabelAndDescription = true;

  public inputTypes = InputTypes;
  public formGroup!: FormGroup;
  public loaded: boolean = false;

  private _destroy$ = new Subject<void>();

  constructor(private builder: FormBuilder, private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.formGroup = this.builder.group({});
    if (this.inputConfig) {
      this.loaded = this.inputConfig.items!.length !== 0;
    }
    if ((this.inputConfig!.items ?? []).length !== 0) {
      this.initializeFormArray();
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  onItemsChange(state: SelectableControlItems) {
    this.loaded = true;
    this.inputConfig = setControlOptions(this.inputConfig, state);
    this.initializeFormArray();
    this.cdRef.detectChanges();
  }

  private initializeFormArray() {
    const control = new FormArray<AbstractControl>([]);
    // We get the value of the injected control
    // if the value is not an array we wrap it as array
    const value = (
      Array.isArray(this.control.value)
        ? this.control.value
        : [this.control.value]
    ).filter((current) => typeof current !== 'undefined' && current !== null);

    // We add controls to the form array element
    if ((this.inputConfig!.items ?? []).length === 1) {
      control.push(new FormControl(value.length === 0 ? false : true));
    } else if ((this.inputConfig!.items ?? []).length !== 0) {
      for (const item of this.inputConfig.items) {
        const index = value.find((current) => current == item.value);
        control.push(new FormControl(index ? true : false));
      }
    }
    this.formGroup.addControl('items', control);
    this.subscribeToFormArrayChange();
  }

  private subscribeToFormArrayChange() {
    this.formGroup.controls['items'].valueChanges
      .pipe(
        takeUntil(this._destroy$),
        tap((state: boolean[]) => {
          this.control.setValue(
            this.getValue(this.inputConfig.items ?? [], state)
          );
        })
      )
      .subscribe();
  }

  private getValue(items: SelectableControlItems, state: boolean[]) {
    if (items.length === 0) {
      return undefined;
    }
    if (items.length === 1) {
      return state[0];
    }
    return state
      .filter((current) => current === true)
      .map((current, index) => {
        if (this.inputConfig.items[index]) {
          return this.inputConfig.items[index].value;
        }
        return undefined;
      })
      .filter((current) => typeof current !== 'undefined' && current !== null);
  }

  isFormArray(control: AbstractControl) {
    return control instanceof FormArray;
  }

  asFormArray(control?: AbstractControl) {
    return control as FormArray;
  }

  asFormControl(control: AbstractControl) {
    return control as FormControl;
  }
}
