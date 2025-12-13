import { Chunk } from '../chunking/Chunk';
import { ReadingSpeed } from './ReadingSpeed';

/**
 * Timing constraints
 */
export const MIN_DISPLAY_DURATION = 100; // milliseconds
export const MAX_DISPLAY_DURATION = 10000; // milliseconds
export const SENTENCE_END_MULTIPLIER = 3.0; // 3x longer pause at sentence boundaries

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
	 * Chunks ending with sentence punctuation (. ! ?) get a longer pause
	 */
	calculateDuration(chunk: Chunk): number {
		const wordCount = chunk.wordCount();
		const wpm = this._readingSpeed.wpm;

		// Calculate raw duration
		let rawDuration = (wordCount / wpm) * 60000;

		// Apply sentence boundary multiplier if chunk ends with sentence punctuation
		if (this.endsWithSentence(chunk.content)) {
			rawDuration *= SENTENCE_END_MULTIPLIER;
		}

		// Apply constraints
		return Math.round(
			Math.max(MIN_DISPLAY_DURATION, Math.min(MAX_DISPLAY_DURATION, rawDuration))
		);
	}

	/**
	 * Check if chunk ends with sentence-ending punctuation
	 */
	private endsWithSentence(content: string): boolean {
		const trimmed = content.trim();
		return /[.!?]$/.test(trimmed);
	}
}

