import { Routes } from '@angular/router';
import { MechanicSite } from './panel-site/panel-site';
import { LoginSite } from './login-site/login-site';

export const routes: Routes = [
    { path: '', redirectTo: 'login-site', pathMatch: 'full' },
    {path: 'panel-site', component: MechanicSite},
    {path: 'login-site', component: LoginSite},
];
