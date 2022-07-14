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
  InputOptionsInterface,
} from '@azlabsjs/smart-form-core';

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
      this.loaded = this.inputConfig.options!.length !== 0;
    }
  }

  onOptionsChange(state: InputOptionsInterface) {
    this.loaded = true;
    this.inputConfig = { ...this.inputConfig, options: state };
    this.cdRef.detectChanges();
  }
}
