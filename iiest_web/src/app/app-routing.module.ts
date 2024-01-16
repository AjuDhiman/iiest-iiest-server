import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignupComponent } from './pages/signup/signup.component';
import { HomeComponent } from './pages/home/home.component';
import { LandingpageComponent } from './pages/landingpage/landingpage.component'
import { authGuard } from './shared/gaurds/auth.guard';
import { routeGuard } from './shared/gaurds/route.guard';
import { FbonewComponent } from './pages/fboproduct/fbonew/fbonew.component';
import { fbo_roles, empRegister_roles } from './utils/config';
import { SettingPanelComponent } from './shared/setting-panel/setting-panel.component';


const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' }, // Default route
  { path: 'main', component: LandingpageComponent},
  { path: 'home', component: HomeComponent, canActivate:[authGuard]},
  { path: 'settings', component: SettingPanelComponent, canActivate:[authGuard]},
  { path: 'empregister', component: SignupComponent, canActivate:[authGuard, routeGuard], data: {allowedRoles:empRegister_roles}},
  { path: 'fbo', component: FbonewComponent, canActivate:[authGuard, routeGuard], data: {allowedRoles:fbo_roles}}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
