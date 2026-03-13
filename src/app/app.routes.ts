import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'wheel', pathMatch: 'full' },
  {
    path: 'wheel',
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
