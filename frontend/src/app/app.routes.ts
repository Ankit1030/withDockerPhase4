import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './services/auth-guard.service';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SampleComponent } from './components/drivers/sample/sample.component';
import { CreateRideComponent } from './components/rides/create-ride/create-ride.component';
import { ConfirmedRideComponent } from './components/rides/confirmed-ride/confirmed-ride.component';
import { RideHistoryComponent } from './components/rides/ride-history/ride-history.component';
import { UsersComponent } from './components/users/users.component';
import { ListComponent } from './components/drivers/list/list.component';
import { RunningRequestComponent } from './components/drivers/running-request/running-request.component';
import { CountryComponent } from './components/Pricing/country/country.component';
import { CityComponent } from './components/Pricing/city/city.component';
import { VehiclePricingComponent } from './components/Pricing/vehicle-pricing/vehicle-pricing.component';
import { SettingsComponent } from './components/settings/settings.component';
import { VehicleTypeComponent } from './components/Pricing/vehicle-type/vehicle-type.component';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { Injectable } from '@angular/core';



// export const routes: Routes = [
//     { path: '', redirectTo: 'login', pathMatch: 'full' },
//     { path: 'login', component:LoginComponent},
//     { path: 'dashboard', component:DashboardComponent,  canActivate: [authGuard],
//         children: [
//             // { path: 'create-ride', loadComponent: () => import('./components/rides/create-ride/create-ride.component').then(m => m.CreateRideComponent), canActivate: [authGuard] },
//             // { path: 'confirmed-ride', loadComponent: () => import('./components/rides/confirmed-ride/confirmed-ride.component').then(m => m.ConfirmedRideComponent), canActivate: [authGuard] },
//             // { path: 'ride-history', loadComponent: () => import('./components/rides/ride-history/ride-history.component').then(m => m.RideHistoryComponent), canActivate: [authGuard] },
//             { path: 'users', component:UsersComponent, canActivate: [authGuard] },
//             { path: 'lists', component:ListComponent, canActivate: [authGuard] },
//             // { path: 'running-requests', loadComponent: () => import('./components/drivers/running-request/running-request.component').then(m => m.RunningRequestComponent), canActivate: [authGuard] },
//             { path: 'country', component:CountryComponent, canActivate: [authGuard] },
//             { path: 'city', component:CityComponent, canActivate: [authGuard] },
//             { path: 'vehicles-types', component:VehicleTypeComponent, canActivate: [authGuard] },
//             { path: 'vehicle-pricing', component:VehiclePricingComponent, canActivate: [authGuard] },
//             { path: 'settings', component:SettingsComponent, canActivate: [authGuard] },
//         ]
//     },
//     { path: 'notfound',component: NotfoundComponent },
//     { path: '**', redirectTo: 'notfound', pathMatch: 'full' },
// ];

















export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component:LoginComponent},
    { path: 'dashboard', loadComponent: () => DashboardComponent,  canActivate: [authGuard],
        children: [
            // { path: 'create-ride', loadComponent:()=> SampleComponent, canActivate: [authGuard] },
            { path: 'create-ride', loadComponent:()=> CreateRideComponent, canActivate: [authGuard] },
            { path: 'confirmed-ride', loadComponent: () => import('./components/rides/confirmed-ride/confirmed-ride.component').then(m => m.ConfirmedRideComponent), canActivate: [authGuard] },
            { path: 'ride-history', loadComponent: () => import('./components/rides/ride-history/ride-history.component').then(m => m.RideHistoryComponent), canActivate: [authGuard] },
            { path: 'users', loadComponent: () => import('./components/users/users.component').then(m => m.UsersComponent), canActivate: [authGuard] },
            { path: 'lists', loadComponent: () => import('./components/drivers/list/list.component').then(m => m.ListComponent), canActivate: [authGuard] },
            { path: 'running-requests', loadComponent: () => import('./components/drivers/running-request/running-request.component').then(m => m.RunningRequestComponent), canActivate: [authGuard] },
            { path: 'country', loadComponent: () => import('./components/Pricing/country/country.component').then(m => m.CountryComponent), canActivate: [authGuard] },
            { path: 'city', loadComponent: () => import('./components/Pricing/city/city.component').then(m => m.CityComponent), canActivate: [authGuard] },
            { path: 'vehicles-types', loadComponent: () => import('./components/Pricing/vehicle-type/vehicle-type.component').then(m => m.VehicleTypeComponent), canActivate: [authGuard] },
            { path: 'vehicle-pricing', loadComponent: () => import('./components/Pricing/vehicle-pricing/vehicle-pricing.component').then(m => m.VehiclePricingComponent), canActivate: [authGuard] },
            { path: 'settings', loadComponent: () => import('./components/settings/settings.component').then(m => m.SettingsComponent), canActivate: [authGuard] },
        ]
    },
    { path: 'notfound',component: NotfoundComponent },
    { path: '**', redirectTo: '', pathMatch: 'full' },
];