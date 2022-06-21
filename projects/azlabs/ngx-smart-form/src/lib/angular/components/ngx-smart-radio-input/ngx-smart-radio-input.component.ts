import {
  ChangeDetectorRef,
  Component,
  ContentChild,
  Input,
  OnInit,
  TemplateRef,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import {
  OptionsInputConfigInterface,
  InputTypes,
  OptionsInputItemsInterface,
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
  @Input() inputConfig!: OptionsInputConfigInterface;
  @Input() describe = true;
  @ContentChild('input') inputRef!: TemplateRef<any>;

  public inputTypes = InputTypes;
  public loaded: boolean = false;

  constructor(private cdRef: ChangeDetectorRef) {}

  //
  ngOnInit(): void {
    if (this.inputConfig) {
      this.loaded = this.inputConfig.items!.length !== 0;
    }
  }

  onItemsChange(state: OptionsInputItemsInterface) {
    this.loaded = true;
    this.inputConfig = setControlOptions(this.inputConfig, state);
    this.cdRef.detectChanges();
  }
}
