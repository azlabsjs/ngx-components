import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  EventEmitter,
  Inject,
  Input,
  LOCALE_ID,
  OnDestroy,
  Optional,
  Output,
  TemplateRef,
} from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { DateInput } from '@azlabsjs/smart-form-core';
import { NgxCommonModule } from '../common';
import { distinctUntilChanged, Subscription } from 'rxjs';

@Component({
  standalone: true,
  imports: [NgxCommonModule],
  selector: 'ngx-date-input',
  templateUrl: './ngx-date-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxDateInputComponent implements OnDestroy {
  private subscriptions: Subscription[] = [];
  private _control!: AbstractControl<any, any>;
  @Input() set control(value: AbstractControl) {
    if (value) {
      this._control = value
      this.model = new FormControl(value.value, value.validator, value.asyncValidator);
      const subscription = this.model.statusChanges.subscribe(status => {
        if (this.model.touched) {
          this._control.markAsTouched({ emitEvent: true });
        }

        if (this.model.dirty) {
          this._control.markAsDirty({ emitEvent: true });
        }

        if (this.model.pristine) {
          this._control.markAsPristine({ emitEvent: true });
        }
        if (status === 'INVALID') {
          this._control.setErrors(this.model.errors, { emitEvent: true });
        } else if (status === 'PENDING') {
          this._control.markAsPending({ emitEvent: true });
        }
      });

      const subscription2 = this.model.valueChanges.pipe(distinctUntilChanged()).subscribe(value => {
        if (value && !Number.isNaN(Number(value)) && String(value).length === 8) {
          const components = this.locale.match(/fr/) ? [value.substring(0, 2), value.substring(2, 4), value.substring(4)] : [value.substring(2, 4), value.substring(0, 2), value.substring(4)];
          this.model.setValue(components.join('/'), { emitEvent: true });
          return;
        }

        if (!value) {
          this._control.setValue(null, { emitEvent: true });
          return;
        }

        value = String(value);
        if (value === '' || (value && value.length === 0)) {
          this._control.setValue(null, { emitEvent: true });
          return;
        }

        // here we are dealing with native date input which returns date in YYYY-MM-DD
        let components: string[] = [];
        if (value.charAt(4) === '-') {
          const units = value.split('-');
          components = units.length === 3 ? [units[2], units[1], units[0]] : components;
        } else if (value.charAt(4) === '/') {
          const units = value.split('/');
          components = units.length === 3 ? [units[2], units[1], units[0]] : components;
        } else {
          if (this.locale.match(/fr/)) {
            const match = value.match(/(?<day>0[1-9]|[12][0-9]|3[01])\/(?<month>0[1-9]|1[0-2])\/(?<year>\d{4})/);
            components = match ? [match[1], match[2], match[3]] : [];
          } else {
            const match = value.match(/(?<month>0[1-9]|1[0-2])\/(?<day>0[1-9]|[12][0-9]|3[01])\/(?<year>\d{4})/);
            components = match ? [match[2], match[1], match[3]] : [];
          }
        }

        if (components.length === 0) {
          return;
        }

        // we output a date in the format DD/MM/YYYY
        // TODO: in futur release output ISO8601 YYYY-MM-DD format instead
        this._control.setValue(components.length > 0 ? components.join('/') : value, { emitEvent: true });
        const t = setTimeout(() => {
          this._control.setErrors(this.model.errors, { emitEvent: true });
          this._control.markAsTouched({ emitEvent: true });
          this._control.markAsDirty({ emitEvent: true });
          this._control.markAsPristine({ emitEvent: true });
          clearTimeout(t);
        }, 700);
      });

      const subscription3 = this._control.valueChanges.pipe(distinctUntilChanged()).subscribe(value => {
        if (value && String(value) !== String(this.model.value)) {
          this.model.setValue(value);
        }
      });

      this.subscriptions.push(subscription, subscription2, subscription3);
    }
  }
  get control() {
    return this._control;
  }
  @Input() describe = true;
  @Input() config!: DateInput;

  @Output() blur = new EventEmitter<Event>();

  @ContentChild('input') inputRef!: TemplateRef<any>;


  /** @internal */
  model!: AbstractControl;

  /** @description creates an instance of date input */
  constructor(@Inject(LOCALE_ID) private locale: string, @Optional() private cdref: ChangeDetectorRef | null) { }


  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription?.unsubscribe();
    }
  }

  onBlur(e?: Event) {
    this.blur.emit(e);
  }
}
