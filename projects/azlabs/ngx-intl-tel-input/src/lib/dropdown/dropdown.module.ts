import { NgModule } from '@angular/core';
import { DropdownComponent } from './dropdown.component';
import { DropdownToggleDirective } from './dropdown-toggle.directive';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { DropdownMenuComponent } from './dropdown.menu.component';

@NgModule({
  declarations: [
    DropdownToggleDirective,
    DropdownComponent,
    DropdownMenuComponent,
  ],
  imports: [OverlayModule, CommonModule],
  exports: [DropdownToggleDirective, DropdownComponent, DropdownMenuComponent],
})
export class DropdownModule {}
