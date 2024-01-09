import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { FboComponent } from './pages/fboTest/fbo.component';
import { HomeComponent } from './pages/home/home.component';
import { LandingpageComponent } from './pages/landingpage/landingpage.component'
import { authGuard } from './shared/gaurds/auth.guard';
import { FbonewComponent } from './pages/fboproduct/fbonew/fbonew.component';
import { EmploymentComponent } from './pages/employment/employment.component';

const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' }, // Default route
  { path: 'main', component: LandingpageComponent},
  { path: 'home', component: HomeComponent, canActivate:[authGuard]},
  // { path: 'fbo', component: FboComponent, canActivate:[authGuard] },
  { path: 'empregister', component: SignupComponent, canActivate:[authGuard]},
  { path: 'fbo', component: FbonewComponent, canActivate:[authGuard]}, 
  { path: 'employment', component: EmploymentComponent, canActivate:[authGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
