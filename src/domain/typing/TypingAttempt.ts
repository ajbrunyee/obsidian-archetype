import { TypingMatch } from './TypingMatch';

/**
 * TypingAttempt - Value Object
 * 
 * Records a single typing attempt for a chunk.
 * Tracks both successful and unsuccessful attempts for statistics.
 */
export class TypingAttempt {
	readonly chunkIndex: number;
	readonly input: string;
	readonly target: string;
	readonly isCorrect: boolean;
	readonly attemptNumber: number;
	readonly duration: number; // milliseconds
	readonly timestamp: Date;
	readonly match: TypingMatch;

	constructor(
		chunkIndex: number,
		match: TypingMatch,
		attemptNumber: number,
		duration: number,
		timestamp: Date = new Date()
	) {
		// Validation
		if (chunkIndex < 0) {
			throw new Error('Chunk index must be non-negative');
		}
		if (attemptNumber < 1) {
			throw new Error('Attempt number must be positive (starts at 1)');
		}
		if (duration < 0) {
			throw new Error('Duration must be non-negative');
		}

		this.chunkIndex = chunkIndex;
		this.match = match;
		this.input = match.input;
		this.target = match.target;
		this.isCorrect = match.isMatch;
		this.attemptNumber = attemptNumber;
		this.duration = duration;
		this.timestamp = timestamp;
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
			this.chunkIndex === other.chunkIndex &&
			this.input === other.input &&
			this.target === other.target &&
			this.isCorrect === other.isCorrect &&
			this.attemptNumber === other.attemptNumber &&
			this.duration === other.duration &&
			this.timestamp.getTime() === other.timestamp.getTime()
		);
	}
}

