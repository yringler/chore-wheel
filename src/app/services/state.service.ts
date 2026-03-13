import { Injectable, signal, computed } from '@angular/core';

export interface Chore {
  id: string;
  name: string;
  emoji: string;
  detail: string;
}

export interface Player {
  id: string;
  name: string;
  color: string;
}

export interface Assignment {
  choreId: string;
  playerId: string;
  done: boolean;
}

export interface AppState {
  players: Player[];
  chores: Chore[];
  assignments: Assignment[];
}

const STORAGE_KEY = 'chore-wheel-state';

const DEFAULT_STATE: AppState = {
  players: [
    { id: crypto.randomUUID(), name: 'Meir', color: '#FF6B6B' },
    { id: crypto.randomUUID(), name: 'Mendel', color: '#4ECDC4' },
    { id: crypto.randomUUID(), name: 'Rivka', color: '#FFE66D' },
  ],
  chores: [
    { id: crypto.randomUUID(), name: 'Clean Up Games', emoji: '🎲', detail: 'put all games away' },
    { id: crypto.randomUUID(), name: 'Table', emoji: '🍽️', detail: 'clean off the table' },
    { id: crypto.randomUUID(), name: 'Under Art Table', emoji: '🎨', detail: 'tidy everything underneath' },
    { id: crypto.randomUUID(), name: 'Top of Art Table', emoji: '✏️', detail: 'clear & organize the top' },
    { id: crypto.randomUUID(), name: 'Coats', emoji: '🧥', detail: 'all coats → treadmill gate' },
    { id: crypto.randomUUID(), name: 'Backpacks', emoji: '🎒', detail: 'all backpacks → treadmill' },
    { id: crypto.randomUUID(), name: 'Sweeping', emoji: '🧹', detail: 'sweep the floor' },
  ],
  assignments: [],
};

@Injectable({ providedIn: 'root' })
export class StateService {
  private state = signal<AppState>(this.load());

  players = computed(() => this.state().players);
  chores = computed(() => this.state().chores);
  assignments = computed(() => this.state().assignments);

  unassignedChores = computed(() => {
    const assigned = new Set(this.state().assignments.map(a => a.choreId));
    return this.state().chores.filter(c => !assigned.has(c.id));
  });

  assignmentsForPlayer(playerId: string) {
    return computed(() => {
      const playerAssignments = this.state().assignments.filter(a => a.playerId === playerId);
      return playerAssignments.map(a => ({
        assignment: a,
        chore: this.state().chores.find(c => c.id === a.choreId)!,
      }));
    });
  }

  private load(): AppState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as AppState;
    } catch {}
    return DEFAULT_STATE;
  }

  private save(state: AppState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  private update(fn: (s: AppState) => AppState) {
    const next = fn(this.state());
    this.state.set(next);
    this.save(next);
  }

  // Players
  addPlayer(name: string, color: string) {
    this.update(s => ({
      ...s,
      players: [...s.players, { id: crypto.randomUUID(), name, color }],
    }));
  }

  updatePlayer(id: string, name: string, color: string) {
    this.update(s => ({
      ...s,
      players: s.players.map(p => (p.id === id ? { ...p, name, color } : p)),
    }));
  }

  deletePlayer(id: string) {
    this.update(s => ({
      ...s,
      players: s.players.filter(p => p.id !== id),
      assignments: s.assignments.filter(a => a.playerId !== id),
    }));
  }

  // Chores
  addChore(name: string, emoji: string, detail: string) {
    this.update(s => ({
      ...s,
      chores: [...s.chores, { id: crypto.randomUUID(), name, emoji, detail }],
    }));
  }

  updateChore(id: string, name: string, emoji: string, detail: string) {
    this.update(s => ({
      ...s,
      chores: s.chores.map(c => (c.id === id ? { ...c, name, emoji, detail } : c)),
    }));
  }

  deleteChore(id: string) {
    this.update(s => ({
      ...s,
      chores: s.chores.filter(c => c.id !== id),
      assignments: s.assignments.filter(a => a.choreId !== id),
    }));
  }

  // Assignments
  addAssignment(choreId: string, playerId: string) {
    this.update(s => ({
      ...s,
      assignments: [...s.assignments, { choreId, playerId, done: false }],
    }));
  }

  toggleDone(choreId: string) {
    this.update(s => ({
      ...s,
      assignments: s.assignments.map(a =>
        a.choreId === choreId ? { ...a, done: !a.done } : a
      ),
    }));
  }

  resetAssignments() {
    this.update(s => ({ ...s, assignments: [] }));
  }
}
