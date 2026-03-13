import { Routes, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { StateService } from './services/state.service';

const requirePlayers: CanActivateFn = () => {
  const state = inject(StateService);
  const router = inject(Router);
  return state.players().length > 0 ? true : router.createUrlTree(['/players']);
};

export const routes: Routes = [
  { path: '', redirectTo: 'wheel', pathMatch: 'full' },
  {
    path: 'wheel',
    canActivate: [requirePlayers],
    loadComponent: () =>
      import('./wheel/wheel.component').then(m => m.WheelComponent),
  },
  {
    path: 'players',
    loadComponent: () =>
      import('./players/players.component').then(m => m.PlayersComponent),
  },
  {
    path: 'chores',
    loadComponent: () =>
      import('./chores/chores.component').then(m => m.ChoresComponent),
  },
  { path: '**', redirectTo: 'wheel' },
];
