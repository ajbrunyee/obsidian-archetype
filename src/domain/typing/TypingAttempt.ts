import { TypingMatch } from './TypingMatch';

/**
 * TypingAttempt - Value Object
 * 
 * Records a single typing attempt for a chunk.
 * Tracks both successful and unsuccessful attempts for statistics.
 */
export class TypingAttempt {
	readonly match: TypingMatch;
	readonly timestamp: number; // Unix timestamp in milliseconds
	readonly duration: number; // milliseconds

	// Derived convenience properties
	readonly input: string;
	readonly target: string;
	readonly isCorrect: boolean;

	constructor(
		match: TypingMatch,
		timestamp: number,
		duration: number
	) {
		// Validation
		if (duration < 0) {
			throw new Error('Duration cannot be negative.');
		}

		this.match = match;
		this.timestamp = timestamp;
		this.duration = duration;

		// Derived from match
		this.input = match.input;
		this.target = match.target;
		this.isCorrect = match.isMatch;
	}

	/**
	 * Get the strategy name used for this attempt
	 */
	get strategyName(): string {
		return this.match.strategyName;
	}

	/**
	 * Calculate characters per minute for this attempt
	 */
	get charactersPerMinute(): number {
		if (this.duration === 0) return 0;
		
		const minutes = this.duration / 60000;
		return Math.round(this.input.length / minutes);
	}

	/**
	 * Value equality check
	 */
	equals(other: TypingAttempt): boolean {
		return (
			this.input === other.input &&
			this.target === other.target &&
			this.isCorrect === other.isCorrect &&
			this.duration === other.duration &&
			this.timestamp === other.timestamp
		);
	}
}

