import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortableListItemComponent } from './sortable-list-item.component';

describe('SortableListItemComponent', () => {
  let component: SortableListItemComponent;
  let fixture: ComponentFixture<SortableListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SortableListItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SortableListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
