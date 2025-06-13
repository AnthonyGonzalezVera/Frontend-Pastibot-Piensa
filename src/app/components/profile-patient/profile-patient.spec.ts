import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilePatient } from './profile-patient';

describe('ProfilePatient', () => {
  let component: ProfilePatient;
  let fixture: ComponentFixture<ProfilePatient>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilePatient]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfilePatient);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
