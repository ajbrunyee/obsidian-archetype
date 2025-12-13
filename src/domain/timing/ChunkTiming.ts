import { Chunk } from '../chunking/Chunk';
import { ReadingSpeed } from './ReadingSpeed';

/**
 * Timing constraints
 */
export const MIN_DISPLAY_DURATION = 100; // milliseconds
export const MAX_DISPLAY_DURATION = 10000; // milliseconds

/**
 * ChunkTiming - Value Object
 * 
 * Calculates display durations for chunks based on reading speed.
 */
export class ChunkTiming {
	private readonly _readingSpeed: ReadingSpeed;

	constructor(readingSpeed: ReadingSpeed) {
		this._readingSpeed = readingSpeed;
	}

	/**
	 * Get the reading speed
	 */
	get readingSpeed(): ReadingSpeed {
		return this._readingSpeed;
	}

	/**
	 * Calculate the display duration for a chunk in milliseconds
	 * Formula: (wordCount / WPM) * 60000
	 * Result is constrained to MIN_DISPLAY_DURATION and MAX_DISPLAY_DURATION
	 */
	calculateDuration(chunk: Chunk): number {
		const wordCount = chunk.wordCount();
		const wpm = this._readingSpeed.wpm;

		// Calculate raw duration
		const rawDuration = (wordCount / wpm) * 60000;

		// Apply constraints
		return Math.round(
			Math.max(MIN_DISPLAY_DURATION, Math.min(MAX_DISPLAY_DURATION, rawDuration))
		);
	}
}

