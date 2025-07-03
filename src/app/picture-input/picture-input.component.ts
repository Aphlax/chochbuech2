import {AfterViewInit, Component, ElementRef, model, ViewChild} from '@angular/core';

@Component({
  selector: 'picture-input',
  standalone: true,
  imports: [],
  templateUrl: './picture-input.component.html',
  styleUrl: './picture-input.component.scss'
})
export class PictureInputComponent implements AfterViewInit {
  @ViewChild('displayImage') readonly displayImage?: ElementRef;
  @ViewChild('imageInput') readonly imageInput?: ElementRef;
  image = model<string | File>("");

  ngAfterViewInit(): void {
    if (!this.displayImage) return;
    this.displayImage.nativeElement.src = this.image();
  }

  changeImage(event: Event) {
    if (!this.displayImage) return;
    const files = (event.target as any)?.files;
    if (files) {
      this.displayImage.nativeElement.src = URL.createObjectURL(files[0]);
      this.image.update(_ => files[0]);
    }
  }
}
