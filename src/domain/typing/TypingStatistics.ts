import { TypingAttempt } from './TypingAttempt';

/**
 * TypingStatistics - Value Object
 * 
 * Aggregated metrics calculated from typing attempts.
 * Immutable once created.
 */
export class TypingStatistics {
	readonly totalChunks: number;
	readonly completedChunks: number;
	readonly totalAttempts: number;
	readonly successfulAttempts: number;
	readonly accuracy: number; // 0.0-1.0
	readonly averageChunkTime: number; // milliseconds
	readonly typingSpeed: number; // characters per minute
	readonly errorCount: number;
	readonly sessionDuration: number; // milliseconds

	private constructor(
		totalChunks: number,
		completedChunks: number,
		totalAttempts: number,
		successfulAttempts: number,
		accuracy: number,
		averageChunkTime: number,
		typingSpeed: number,
		errorCount: number,
		sessionDuration: number
	) {
		this.totalChunks = totalChunks;
		this.completedChunks = completedChunks;
		this.totalAttempts = totalAttempts;
		this.successfulAttempts = successfulAttempts;
		this.accuracy = accuracy;
		this.averageChunkTime = averageChunkTime;
		this.typingSpeed = typingSpeed;
		this.errorCount = errorCount;
		this.sessionDuration = sessionDuration;
	}

	/**
	 * Calculate statistics from a collection of typing attempts
	 */
	static fromAttempts(attempts: TypingAttempt[], totalChunks: number): TypingStatistics {
		if (totalChunks < 0) {
			throw new Error('Total chunks must be non-negative');
		}

		// Handle empty attempts
		if (attempts.length === 0) {
			return new TypingStatistics(totalChunks, 0, 0, 0, 0, 0, 0, 0, 0);
		}

		const totalAttempts = attempts.length;
		const successfulAttempts = attempts.filter(a => a.isCorrect).length;
		const errorCount = totalAttempts - successfulAttempts;
		
		// Accuracy: successful attempts / total attempts
		const accuracy = totalAttempts > 0 ? successfulAttempts / totalAttempts : 0;
		
		// Completed chunks: unique chunk indices with successful attempts
		const completedChunkIndices = new Set(
			attempts.filter(a => a.isCorrect).map(a => a.chunkIndex)
		);
		const completedChunks = completedChunkIndices.size;
		
		// Average chunk time: sum of all attempt durations / number of completed chunks
		const totalDuration = attempts.reduce((sum, a) => sum + a.duration, 0);
		const averageChunkTime = completedChunks > 0 ? totalDuration / completedChunks : 0;
		
		// Typing speed (CPM): total characters typed / (total duration in minutes)
		const totalCharacters = attempts.reduce((sum, a) => sum + a.input.length, 0);
		const totalMinutes = totalDuration / 60000;
		const typingSpeed = totalMinutes > 0 ? Math.round(totalCharacters / totalMinutes) : 0;
		
		// Session duration: from first to last attempt
		const sessionDuration = totalDuration;

		return new TypingStatistics(
			totalChunks,
			completedChunks,
			totalAttempts,
			successfulAttempts,
			accuracy,
			Math.round(averageChunkTime),
			typingSpeed,
			errorCount,
			Math.round(sessionDuration)
		);
	}

	/**
	 * Get accuracy as a percentage (0-100)
	 */
	get accuracyPercentage(): number {
		return Math.round(this.accuracy * 100);
	}

	/**
	 * Check if session is complete (all chunks typed successfully)
	 */
	get isComplete(): boolean {
		return this.completedChunks === this.totalChunks && this.totalChunks > 0;
	}

	/**
	 * Get progress as a percentage (0-100)
	 */
	get progressPercentage(): number {
		if (this.totalChunks === 0) return 0;
		return Math.round((this.completedChunks / this.totalChunks) * 100);
	}
}

