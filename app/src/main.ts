interface Lap {
  id: string;
  number: number;
  totalTime: number;
  splitTime: number;
  isSkipped?: boolean;
}

declare global {
  interface GlobalTracker {
    lapTracker: LapTracker;
  }

  // Extend the base declarations
  let lapTracker: LapTracker;
}

class LapTracker {
  private laps: Lap[] = [];
  private startTime: number | null = null;
  private isRunning: boolean = false;
  private lastLapTime: number | null = null;
  private skippedLaps: Set<string> = new Set();

  private elements: {
    startStopButton: HTMLButtonElement;
    recordButton: HTMLButtonElement;
    resetButton: HTMLButtonElement;
    totalLaps: HTMLElement;
    avgLapTime: HTMLElement;
    lapTableBody: HTMLElement;
    buttonGroup: HTMLElement;
  };

  constructor() {
    this.elements = {
      startStopButton: document.getElementById('startStopButton') as HTMLButtonElement,
      recordButton: document.getElementById('recordButton') as HTMLButtonElement,
      resetButton: document.getElementById('resetButton') as HTMLButtonElement,
      totalLaps: document.getElementById('totalLaps')!,
      avgLapTime: document.getElementById('avgLapTime')!,
      lapTableBody: document.getElementById('lapTableBody')!,
      buttonGroup: document.querySelector('.button-group')!
    };

    // Bind methods that need to be called from HTML
    this.toggleSkip = this.toggleSkip.bind(this);
    this.splitLap = this.splitLap.bind(this);

    this.elements.startStopButton.addEventListener('click', () => this.toggleRecording());
    this.elements.recordButton.addEventListener('click', () => this.recordLap());
    this.elements.resetButton.addEventListener('click', () => this.reset());

    // Initially hide record button
    this.elements.recordButton.style.display = 'none';
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins}:${secs.padStart(4, '0')}`;
  }

  private calculateTimeSinceLastLap(currentTime: number): number {
    if (!this.lastLapTime) return currentTime - (this.startTime || currentTime);
    return currentTime - this.lastLapTime;
  }

  private toggleRecording(): void {
    if (!this.isRunning) {
      // Start recording
      this.startTime = Date.now() / 1000;
      this.isRunning = true;
      this.lastLapTime = this.startTime;

      // Update UI for recording state
      this.elements.startStopButton.textContent = 'Stop';
      this.elements.startStopButton.classList.remove('button-success');
      this.elements.startStopButton.classList.add('button-danger');

      // Show and update record button
      this.elements.recordButton.style.display = 'block';
      this.elements.recordButton.innerHTML = `
                <div class="button-recording">
                    <div class="recording-dot"></div>
                    Record New Lap
                </div>
            `;
    } else {
      // Stop recording
      this.recordLap(); // Record final lap
      this.isRunning = false;

      // Update UI for stopped state
      this.elements.startStopButton.textContent = 'Start';
      this.elements.startStopButton.classList.remove('button-danger');
      this.elements.startStopButton.classList.add('button-success');

      // Hide and reset record button
      this.elements.recordButton.style.display = 'none';
      this.elements.recordButton.innerHTML = 'Record Lap';
    }
  }

  private recordLap(): void {
    if (!this.isRunning) return;

    const currentTime = Date.now() / 1000;
    const lapTime = currentTime - (this.startTime || currentTime);
    const timeSinceLastLap = this.calculateTimeSinceLastLap(currentTime);

    this.laps.push({
      id: this.generateId(),
      number: this.laps.length + 1,
      totalTime: lapTime,
      splitTime: timeSinceLastLap
    });

    this.lastLapTime = currentTime;
    this.updateUI();
  }

  public toggleSkip(lapId: string): void {
    const lapIndex = this.laps.findIndex(lap => lap.id === lapId);
    if (lapIndex === -1) return;

    if (this.skippedLaps.has(lapId)) {
      this.skippedLaps.delete(lapId);
      this.laps[lapIndex].isSkipped = false;
    } else {
      this.skippedLaps.add(lapId);
      this.laps[lapIndex].isSkipped = true;
    }

    this.updateUI();
  }

  public splitLap(lapId: string): void {
    const lapIndex = this.laps.findIndex(lap => lap.id === lapId);
    if (lapIndex === -1) return;

    const originalLap = this.laps[lapIndex];
    const halfSplitTime = originalLap.splitTime / 2;

    const firstHalf: Lap = {
      id: this.generateId(),
      number: originalLap.number,
      totalTime: originalLap.totalTime - halfSplitTime,
      splitTime: halfSplitTime
    };

    const secondHalf: Lap = {
      id: this.generateId(),
      number: originalLap.number + 1,
      totalTime: originalLap.totalTime,
      splitTime: halfSplitTime
    };

    // Replace original lap with split laps
    this.laps.splice(lapIndex, 1, firstHalf, secondHalf);

    // Renumber all subsequent laps
    for (let i = lapIndex + 2; i < this.laps.length; i++) {
      this.laps[i].number++;
    }

    this.updateUI();
  }

  private reset(): void {
    this.laps = [];
    this.startTime = null;
    this.isRunning = false;
    this.lastLapTime = null;
    this.skippedLaps.clear();

    // Reset UI
    this.elements.startStopButton.textContent = 'Start';
    this.elements.startStopButton.classList.remove('button-danger');
    this.elements.startStopButton.classList.add('button-success');

    // Reset record button
    this.elements.recordButton.style.display = 'none';
    this.elements.recordButton.innerHTML = 'Record Lap';

    this.updateUI();
  }

  private updateUI(): void {
    // Update stats
    const activeLapCount = this.laps.filter(lap => !lap.isSkipped).length;
    this.elements.totalLaps.textContent = activeLapCount.toString();
    this.elements.avgLapTime.textContent = this.formatTime(this.calculateAverageLapTime());

    // Update table
    this.elements.lapTableBody.innerHTML = this.laps
      .map(lap => `
                <tr class="${lap.isSkipped ? 'skipped-lap' : ''}">
                    <td>${lap.number}</td>
                    <td>${this.formatTime(lap.totalTime)}</td>
                    <td>${lap.splitTime.toFixed(2)}</td>
                    <td class="action-buttons">
                        <button
                            class="button button-sm button-success"
                            onclick="globalThis.lapTracker.toggleSkip('${lap.id}')"
                        >
                            ${lap.isSkipped ? 'Undo' : 'Skip'}
                        </button>
                        <button
                            class="button button-sm button-success"
                            onclick="globalThis.lapTracker.splitLap('${lap.id}')"
                            ${lap.isSkipped ? 'disabled' : ''}
                        >
                            Split
                        </button>
                    </td>
                </tr>
            `)
      .join('');
  }

  private calculateAverageLapTime(): number {
    const unskippedLaps = this.laps.filter(lap => !lap.isSkipped);
    if (unskippedLaps.length === 0) return 0;
    return unskippedLaps.reduce((acc, lap) => acc + lap.splitTime, 0) / unskippedLaps.length;
  }
}

// Initialize the app and make it globally available for button click handlers
let lapTracker: LapTracker;
globalThis.addEventListener('DOMContentLoaded', () => {
  lapTracker = new LapTracker();
  (globalThis as unknown as GlobalTracker).lapTracker = lapTracker;
});
