import { Component, Input, Output, EventEmitter } from "@angular/core";
import { FormControl } from "@angular/forms";
import { getObjectProperty } from "@iazlabs/js-object";
import { InputInterface, NumberInput } from "../../../core";
import { InputEventArgs } from "../../types/input";

@Component({
  selector: "ngx-smart-number-input",
  templateUrl: "./ngx-smart-number-input.component.html",
  styles: [],
})
export class NgxSmartNumberInputComponent {
  @Input() control!: FormControl;
  @Input() showLabelAndDescription = true;
  // Configuration parameters of the input
  @Input() inputConfig!: NumberInput;
  @Output() keyup = new EventEmitter<InputEventArgs>();
  @Output() keydown = new EventEmitter<InputEventArgs>();
  @Output() keypress = new EventEmitter<InputEventArgs>();
  @Output() blur = new EventEmitter<InputEventArgs>();

  maxNumberSize(): number {
    return Math.pow(2, 31) - 1;
  }

  getErrorAsNumber(value?: object | number, key?: string): number | string {
    return typeof value === "number"
      ? value
      : getObjectProperty(value, key || "");
  }
}
