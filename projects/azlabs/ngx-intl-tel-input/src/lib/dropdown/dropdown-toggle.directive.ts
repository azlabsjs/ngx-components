import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  ViewContainerRef,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { merge, Observable, Subject, takeUntil, tap } from 'rxjs';
import { TemplatePortal } from '@angular/cdk/portal';
import { Dropdown } from '../core';

@Directive({
  selector: '[dropdownToggle]',
})
export class DropdownToggleDirective implements OnDestroy {
  //
  private isDropdownOpen = false;
  private overlayRef!: OverlayRef;
  private destroy$ = new Subject<void>();

  //#region Directive inputs
  @Input('dropdownTriggerFor') public dropdownMenu!: Dropdown;
  //#endregion

  @HostListener('click', ['$event.target']) dropDownClick() {
    if (false === this.isDropdownOpen) {
      this.openDropdown();
    }
  }

  //
  public constructor(
    private overlay: Overlay,
    public readonly elementRef: ElementRef<HTMLElement>,
    private viewContainerRef: ViewContainerRef
  ) {}

  openDropdown(): void {
    this.isDropdownOpen = true;
    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy: this.overlay.scrollStrategies.noop(),
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.elementRef)
        .withPositions([
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top',
            offsetY: 2,
            offsetX: 0,
          },
        ]),
    });
    const templatePortal = new TemplatePortal(
      this.dropdownMenu.templateRef,
      this.viewContainerRef
    );
    this.overlayRef.attach(templatePortal);

    this.dropdownClosingActions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.destroyDropdown());
  }

  private dropdownClosingActions(): Observable<MouseEvent | void> {
    return merge(
      this.overlayRef.backdropClick(),
      this.overlayRef.detachments(),
      this.dropdownMenu.closed
    );
  }

  private destroyDropdown(): void {
    if (!this.overlayRef || !this.isDropdownOpen) {
      return;
    }
    this.isDropdownOpen = false;
    this.overlayRef.detach();
    this.destroy$.next();
  }

  ngOnDestroy(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
    }
  }
}
