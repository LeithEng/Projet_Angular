import { AbstractControl, AsyncValidator, AsyncValidatorFn, ValidationErrors } from "@angular/forms"
import { AuthService } from "../services/auth.service"
import { map, Observable } from "rxjs"

export function userNameValidator(authService: AuthService) :AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    return authService.verifyUserName(control.value).pipe(
        map(response => {
                return response.available ? null : { userNameTaken: true };
            }
        )
    );
 }
}