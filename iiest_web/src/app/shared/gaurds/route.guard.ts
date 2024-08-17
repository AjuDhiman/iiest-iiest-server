import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const routeGuard: CanActivateFn = (route, state) => {
    
    let _route = inject(Router);
    let user: any = sessionStorage.getItem('LoggedInUser');
    user = JSON.parse(user);
    let role = user.designation;
    let panelType = user.panel_type;
    let allowedRoles:string[] = route.data['allowedRoles'];
    let allowedPanels:string[] = route.data['allowedPanels']
    if ( (allowedRoles && allowedRoles.includes(role)) || (allowedPanels && allowedPanels.includes(panelType))) {
        //alert('Not logged in ');
        return true;
    } else {
        _route.navigate(['/home']);
        return false;
    }
};
