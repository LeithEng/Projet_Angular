import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateReviewComponent } from './create-review.component';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';

describe('CreateReviewComponent', () => {
  let component: CreateReviewComponent;
  let fixture: ComponentFixture<CreateReviewComponent>;
  let mockReviewService: jasmine.SpyObj<ReviewService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockReviewService = jasmine.createSpyObj('ReviewService', ['createReview']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['isAuthenticated'], {
      currentUserSignal: () => null,
    });

    await TestBed.configureTestingModule({
      imports: [CreateReviewComponent],
      providers: [
        { provide: ReviewService, useValue: mockReviewService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateReviewComponent);
    component = fixture.componentInstance;
    component.movieId = '123';
    component.movieTitle = 'Test Movie';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should submit review when authenticated', () => {
    mockAuthService.isAuthenticated.and.returnValue(true);
    mockReviewService.createReview.and.returnValue(of({
      id: '1',
      movie_id: '123',
      author: 'testuser',
      author_details: {
        name: 'Test User',
        username: 'testuser',
        profile_image: null,
        rating: 8,
      },
      content: 'Great movie!',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    component.content.set('Great movie!');
    component.rating.set(8);
    component.submitReview();

    expect(mockReviewService.createReview).toHaveBeenCalled();
  });
});
