import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedImagesComponent } from './shared-images.component';

describe('SharedImagesComponent', () => {
  let component: SharedImagesComponent;
  let fixture: ComponentFixture<SharedImagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedImagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
