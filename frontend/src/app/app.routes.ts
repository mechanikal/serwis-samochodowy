import { Routes } from '@angular/router';
import { MechanicSite } from './mechanic-site/mechanic-site';
import { LoginSite } from './login-site/login-site';

export const routes: Routes = [
    { path: '', redirectTo: 'login-site', pathMatch: 'full' },
    {path: 'mechanic-site', component: MechanicSite},
    {path: 'login-site', component: LoginSite},
];
