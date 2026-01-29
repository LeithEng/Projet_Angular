import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentRowComponent } from './content-row';

describe('MovieRow', () => {
  let component: ContentRowComponent;
  let fixture: ComponentFixture<ContentRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentRowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
