import { describe, it, expect } from 'vitest';
import { TypingStatistics } from './TypingStatistics';
import { TypingAttempt } from './TypingAttempt';
import { TypingMatch } from './TypingMatch';
import { LenientMatchStrategy } from './LenientMatchStrategy';

describe('TypingStatistics', () => {
	const strategy = new LenientMatchStrategy();

	// Helper to create attempts
	function createAttempt(input: string, target: string, timestamp: number, duration: number): TypingAttempt {
		const isMatch = input.trim().toLowerCase() === target.trim().toLowerCase();
		const match = new TypingMatch(input, target, isMatch, strategy);
		return new TypingAttempt(match, timestamp, duration);
	}

	describe('constructor', () => {
		it('should handle empty attempts array', () => {
			const stats = new TypingStatistics([]);

			expect(stats.totalAttempts).toBe(0);
			expect(stats.successfulAttempts).toBe(0);
			expect(stats.totalCharactersTyped).toBe(0);
			expect(stats.totalWordsTyped).toBe(0);
			expect(stats.totalErrors).toBe(0);
			expect(stats.totalDurationMs).toBe(0);
		});

		it('should calculate stats for one successful attempt', () => {
			const attempts = [createAttempt('hello', 'hello', 1000, 5000)];
			const stats = new TypingStatistics(attempts);

			expect(stats.totalAttempts).toBe(1);
			expect(stats.successfulAttempts).toBe(1);
			expect(stats.totalCharactersTyped).toBe(5);
			expect(stats.totalWordsTyped).toBe(1);
			expect(stats.totalErrors).toBe(0);
			expect(stats.totalDurationMs).toBe(5000);
		});

		it('should calculate stats for one failed attempt', () => {
			const attempts = [createAttempt('wrong', 'hello', 1000, 5000)];
			const stats = new TypingStatistics(attempts);

			expect(stats.totalAttempts).toBe(1);
			expect(stats.successfulAttempts).toBe(0);
			expect(stats.totalErrors).toBe(1);
		});

		it('should handle multiple attempts', () => {
			const attempts = [
				createAttempt('hello', 'hello', 1000, 3000),  // Success
				createAttempt('world', 'world', 2000, 2000),  // Success
				createAttempt('wrong', 'test', 3000, 4000)    // Fail
			];
			const stats = new TypingStatistics(attempts);

			expect(stats.totalAttempts).toBe(3);
			expect(stats.successfulAttempts).toBe(2);
			expect(stats.totalErrors).toBe(1);
			expect(stats.totalDurationMs).toBe(9000);
		});

		it('should count words correctly', () => {
			const attempts = [
				createAttempt('hello world', 'hello world', 1000, 2000),  // 2 words
				createAttempt('test', 'test', 2000, 1000)                  // 1 word
			];
			const stats = new TypingStatistics(attempts);

			expect(stats.totalWordsTyped).toBe(3);
		});

		it('should count characters from input (not target)', () => {
			const attempts = [
				createAttempt('hello', 'hello', 1000, 1000),        // 5 chars
				createAttempt('world', 'world', 2000, 1000)         // 5 chars
			];
			const stats = new TypingStatistics(attempts);

			expect(stats.totalCharactersTyped).toBe(10);
		});
	});

	describe('accuracyRate', () => {
		it('should calculate 100% accuracy for all successful attempts', () => {
			const attempts = [
				createAttempt('hello', 'hello', 1000, 1000),
				createAttempt('world', 'world', 2000, 1000)
			];
			const stats = new TypingStatistics(attempts);

			expect(stats.accuracyRate).toBe(100);
		});

		it('should calculate 50% accuracy for half successful', () => {
			const attempts = [
				createAttempt('hello', 'hello', 1000, 1000),  // Success
				createAttempt('wrong', 'world', 2000, 1000)   // Fail
			];
			const stats = new TypingStatistics(attempts);

			expect(stats.accuracyRate).toBe(50);
		});

		it('should calculate 0% accuracy for all failed attempts', () => {
			const attempts = [
				createAttempt('wrong1', 'hello', 1000, 1000),
				createAttempt('wrong2', 'world', 2000, 1000)
			];
			const stats = new TypingStatistics(attempts);

			expect(stats.accuracyRate).toBe(0);
		});

		it('should return 0 for empty attempts', () => {
			const stats = new TypingStatistics([]);

			expect(stats.accuracyRate).toBe(0);
		});
	});

	describe('averageWPM', () => {
		it('should calculate WPM correctly', () => {
			const attempts = [
				createAttempt('hello world', 'hello world', 0, 10000)  // 2 words in 10s = 12 WPM
			];
			const stats = new TypingStatistics(attempts);

			expect(stats.averageWPM).toBeCloseTo(12, 0);
		});

		it('should return 0 for zero duration', () => {
			const attempts = [createAttempt('hello', 'hello', 1000, 0)];
			const stats = new TypingStatistics(attempts);

			expect(stats.averageWPM).toBe(0);
		});

		it('should return 0 for zero words', () => {
			const attempts = [createAttempt('', '', 1000, 5000)];
			const stats = new TypingStatistics(attempts);

			expect(stats.averageWPM).toBe(0);
		});

		it('should handle multiple attempts', () => {
			const attempts = [
				createAttempt('hello', 'hello', 0, 10000),      // 1 word in 10s
				createAttempt('world', 'world', 10000, 10000)   // 1 word in 10s
			];
			const stats = new TypingStatistics(attempts);

			// 2 words in 20s = 6 WPM
			expect(stats.averageWPM).toBeCloseTo(6, 0);
		});
	});

	describe('averageCPM', () => {
		it('should calculate CPM correctly', () => {
			const attempts = [
				createAttempt('hello', 'hello', 0, 10000)  // 5 chars in 10s = 30 CPM
			];
			const stats = new TypingStatistics(attempts);

			expect(stats.averageCPM).toBeCloseTo(30, 0);
		});

		it('should return 0 for zero duration', () => {
			const attempts = [createAttempt('hello', 'hello', 1000, 0)];
			const stats = new TypingStatistics(attempts);

			expect(stats.averageCPM).toBe(0);
		});

		it('should return 0 for zero characters', () => {
			const attempts = [createAttempt('', '', 1000, 5000)];
			const stats = new TypingStatistics(attempts);

			expect(stats.averageCPM).toBe(0);
		});

		it('should handle multiple attempts', () => {
			const attempts = [
				createAttempt('hello', 'hello', 0, 10000),      // 5 chars in 10s
				createAttempt('world', 'world', 10000, 10000)   // 5 chars in 10s
			];
			const stats = new TypingStatistics(attempts);

			// 10 chars in 20s = 30 CPM
			expect(stats.averageCPM).toBeCloseTo(30, 0);
		});
	});

	describe('edge cases', () => {
		it('should handle whitespace-only words', () => {
			const attempts = [createAttempt('   ', 'test', 1000, 1000)];
			const stats = new TypingStatistics(attempts);

			expect(stats.totalWordsTyped).toBe(0);
			expect(stats.totalCharactersTyped).toBe(3);
		});

		it('should handle large number of attempts', () => {
			const attempts = Array.from({ length: 1000 }, (_, i) =>
				createAttempt('test', 'test', i * 1000, 1000)
			);
			const stats = new TypingStatistics(attempts);

			expect(stats.totalAttempts).toBe(1000);
			expect(stats.successfulAttempts).toBe(1000);
		});

		it('should handle very long strings', () => {
			const longText = 'a'.repeat(10000);
			const attempts = [createAttempt(longText, longText, 0, 60000)];
			const stats = new TypingStatistics(attempts);

			expect(stats.totalCharactersTyped).toBe(10000);
		});
	});
});
