import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';

import { ErrorMessage } from '../../models/error-message';
import { ERROR_AUTO_CLOSE_MS } from '../../models/constans';

@Component({
  selector: 'app-error-notification',
  imports: [],
  templateUrl: './error-notification.html',
  styleUrl: './error-notification.scss',
})
export class ErrorNotificationComponent implements OnChanges {
  @Input() error: ErrorMessage = ErrorMessage.Default;
  @Output() close = new EventEmitter<void>();

  readonly ErrorMessage = ErrorMessage;

  private destroyRef = inject(DestroyRef);
  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['error']?.currentValue) {
      return;
    }

    this.clearTimer();

    this.closeTimer = setTimeout(() => {
      this.onClose();
    }, ERROR_AUTO_CLOSE_MS);

    this.destroyRef.onDestroy(() => this.clearTimer());
  }

  onClose(): void {
    this.clearTimer();
    this.close.emit();
  }

  private clearTimer(): void {
    if (this.closeTimer !== null) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }
}
