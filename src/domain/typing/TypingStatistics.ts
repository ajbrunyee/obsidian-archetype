import { TypingAttempt } from './TypingAttempt';

/**
 * TypingStatistics - Value Object
 * 
 * Aggregated metrics calculated from typing attempts.
 * Immutable once created.
 */
export class TypingStatistics {
	readonly totalAttempts: number;
	readonly successfulAttempts: number;
	readonly totalCharactersTyped: number;
	readonly totalWordsTyped: number;
	readonly totalErrors: number;
	readonly totalDurationMs: number;

	constructor(attempts: TypingAttempt[]) {
		this.totalAttempts = attempts.length;
		this.successfulAttempts = attempts.filter(a => a.match.isMatch).length;
		this.totalCharactersTyped = attempts.reduce((sum, a) => sum + a.match.input.length, 0);
		this.totalWordsTyped = attempts.reduce((sum, a) => sum + a.match.input.split(/\s+/).filter(w => w.length > 0).length, 0);
		this.totalErrors = attempts.filter(a => !a.match.isMatch).length; // Simplified for now
		this.totalDurationMs = attempts.reduce((sum, a) => sum + a.duration, 0);
	}

	get accuracyRate(): number {
		return this.totalAttempts === 0 ? 0 : (this.successfulAttempts / this.totalAttempts) * 100;
	}

	get averageWPM(): number {
		if (this.totalDurationMs === 0 || this.totalWordsTyped === 0) return 0;
		return (this.totalWordsTyped / this.totalDurationMs) * 60000;
	}

	get averageCPM(): number {
		if (this.totalDurationMs === 0 || this.totalCharactersTyped === 0) return 0;
		return (this.totalCharactersTyped / this.totalDurationMs) * 60000;
	}
}
