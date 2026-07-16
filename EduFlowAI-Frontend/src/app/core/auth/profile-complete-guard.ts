import { CanMatchFn } from '@angular/router';

export const profileCompleteGuard: CanMatchFn = (route, segments) => {
  return true;
};
