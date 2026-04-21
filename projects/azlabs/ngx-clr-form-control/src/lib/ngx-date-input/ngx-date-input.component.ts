import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  Inject,
  Input,
  LOCALE_ID,
  OnDestroy,
  TemplateRef,
} from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { DateInput } from '@azlabsjs/smart-form-core';
import { NgxCommonModule } from '../common';
import { Subscription } from 'rxjs';

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
      const subscrption = this.model.statusChanges.subscribe(status => {
        if (this.model.touched || this.model.dirty || this.model.pristine) {
          this._control.markAllAsTouched();
          this._control.markAsDirty();
          this._control.markAsPristine();
        }
        if (status === 'INVALID') {
          this._control.setErrors(this.model.errors);
        } else if (status === 'PENDING') {
          this._control.markAsPending();
        }
      });
      this.subscriptions.push(subscrption);
    }
  }
  @Input() describe = true;
  @Input() config!: DateInput;

  @ContentChild('input') inputRef!: TemplateRef<any>;


  /** @internal */
  model!: AbstractControl;

  /** @description creates an instance of date input */
  constructor(@Inject(LOCALE_ID) private locale: string) { }


  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription?.unsubscribe();
    }
  }

  onBlur() {
    const { locale, model } = this;
    if (!model.value) {
      model.setValue(null, { emitEvent: true, emitModelToViewChange: true, emitViewToModelChange: true });
      return;
    }

    const value = String(model.value);
    if (value === '' || value.length === 0) {
      model.setValue(null, { emitEvent: true, emitModelToViewChange: true, emitViewToModelChange: true });
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

      if (locale.match(/fr/)) {
        const match = value.match(/(?<day>0[1-9]|[12][0-9]|3[01])\/(?<month>0[1-9]|1[0-2])\/(?<year>\d{4})/);
        components = match ? [match[1], match[2], match[3]] : [];
      } else {
        const match = value.match(/(?<month>0[1-9]|1[0-2])\/(?<day>0[1-9]|[12][0-9]|3[01])\/(?<year>\d{4})/);
        components = match ? [match[2], match[1], match[3]] : [];
      }
    }
    // we output a date in the format DD/MM/YYYY
    // TODO: in futur release output ISO8601 YYYY-MM-DD format instead
    this._control.setValue(components.join('/'), { emitEvent: true, emitModelToViewChange: true, emitViewToModelChange: true });
  }
}
