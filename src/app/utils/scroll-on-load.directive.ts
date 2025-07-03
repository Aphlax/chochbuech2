import {afterRender, Directive, ElementRef} from '@angular/core';

/** Scrolls the recipe page s.t. 80% of the square image is covered. */
@Directive({
  selector: '[scrollOnLoad]',
  standalone: true
})
export class ScrollOnLoadDirective {
  constructor(elem: ElementRef) {
    afterRender(() => elem.nativeElement.scroll(0, elem.nativeElement.clientWidth * 0.8));
  }
}
