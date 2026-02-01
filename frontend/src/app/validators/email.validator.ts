import {
  AbstractControl,
  AsyncValidator,
  AsyncValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { map, Observable, of } from 'rxjs';

export function emailValidator(authService: AuthService, originalEmail?: string): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (originalEmail && control.value === originalEmail) {
      return of(null);
    }

    return authService.verifyEmail(control.value).pipe(
      map((response) => {
        return response.available ? null : { emailTaken: true };
      }),
    );
  };
}
