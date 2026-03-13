import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StateService, Chore } from '../services/state.service';

@Component({
  selector: 'app-chores',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './chores.component.html',
  styleUrl: './chores.component.scss',
})
export class ChoresComponent {
  private svc = inject(StateService);

  chores = this.svc.chores;
  assignments = this.svc.assignments;

  newEmoji = signal('');
  newName = signal('');
  newDetail = signal('');

  editingId = signal<string | null>(null);
  editEmoji = signal('');
  editName = signal('');
  editDetail = signal('');

  addChore() {
    const name = this.newName().trim();
    if (!name) return;
    this.svc.addChore(name, this.newEmoji().trim() || '📋', this.newDetail().trim());
    this.newEmoji.set('');
    this.newName.set('');
    this.newDetail.set('');
  }

  startEdit(chore: Chore) {
    this.editingId.set(chore.id);
    this.editEmoji.set(chore.emoji);
    this.editName.set(chore.name);
    this.editDetail.set(chore.detail);
  }

  saveEdit(id: string) {
    const name = this.editName().trim();
    if (!name) return;
    this.svc.updateChore(id, name, this.editEmoji().trim() || '📋', this.editDetail().trim());
    this.editingId.set(null);
  }

  cancelEdit() {
    this.editingId.set(null);
  }

  deleteChore(chore: Chore) {
    const isAssigned = this.assignments().some(a => a.choreId === chore.id);
    if (isAssigned) {
      if (!confirm(`"${chore.name}" is assigned. Delete anyway?`)) return;
    }
    this.svc.deleteChore(chore.id);
  }
}
