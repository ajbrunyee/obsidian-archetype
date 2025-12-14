import { MatchStrategy } from './MatchStrategy';

/**
 * TypingMatch - Value Object
 * 
 * Represents the result of comparing user input to target text.
 * Immutable once created.
 */
export class TypingMatch {
	readonly input: string;
	readonly target: string;
	readonly isMatch: boolean;
	readonly strategy: MatchStrategy;
	readonly timestamp: Date;

	constructor(
		input: string,
		target: string,
		isMatch: boolean,
		strategy: MatchStrategy,
		timestamp: Date = new Date()
	) {
		this.input = input;
		this.target = target;
		this.isMatch = isMatch;
		this.strategy = strategy;
		this.timestamp = timestamp;
	}

	/**
	 * Get the name of the strategy used
	 */
	get strategyName(): string {
		return this.strategy.name;
	}

	/**
	 * Value equality check
	 */
	equals(other: TypingMatch): boolean {
		return (
			this.input === other.input &&
			this.target === other.target &&
			this.isMatch === other.isMatch &&
			this.strategy.name === other.strategy.name &&
			this.timestamp.getTime() === other.timestamp.getTime()
		);
	}
}

