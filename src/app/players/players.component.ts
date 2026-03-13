import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StateService, Player } from '../services/state.service';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './players.component.html',
  styleUrl: './players.component.scss',
})
export class PlayersComponent {
  private svc = inject(StateService);

  players = this.svc.players;
  assignments = this.svc.assignments;

  newName = signal('');
  newColor = signal('#4ECDC4');

  editingId = signal<string | null>(null);
  editName = signal('');
  editColor = signal('');

  addPlayer() {
    const name = this.newName().trim();
    if (!name) return;
    this.svc.addPlayer(name, this.newColor());
    this.newName.set('');
    this.newColor.set('#4ECDC4');
  }

  startEdit(player: Player) {
    this.editingId.set(player.id);
    this.editName.set(player.name);
    this.editColor.set(player.color);
  }

  saveEdit(id: string) {
    const name = this.editName().trim();
    if (!name) return;
    this.svc.updatePlayer(id, name, this.editColor());
    this.editingId.set(null);
  }

  cancelEdit() {
    this.editingId.set(null);
  }

  deletePlayer(player: Player) {
    const hasAssignments = this.assignments().some(a => a.playerId === player.id);
    if (hasAssignments) {
      if (!confirm(`${player.name} has assignments. Delete anyway?`)) return;
    }
    this.svc.deletePlayer(player.id);
  }

  saveDefaults() {
    this.svc.saveDefaults();
  }
}
