import {
  AbstractControl,
  AsyncValidator,
  AsyncValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { map, Observable, of } from 'rxjs';

export function userNameValidator(
  authService: AuthService,
  originalUsername?: string,
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (originalUsername && control.value === originalUsername) {
      return of(null);
    }

    return authService.verifyUserName(control.value).pipe(
      map((response) => {
        return response.available ? null : { userNameTaken: true };
      }),
    );
  };
}
