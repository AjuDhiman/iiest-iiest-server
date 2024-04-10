import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LandingpageComponent } from './pages/landingpage/landingpage.component'
import { authGuard } from './shared/gaurds/auth.guard';
import { routeGuard } from './shared/gaurds/route.guard';
import { fbo_roles, empRegister_roles, caseList_roles } from './utils/config';
import { UserAccountComponent } from './pages/user-account/user-account.component';
import { CaseListComponent } from './pages/operation/case-list/case-list.component';
import { OperationformComponent } from './pages/operation/operationform/operationform.component';
import { SignupComponent } from './pages/HR/signup/signup.component';
import { FbonewComponent } from './pages/sales/fboproduct/fbonew/fbonew.component';
import { FbolistComponent } from './pages/sales/fbolist/fbolist.component';
import { EmployeelistComponent } from './pages/HR/employeelist/employeelist.component';
import { LmsComponent } from './pages/lms/lms.component';
import { BatchListComponent } from './pages/Training/batch-list/batch-list.component';
import { MainPageComponent } from './pages/main-page/main-page.component';

const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' }, // Default route
  { path: 'main', component: LandingpageComponent},
  { path: 'mainpage', component: MainPageComponent},
  { path: 'home', component: HomeComponent, canActivate:[authGuard]},
  { path: 'user', component: UserAccountComponent, canActivate:[authGuard]},
  { path: 'caselist', component: CaseListComponent, canActivate:[authGuard,routeGuard], data: {allowedRoles:caseList_roles}},
  { path: 'batchlist/caselist', component: CaseListComponent, canActivate:[authGuard,routeGuard], data: {allowedRoles:caseList_roles}},
  { path: 'batchlist', component: BatchListComponent, canActivate:[authGuard,routeGuard], data: {allowedRoles:caseList_roles}},
  { path: 'auditlist', component: BatchListComponent, canActivate:[authGuard,routeGuard], data: {allowedRoles:caseList_roles}},
  { path: 'caselist/operationform/:id', component: OperationformComponent, canActivate:[authGuard,routeGuard], data: {allowedRoles:caseList_roles}},
  { path: 'empregister', component: SignupComponent, canActivate:[authGuard, routeGuard], data: {allowedRoles:empRegister_roles}},
  { path: 'fbo', component: FbonewComponent, canActivate:[authGuard, routeGuard], data: {allowedRoles:fbo_roles}},
  { path: 'fbolist', component: FbolistComponent, canActivate:[authGuard, routeGuard], data: {allowedRoles:fbo_roles}},
  { path: 'emplist', component: EmployeelistComponent, canActivate:[authGuard, routeGuard], data: {allowedRoles:empRegister_roles}},
  { path: 'lms', component: LmsComponent, canActivate:[authGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
