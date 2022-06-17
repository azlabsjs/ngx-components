import { EventEmitter, TemplateRef } from "@angular/core";

export interface Dropdown {
  templateRef: TemplateRef<any>;
  readonly closed: EventEmitter<void>;
}
