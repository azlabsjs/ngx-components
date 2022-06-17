import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import {
  BindingControlInterface,
  InputTypes,
  SelectableControlItems,
  setControlOptions,
} from '../../../core';

@Component({
  selector: 'ngx-smart-radio-input',
  templateUrl: './ngx-smart-radio-input.component.html',
})
export class NgxSmartRadioInputComponent implements OnInit {
  // tslint:disable-next-line: variable-name
  @Input() control!: AbstractControl;
  // tslint:disable-next-line: variable-name
  @Input() inputConfig!: BindingControlInterface;
  @Input() showLabelAndDescription = true;

  public inputTypes = InputTypes;
  public loaded: boolean = false;

  constructor(private cdRef: ChangeDetectorRef) {}

  //
  ngOnInit(): void {
    if (this.inputConfig) {
      this.loaded = this.inputConfig.items!.length !== 0;
    }
  }

  onValueChanges(event: any) {
    this.control.setValue(event);
  }

  inputValue(name: string, value: string) {
    return `${name}_${value}`;
  }

  onItemsChange(state: SelectableControlItems) {
    this.loaded = true;
    this.inputConfig = setControlOptions(this.inputConfig, state);
    this.cdRef.detectChanges();
  }
}
