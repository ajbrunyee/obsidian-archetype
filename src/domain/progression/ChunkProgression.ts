import { ChunkSequence } from '../chunking/ChunkSequence';
import { Chunk } from '../chunking/Chunk';
import { ProgressionState } from './ProgressionState';

/**
 * ChunkProgression - Entity
 * 
 * Manages the playback state and navigation through a chunk sequence.
 * This is the core coordinator for timed reading sessions.
 */
export class ChunkProgression {
	private _state: ProgressionState;
	private _currentIndex: number;
	private readonly _sequence: ChunkSequence;

	constructor(sequence: ChunkSequence) {
		if (sequence.isEmpty) {
			throw new Error('Cannot create progression from empty sequence');
		}
		this._sequence = sequence;
		this._state = ProgressionState.IDLE;
		this._currentIndex = 0;
	}

	/**
	 * Get the current playback state
	 */
	get state(): ProgressionState {
		return this._state;
	}

	/**
	 * Get the current chunk index (0-based)
	 */
	get currentIndex(): number {
		return this._currentIndex;
	}

	/**
	 * Get the current chunk being displayed
	 */
	get currentChunk(): Chunk | null {
		return this._sequence.getChunk(this._currentIndex);
	}

	/**
	 * Get the chunk sequence
	 */
	get sequence(): ChunkSequence {
		return this._sequence;
	}

	/**
	 * Check if there are more chunks to display
	 */
	get hasNext(): boolean {
		return this._sequence.hasNext(this._currentIndex);
	}

	/**
	 * Check if there are previous chunks
	 */
	get hasPrevious(): boolean {
		return this._sequence.hasPrevious(this._currentIndex);
	}

	/**
	 * Start progression from the beginning or current position
	 * @throws Error if already playing
	 */
	start(): void {
		if (this._state === ProgressionState.PLAYING) {
			throw new Error('Progression is already playing');
		}

		// If completed, reset to beginning
		if (this._state === ProgressionState.COMPLETED) {
			this._currentIndex = 0;
		}

		this._state = ProgressionState.PLAYING;
	}

	/**
	 * Pause progression at current position
	 * @throws Error if not playing
	 */
	pause(): void {
		if (this._state !== ProgressionState.PLAYING) {
			throw new Error('Progression is not playing');
		}
		this._state = ProgressionState.PAUSED;
	}

	/**
	 * Resume progression from paused state
	 * @throws Error if not paused
	 */
	resume(): void {
		if (this._state !== ProgressionState.PAUSED) {
			throw new Error('Progression is not paused');
		}
		this._state = ProgressionState.PLAYING;
	}

	/**
	 * Stop progression and reset to beginning
	 */
	stop(): void {
		this._state = ProgressionState.IDLE;
		this._currentIndex = 0;
	}

	/**
	 * Advance to the next chunk
	 * @returns The next chunk, or null if at end
	 * @throws Error if not playing
	 */
	next(): Chunk | null {
		if (this._state !== ProgressionState.PLAYING) {
			throw new Error('Progression must be playing to advance');
		}

		if (!this.hasNext) {
			// Reached the end
			this._state = ProgressionState.COMPLETED;
			return null;
		}

		this._currentIndex++;
		return this.currentChunk;
	}

	/**
	 * Go back to the previous chunk
	 * @returns The previous chunk, or null if at beginning
	 * @throws Error if not playing
	 */
	previous(): Chunk | null {
		if (this._state !== ProgressionState.PLAYING) {
			throw new Error('Progression must be playing to go back');
		}

		if (!this.hasPrevious) {
			return null;
		}

		this._currentIndex--;
		return this.currentChunk;
	}

	/**
	 * Reset to beginning without changing state
	 */
	reset(): void {
		this._currentIndex = 0;
		if (this._state === ProgressionState.COMPLETED) {
			this._state = ProgressionState.IDLE;
		}
	}
}

