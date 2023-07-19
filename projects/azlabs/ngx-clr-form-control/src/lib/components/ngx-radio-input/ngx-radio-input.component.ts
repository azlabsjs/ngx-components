import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import {
  InputOptionsInterface,
  OptionsInputConfigInterface
} from '@azlabsjs/smart-form-core';
import { Subject } from 'rxjs';

@Component({
  selector: 'ngx-radio-input',
  templateUrl: './ngx-radio-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxRadioInputComponent implements OnInit, OnDestroy {
  // #region Component input properties
  // tslint:disable-next-line: variable-name
  @Input() control!: AbstractControl;
  // tslint:disable-next-line: variable-name
  @Input() inputConfig!: OptionsInputConfigInterface;
  @Input() describe = true;
  // #endregion Component input properties
  @ContentChild('input') inputRef!: TemplateRef<any>;

  // #region Component states
  loaded: boolean = false;
  private _destroy$ = new Subject<void>();
  // #endregion Component states

  /**
   * Creates a Radio input
   * 
   * @param changes
   */
  constructor(private changes: ChangeDetectorRef) {}

  //
  ngOnInit(): void {
    if (this.inputConfig && this.inputConfig.options) {
      this.loaded = this.inputConfig.options.length !== 0;
    }
  }

  onOptionsChange(state: InputOptionsInterface) {
    this.inputConfig = { ...this.inputConfig, options: state };
    this.loaded = true;
    this.changes.detectChanges();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }
}
