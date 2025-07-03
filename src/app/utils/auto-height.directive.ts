import {afterRender, Directive, ElementRef} from '@angular/core';

@Directive({
  selector: '[autoHeight]',
  standalone: true
})
export class AutoHeightDirective {
  
  constructor(elementRef: ElementRef) {
    afterRender(() => {
      const elem = elementRef.nativeElement;
      elem.setAttribute('style', 'height: ' + elem.scrollHeight + 'px; overflow-y: hidden;');
      elem.oninput = () =>
        elem.setAttribute('style', 'height: ' + elem.scrollHeight + 'px; overflow-y: hidden;');
    });
  }
}
