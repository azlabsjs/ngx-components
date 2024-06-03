import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[noAutoComplete]',
})
export class NoAutoCompleteDirective implements AfterViewInit {
  @Input() noAutoComplete: string = 'off';


  //
  constructor(private _el: ElementRef) {}

  ngAfterViewInit(): void {
    this._el.nativeElement.setAttribute('autocomplete', this.noAutoComplete ?? 'off');
    this._el.nativeElement.setAttribute('autocorrect', 'false');
    this._el.nativeElement.setAttribute('autocapitalize', 'none');
    this._el.nativeElement.setAttribute('spellcheck', 'false');
  }
}
