import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  
  let _route = inject(Router)
  let issLoggedIn = sessionStorage.getItem('isLoggedIn');
  let issToken =  sessionStorage.getItem('token');

  if(issLoggedIn == 'false' || issToken == '' || issToken == null){
    _route.navigate(['/main']);
    //alert('Not logged in ');
    return false;
  }else{
    return true;
  }
};

