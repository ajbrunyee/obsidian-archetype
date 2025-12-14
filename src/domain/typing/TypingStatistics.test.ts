import { describe, it, expect } from 'vitest';
import { TypingStatistics } from './TypingStatistics';
import { TypingAttempt } from './TypingAttempt';
import { TypingMatch } from './TypingMatch';
import { LenientMatchStrategy } from './LenientMatchStrategy';

describe('TypingStatistics', () => {
	const strategy = new LenientMatchStrategy();

	describe('fromAttempts - empty attempts', () => {
		it('should handle empty attempts array', () => {
			const stats = TypingStatistics.fromAttempts([], 10);
			
			expect(stats.totalChunks).toBe(10);
			expect(stats.completedChunks).toBe(0);
			expect(stats.totalAttempts).toBe(0);
			expect(stats.successfulAttempts).toBe(0);
			expect(stats.accuracy).toBe(0);
			expect(stats.averageChunkTime).toBe(0);
			expect(stats.typingSpeed).toBe(0);
			expect(stats.errorCount).toBe(0);
			expect(stats.sessionDuration).toBe(0);
		});

		it('should throw error for negative total chunks', () => {
			expect(() => TypingStatistics.fromAttempts([], -1)).toThrow('Total chunks must be non-negative');
		});

		it('should allow zero total chunks', () => {
			const stats = TypingStatistics.fromAttempts([], 0);
			expect(stats.totalChunks).toBe(0);
		});
	});

	describe('fromAttempts - single attempt', () => {
		it('should calculate stats for one successful attempt', () => {
			const match = new TypingMatch('hello', 'hello', true, strategy);
			const attempt = new TypingAttempt(0, match, 1, 1500);
			
			const stats = TypingStatistics.fromAttempts([attempt], 1);
			
			expect(stats.totalChunks).toBe(1);
			expect(stats.completedChunks).toBe(1);
			expect(stats.totalAttempts).toBe(1);
			expect(stats.successfulAttempts).toBe(1);
			expect(stats.accuracy).toBe(1.0);
			expect(stats.averageChunkTime).toBe(1500);
			expect(stats.errorCount).toBe(0);
		});

		it('should calculate stats for one failed attempt', () => {
			const match = new TypingMatch('helo', 'hello', false, strategy);
			const attempt = new TypingAttempt(0, match, 1, 1200);
			
			const stats = TypingStatistics.fromAttempts([attempt], 5);
			
			expect(stats.totalChunks).toBe(5);
			expect(stats.completedChunks).toBe(0); // No successful completions
			expect(stats.totalAttempts).toBe(1);
			expect(stats.successfulAttempts).toBe(0);
			expect(stats.accuracy).toBe(0.0);
			expect(stats.errorCount).toBe(1);
		});
	});

	describe('fromAttempts - multiple attempts on same chunk', () => {
		it('should track all attempts but count chunk once when completed', () => {
			const match1 = new TypingMatch('helo', 'hello', false, strategy);
			const attempt1 = new TypingAttempt(0, match1, 1, 1000);
			
			const match2 = new TypingMatch('hllo', 'hello', false, strategy);
			const attempt2 = new TypingAttempt(0, match2, 2, 1200);
			
			const match3 = new TypingMatch('hello', 'hello', true, strategy);
			const attempt3 = new TypingAttempt(0, match3, 3, 1500);
			
			const stats = TypingStatistics.fromAttempts([attempt1, attempt2, attempt3], 5);
			
			expect(stats.totalAttempts).toBe(3);
			expect(stats.successfulAttempts).toBe(1); // Only last attempt
			expect(stats.completedChunks).toBe(1); // Chunk 0 completed
			expect(stats.errorCount).toBe(2);
			expect(stats.accuracy).toBe(1 / 3); // 1 success out of 3 attempts
		});
	});

	describe('fromAttempts - multiple chunks', () => {
		it('should calculate stats for perfect session (all first attempts)', () => {
			const attempts = [
				new TypingAttempt(0, new TypingMatch('hello', 'hello', true, strategy), 1, 1500),
				new TypingAttempt(1, new TypingMatch('world', 'world', true, strategy), 1, 1200),
				new TypingAttempt(2, new TypingMatch('test', 'test', true, strategy), 1, 1800),
			];
			
			const stats = TypingStatistics.fromAttempts(attempts, 3);
			
			expect(stats.totalChunks).toBe(3);
			expect(stats.completedChunks).toBe(3);
			expect(stats.totalAttempts).toBe(3);
			expect(stats.successfulAttempts).toBe(3);
			expect(stats.accuracy).toBe(1.0);
			expect(stats.errorCount).toBe(0);
			expect(stats.isComplete).toBe(true);
		});

		it('should calculate stats for session with errors', () => {
			const attempts = [
				// Chunk 0: fail, then succeed
				new TypingAttempt(0, new TypingMatch('helo', 'hello', false, strategy), 1, 1000),
				new TypingAttempt(0, new TypingMatch('hello', 'hello', true, strategy), 2, 1500),
				// Chunk 1: succeed first try
				new TypingAttempt(1, new TypingMatch('world', 'world', true, strategy), 1, 1200),
			];
			
			const stats = TypingStatistics.fromAttempts(attempts, 3);
			
			expect(stats.totalChunks).toBe(3);
			expect(stats.completedChunks).toBe(2); // Chunks 0 and 1
			expect(stats.totalAttempts).toBe(3);
			expect(stats.successfulAttempts).toBe(2);
			expect(stats.accuracy).toBe(2 / 3); // 2 successes out of 3 attempts
			expect(stats.errorCount).toBe(1);
		});
	});

	describe('accuracy calculation', () => {
		it('should calculate 100% accuracy for all successful attempts', () => {
			const attempts = [
				new TypingAttempt(0, new TypingMatch('a', 'a', true, strategy), 1, 1000),
				new TypingAttempt(1, new TypingMatch('b', 'b', true, strategy), 1, 1000),
				new TypingAttempt(2, new TypingMatch('c', 'c', true, strategy), 1, 1000),
			];
			
			const stats = TypingStatistics.fromAttempts(attempts, 3);
			expect(stats.accuracy).toBe(1.0);
			expect(stats.accuracyPercentage).toBe(100);
		});

		it('should calculate 50% accuracy for half successful', () => {
			const attempts = [
				new TypingAttempt(0, new TypingMatch('a', 'a', true, strategy), 1, 1000),
				new TypingAttempt(1, new TypingMatch('x', 'b', false, strategy), 1, 1000),
			];
			
			const stats = TypingStatistics.fromAttempts(attempts, 3);
			expect(stats.accuracy).toBe(0.5);
			expect(stats.accuracyPercentage).toBe(50);
		});

		it('should calculate 0% accuracy for all failed attempts', () => {
			const attempts = [
				new TypingAttempt(0, new TypingMatch('x', 'a', false, strategy), 1, 1000),
				new TypingAttempt(1, new TypingMatch('y', 'b', false, strategy), 1, 1000),
			];
			
			const stats = TypingStatistics.fromAttempts(attempts, 3);
			expect(stats.accuracy).toBe(0.0);
			expect(stats.accuracyPercentage).toBe(0);
		});
	});

	describe('averageChunkTime calculation', () => {
		it('should calculate average time across all attempts', () => {
			const attempts = [
				new TypingAttempt(0, new TypingMatch('a', 'a', true, strategy), 1, 1000),
				new TypingAttempt(1, new TypingMatch('b', 'b', true, strategy), 1, 2000),
				new TypingAttempt(2, new TypingMatch('c', 'c', true, strategy), 1, 3000),
			];
			
			const stats = TypingStatistics.fromAttempts(attempts, 3);
			// Total: 6000ms / 3 chunks = 2000ms average
			expect(stats.averageChunkTime).toBe(2000);
		});

		it('should include failed attempts in average', () => {
			const attempts = [
				new TypingAttempt(0, new TypingMatch('x', 'a', false, strategy), 1, 1000),
				new TypingAttempt(0, new TypingMatch('a', 'a', true, strategy), 2, 2000),
			];
			
			const stats = TypingStatistics.fromAttempts(attempts, 3);
			// Total: 3000ms / 1 completed chunk = 3000ms
			expect(stats.averageChunkTime).toBe(3000);
		});
	});

	describe('typingSpeed calculation', () => {
		it('should calculate CPM correctly', () => {
			const attempts = [
				new TypingAttempt(0, new TypingMatch('hello', 'hello', true, strategy), 1, 1000), // 5 chars, 1 sec
				new TypingAttempt(1, new TypingMatch('world', 'world', true, strategy), 1, 1000), // 5 chars, 1 sec
			];
			
			const stats = TypingStatistics.fromAttempts(attempts, 2);
			// 10 chars in 2 seconds = 300 CPM
			expect(stats.typingSpeed).toBe(300);
		});

		it('should return 0 for zero duration', () => {
			const attempts = [
				new TypingAttempt(0, new TypingMatch('a', 'a', true, strategy), 1, 0),
			];
			
			const stats = TypingStatistics.fromAttempts(attempts, 1);
			expect(stats.typingSpeed).toBe(0);
		});
	});

	describe('sessionDuration calculation', () => {
		it('should sum all attempt durations', () => {
			const attempts = [
				new TypingAttempt(0, new TypingMatch('a', 'a', true, strategy), 1, 1000),
				new TypingAttempt(1, new TypingMatch('b', 'b', true, strategy), 1, 2000),
				new TypingAttempt(2, new TypingMatch('c', 'c', true, strategy), 1, 3000),
			];
			
			const stats = TypingStatistics.fromAttempts(attempts, 3);
			expect(stats.sessionDuration).toBe(6000); // 1000 + 2000 + 3000
		});
	});

	describe('isComplete', () => {
		it('should return true when all chunks completed', () => {
			const attempts = [
				new TypingAttempt(0, new TypingMatch('a', 'a', true, strategy), 1, 1000),
				new TypingAttempt(1, new TypingMatch('b', 'b', true, strategy), 1, 1000),
			];
			
			const stats = TypingStatistics.fromAttempts(attempts, 2);
			expect(stats.isComplete).toBe(true);
		});

		it('should return false when some chunks incomplete', () => {
			const attempts = [
				new TypingAttempt(0, new TypingMatch('a', 'a', true, strategy), 1, 1000),
			];
			
			const stats = TypingStatistics.fromAttempts(attempts, 3);
			expect(stats.isComplete).toBe(false);
		});

		it('should return false for empty session', () => {
			const stats = TypingStatistics.fromAttempts([], 0);
			expect(stats.isComplete).toBe(false); // 0 chunks means nothing to complete
		});
	});

	describe('progressPercentage', () => {
		it('should return 0 for no completed chunks', () => {
			const stats = TypingStatistics.fromAttempts([], 10);
			expect(stats.progressPercentage).toBe(0);
		});

		it('should return 100 for all chunks completed', () => {
			const attempts = [
				new TypingAttempt(0, new TypingMatch('a', 'a', true, strategy), 1, 1000),
				new TypingAttempt(1, new TypingMatch('b', 'b', true, strategy), 1, 1000),
			];
			
			const stats = TypingStatistics.fromAttempts(attempts, 2);
			expect(stats.progressPercentage).toBe(100);
		});

		it('should return 50 for half completed', () => {
			const attempts = [
				new TypingAttempt(0, new TypingMatch('a', 'a', true, strategy), 1, 1000),
			];
			
			const stats = TypingStatistics.fromAttempts(attempts, 2);
			expect(stats.progressPercentage).toBe(50);
		});

		it('should return 0 for zero total chunks', () => {
			const stats = TypingStatistics.fromAttempts([], 0);
			expect(stats.progressPercentage).toBe(0);
		});
	});

	describe('immutability', () => {
		it('properties are readonly (enforced by TypeScript)', () => {
			const attempts = [
				new TypingAttempt(0, new TypingMatch('a', 'a', true, strategy), 1, 1000),
			];
			const stats = TypingStatistics.fromAttempts(attempts, 5);
			
			// TypeScript prevents modification at compile time
			// This test documents the expectation
			expect(stats.totalChunks).toBe(5);
			expect(stats.completedChunks).toBe(1);
		});
	});

	describe('edge cases', () => {
		it('should handle large number of attempts', () => {
			const attempts = Array.from({ length: 1000 }, (_, i) =>
				new TypingAttempt(i, new TypingMatch('a', 'a', true, strategy), 1, 1000)
			);
			
			const stats = TypingStatistics.fromAttempts(attempts, 1000);
			expect(stats.totalAttempts).toBe(1000);
			expect(stats.completedChunks).toBe(1000);
			expect(stats.isComplete).toBe(true);
		});

		it('should handle very long session duration', () => {
			const attempts = [
				new TypingAttempt(0, new TypingMatch('a', 'a', true, strategy), 1, 3600000), // 1 hour
			];
			
			const stats = TypingStatistics.fromAttempts(attempts, 1);
			expect(stats.sessionDuration).toBe(3600000);
		});

		it('should round decimal values', () => {
			const attempts = [
				new TypingAttempt(0, new TypingMatch('ab', 'ab', true, strategy), 1, 1500),
				new TypingAttempt(1, new TypingMatch('cd', 'cd', true, strategy), 1, 2500),
			];
			
			const stats = TypingStatistics.fromAttempts(attempts, 2);
			// Average: 4000 / 2 = 2000 (exact, no rounding needed but should still be integer)
			expect(Number.isInteger(stats.averageChunkTime)).toBe(true);
			expect(Number.isInteger(stats.typingSpeed)).toBe(true);
		});
	});
});

