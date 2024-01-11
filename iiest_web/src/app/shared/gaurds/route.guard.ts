import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const routeGuard: CanActivateFn = (route, state) => {
    
    let _route = inject(Router);
    let user: any = sessionStorage.getItem('LoggedInUser');
    user = JSON.parse(user);
    let role = user.designation;
    let allowedRoles:any = route.data['allowedRoles'];
    if (allowedRoles.includes(role)) {
        //alert('Not logged in ');
        return true;
    } else {
        _route.navigate(['/home']);
        return false;
    }
};
