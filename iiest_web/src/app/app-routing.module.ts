import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { HomeComponent } from './pages/home/home.component';
import { LandingpageComponent } from './pages/landingpage/landingpage.component'
import { authGuard } from './shared/gaurds/auth.guard';
import { routeGuard } from './shared/gaurds/route.guard';
import { FbonewComponent } from './pages/fboproduct/fbonew/fbonew.component';
import { EmploymentComponent } from './pages/employment/employment.component';
let sales_arr = [
  'General Manager(Sales)',
  'Regional Deputy Manager(Sales)',
  'Area Manager(Sales)',
  'Assistant Area Manager',
  'Area Officer(District Head)',
  'Senior Area Officer',
  'Area Associate Officer',
  'Area Officer',
  'Regional HR Manager'
];

let fbo_roles = [
  'General Manager(Sales)',
  'Regional Deputy Manager(Sales)',
  'Area Manager(Sales)',
  'Assistant Area Manager',
  'Area Officer(District Head)',
  'Senior Area Officer',
  'Area Associate Officer',
  'Area Officer',
  'Regional HR Manager'
];

let empRegister_roles = [
  'Regional HR Manager',
  'Deputy Regional Manager(HR)',
  'Human Resource Manager',
  'Deputy Human Resource Manager(HR)',
  'Senior HR Associate',
  'HR Associate',
  'HR Coordiator',
  'Junior Executive(Admin & HR)',
  'Internship'
];

const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' }, // Default route
  { path: 'main', component: LandingpageComponent},
  { path: 'home', component: HomeComponent, canActivate:[authGuard]},
  // { path: 'fbo', component: FboComponent, canActivate:[authGuard] },
  { path: 'empregister', component: SignupComponent, canActivate:[authGuard, routeGuard], data:{allowedRoles:empRegister_roles}},
  { path: 'fbo', component: FbonewComponent, canActivate:[authGuard, routeGuard], data:{allowedRoles:fbo_roles}}, 
  { path: 'employment/:type', component: EmploymentComponent, canActivate:[authGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
