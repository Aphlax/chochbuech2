import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionStringComponent } from './action-string.component';

describe('ActionStringComponent', () => {
  let component: ActionStringComponent;
  let fixture: ComponentFixture<ActionStringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionStringComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionStringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
