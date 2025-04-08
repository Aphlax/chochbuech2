import {afterRender, Directive, ElementRef} from '@angular/core';

@Directive({
  selector: '[ScrollOnLoad]',
  standalone: true
})
export class ScrollOnLoadDirective {
  constructor(elem: ElementRef) {
    afterRender(() => elem.nativeElement.scroll(0, elem.nativeElement.clientWidth * 0.8));
  }
}
