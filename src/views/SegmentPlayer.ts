import { App } from 'obsidian';
import { ChunkProgression } from '../domain/progression/ChunkProgression';
import { ChunkTiming } from '../domain/timing/ChunkTiming';
import { ProgressionState } from '../domain/progression/ProgressionState';

/**
 * SegmentPlayer - View Component
 * 
 * Manages the full-screen overlay for displaying text segments during speed reading.
 * Coordinates domain logic (ChunkProgression, ChunkTiming) with UI presentation.
 */
export class SegmentPlayer {
	private app: App;
	private progression: ChunkProgression;
	private timing: ChunkTiming;
	private overlayEl: HTMLElement | null = null;
	private displayEl: HTMLElement | null = null;
	private timerId: number | null = null;

	constructor(app: App, progression: ChunkProgression, timing: ChunkTiming) {
		this.app = app;
		this.progression = progression;
		this.timing = timing;
	}

	/**
	 * Show the overlay and start playback
	 */
	show(): void {
		this.createOverlay();
		this.start();
	}

	/**
	 * Hide the overlay and cleanup
	 */
	hide(): void {
		this.stop();
		this.removeOverlay();
	}

	/**
	 * Create and append the overlay to document.body
	 */
	private createOverlay(): void {
		// Create overlay container
		this.overlayEl = document.createElement('div');
		this.overlayEl.addClass('archetype-overlay');

		// Create segment display
		this.displayEl = document.createElement('div');
		this.displayEl.addClass('archetype-segment-display');

		// Add click handler for dismissal
		this.overlayEl.addEventListener('click', () => {
			this.hide();
		});

		// Assemble
		this.overlayEl.appendChild(this.displayEl);
		document.body.appendChild(this.overlayEl);

		// Display first segment
		this.updateDisplay();
	}

	/**
	 * Remove overlay from DOM
	 */
	private removeOverlay(): void {
		if (this.overlayEl) {
			this.overlayEl.remove();
			this.overlayEl = null;
			this.displayEl = null;
		}
	}

	/**
	 * Start segment progression
	 */
	private start(): void {
		if (this.progression.state !== ProgressionState.IDLE) {
			return;
		}

		this.progression.start();
		this.scheduleNext();
	}

	/**
	 * Stop segment progression
	 */
	private stop(): void {
		if (this.timerId !== null) {
			window.clearTimeout(this.timerId);
			this.timerId = null;
		}

		if (this.progression.state === ProgressionState.PLAYING) {
			this.progression.stop();
		}
	}

	/**
	 * Schedule the next segment display
	 */
	private scheduleNext(): void {
		const currentChunk = this.progression.currentChunk;
		if (!currentChunk) {
			// Completed
			this.hide();
			return;
		}

		// Calculate how long to display this segment
		const duration = this.timing.calculateDuration(currentChunk);

		// Schedule next advancement
		this.timerId = window.setTimeout(() => {
			if (this.progression.state !== ProgressionState.PLAYING) {
				return;
			}

			const nextChunk = this.progression.next();
			
			if (nextChunk === null) {
				// Reached the end
				this.hide();
				return;
			}

			this.updateDisplay();
			this.scheduleNext();
		}, duration);
	}

	/**
	 * Update the display with current segment
	 */
	private updateDisplay(): void {
		if (!this.displayEl) {
			return;
		}

		const currentChunk = this.progression.currentChunk;
		if (currentChunk) {
			this.displayEl.textContent = currentChunk.content;
		}
	}
}

