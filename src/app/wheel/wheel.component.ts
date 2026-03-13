import {
  Component,
  inject,
  signal,
  computed,
  ElementRef,
  viewChild,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService, Player, Chore } from '../services/state.service';

interface WheelSegment {
  chore: Chore;
  startAngle: number;
  endAngle: number;
  path: string;
  labelX: number;
  labelY: number;
  labelAngle: number;
  color: string;
}

const SEGMENT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#FF8B94',
  '#B39DDB', '#80DEEA', '#FFCC80', '#F48FB1', '#C5E1A5',
];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function segmentPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

@Component({
  selector: 'app-wheel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wheel.component.html',
  styleUrl: './wheel.component.scss',
})
export class WheelComponent {
  private svc = inject(StateService);

  players = this.svc.players;
  chores = this.svc.chores;
  assignments = this.svc.assignments;
  unassigned = this.svc.unassignedChores;

  selectedPlayerId = signal<string>('');
  spinning = signal(false);
  rotation = signal(0);
  resultChore = signal<Chore | null>(null);
  resultPlayer = signal<Player | null>(null);

  readonly CX = 200;
  readonly CY = 200;
  readonly R = 180;

  segments = computed<WheelSegment[]>(() => {
    const chores = this.unassigned();
    if (!chores.length) return [];
    const segAngle = 360 / chores.length;
    return chores.map((chore, i) => {
      const start = i * segAngle;
      const end = start + segAngle;
      const mid = start + segAngle / 2;
      const lp = polarToCartesian(this.CX, this.CY, this.R * 0.65, mid);
      return {
        chore,
        startAngle: start,
        endAngle: end,
        path: segmentPath(this.CX, this.CY, this.R, start, end),
        labelX: lp.x,
        labelY: lp.y,
        labelAngle: mid - 90,
        color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
      };
    });
  });

  canSpin = computed(
    () => !!this.selectedPlayerId() && this.unassigned().length > 0 && !this.spinning()
  );

  selectedPlayer = computed(() =>
    this.players().find(p => p.id === this.selectedPlayerId()) ?? null
  );

  playerAssignments(playerId: string) {
    return this.svc.assignmentsForPlayer(playerId)();
  }

  spin() {
    if (!this.canSpin()) return;
    this.spinning.set(true);
    this.resultChore.set(null);
    this.resultPlayer.set(null);

    const chores = this.unassigned();
    const segAngle = 360 / chores.length;
    const extraTurns = (5 + Math.floor(Math.random() * 3)) * 360;
    const targetIndex = Math.floor(Math.random() * chores.length);
    // Place target index under the pointer (top = 0°):
    // pointer is at top. A segment at index i occupies [i*segAngle, (i+1)*segAngle].
    // We want the midpoint of that segment to land at top after rotation.
    const targetMid = targetIndex * segAngle + segAngle / 2;
    const finalRotation = extraTurns + (360 - targetMid);

    this.rotation.set(finalRotation);

    setTimeout(() => {
      const norm = (360 - (finalRotation % 360)) % 360;
      const winIndex = Math.floor(norm / segAngle) % chores.length;
      const won = chores[winIndex];
      const playerId = this.selectedPlayerId();
      this.svc.addAssignment(won.id, playerId);
      this.resultChore.set(won);
      this.resultPlayer.set(this.players().find(p => p.id === playerId) ?? null);
      this.selectedPlayerId.set('');
      this.spinning.set(false);
      // Reset rotation instantly after spin so next spin can animate fresh
      // (reset happens after a small delay so CSS transition doesn't fight)
      setTimeout(() => this.rotation.set(0), 50);
    }, 4100);
  }

  toggleDone(choreId: string) {
    this.svc.toggleDone(choreId);
  }

  unassign(choreId: string) {
    this.svc.unassignChore(choreId);
  }

  reset() {
    this.svc.resetAssignments();
    this.resultChore.set(null);
    this.resultPlayer.set(null);
    this.rotation.set(0);
  }
}
