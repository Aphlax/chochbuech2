import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickItemsDialogComponent } from './quick-items-dialog.component';

describe('QuickItemsDialogComponent', () => {
  let component: QuickItemsDialogComponent;
  let fixture: ComponentFixture<QuickItemsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickItemsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickItemsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
