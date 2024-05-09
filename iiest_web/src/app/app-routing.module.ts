import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/pages/home/home.component';
import { LandingpageComponent } from 'src/app/pages/landingpage/landingpage.component'
import { authGuard } from 'src/app/shared/gaurds/auth.guard';
import { routeGuard } from 'src/app/shared/gaurds/route.guard';
import { fbo_roles, empRegister_roles, caseList_roles } from 'src/app/utils/config';
import { UserAccountComponent } from 'src/app/pages/user-account/user-account.component';
import { CaseListComponent } from 'src/app/pages/operation/case-list/case-list.component';
import { OperationformComponent } from 'src/app/pages/operation/operationform/operationform.component';
import { SignupComponent } from 'src/app/pages/HR/signup/signup.component';
import { FbonewComponent } from 'src/app/pages/sales/fboproduct/fbonew/fbonew.component';
import { FbolistComponent } from 'src/app/pages/sales/fbolist/fbolist.component';
import { EmployeelistComponent } from 'src/app/pages/HR/employeelist/employeelist.component';
import { LmsComponent } from 'src/app/pages/lms/lms.component';
import { BatchListComponent } from 'src/app/pages/Training/batch-list/batch-list.component';
import { MainPageComponent } from 'src/app/pages/main-page/main-page.component';
import { OnboardVerificationComponent } from './pages/onboard-verification/onboard-verification.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { RefundPolicyComponent } from './pages/refund-policy/refund-policy.component';
import { TermsAndConditionsComponent } from './pages/terms-and-conditions/terms-and-conditions.component';

const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' }, // Default route
  { path: 'main', component: LandingpageComponent},
  { path: 'verifyonboard/:type/:id', component: OnboardVerificationComponent},
  { path: 'mainpage', component: MainPageComponent},
  { path: 'privacy-policy', component: PrivacyPolicyComponent},
  { path: 'refund-policy', component: RefundPolicyComponent},
  { path: 'terms-and-conditions', component: TermsAndConditionsComponent},
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
