import { describe, it, expect } from 'vitest';
import { TypingAttempt } from './TypingAttempt';
import { TypingMatch } from './TypingMatch';
import { LenientMatchStrategy } from './LenientMatchStrategy';

describe('TypingAttempt', () => {
	const strategy = new LenientMatchStrategy();
	const fixedDate = new Date('2025-12-13T10:00:00Z');

	describe('constructor', () => {
		it('should create an attempt with all properties', () => {
			const match = new TypingMatch('hello', 'Hello', true, strategy, fixedDate);
			const attempt = new TypingAttempt(0, match, 1, 1500, fixedDate);
			
			expect(attempt.chunkIndex).toBe(0);
			expect(attempt.input).toBe('hello');
			expect(attempt.target).toBe('Hello');
			expect(attempt.isCorrect).toBe(true);
			expect(attempt.attemptNumber).toBe(1);
			expect(attempt.duration).toBe(1500);
			expect(attempt.timestamp).toBe(fixedDate);
			expect(attempt.match).toBe(match);
		});

		it('should use current date if timestamp not provided', () => {
			const match = new TypingMatch('hello', 'Hello', true, strategy);
			const before = Date.now();
			const attempt = new TypingAttempt(0, match, 1, 1500);
			const after = Date.now();
			
			expect(attempt.timestamp.getTime()).toBeGreaterThanOrEqual(before);
			expect(attempt.timestamp.getTime()).toBeLessThanOrEqual(after);
		});

		it('should derive properties from match', () => {
			const match = new TypingMatch('hello', 'Hello', true, strategy);
			const attempt = new TypingAttempt(0, match, 1, 1500);
			
			expect(attempt.input).toBe(match.input);
			expect(attempt.target).toBe(match.target);
			expect(attempt.isCorrect).toBe(match.isMatch);
		});
	});

	describe('validation', () => {
		it('should throw error for negative chunk index', () => {
			const match = new TypingMatch('hello', 'Hello', true, strategy);
			
			expect(() => new TypingAttempt(-1, match, 1, 1500)).toThrow('Chunk index must be non-negative');
		});

		it('should allow chunk index of 0', () => {
			const match = new TypingMatch('hello', 'Hello', true, strategy);
			const attempt = new TypingAttempt(0, match, 1, 1500);
			
			expect(attempt.chunkIndex).toBe(0);
		});

		it('should throw error for attempt number < 1', () => {
			const match = new TypingMatch('hello', 'Hello', true, strategy);
			
			expect(() => new TypingAttempt(0, match, 0, 1500)).toThrow('Attempt number must be positive');
		});

		it('should throw error for negative duration', () => {
			const match = new TypingMatch('hello', 'Hello', true, strategy);
			
			expect(() => new TypingAttempt(0, match, 1, -100)).toThrow('Duration must be non-negative');
		});

		it('should allow duration of 0', () => {
			const match = new TypingMatch('hello', 'Hello', true, strategy);
			const attempt = new TypingAttempt(0, match, 1, 0);
			
			expect(attempt.duration).toBe(0);
		});
	});

	describe('successful attempts', () => {
		it('should represent a successful first attempt', () => {
			const match = new TypingMatch('hello', 'Hello', true, strategy);
			const attempt = new TypingAttempt(0, match, 1, 1500);
			
			expect(attempt.isCorrect).toBe(true);
			expect(attempt.attemptNumber).toBe(1);
		});

		it('should track chunk index correctly', () => {
			const match = new TypingMatch('world', 'World', true, strategy);
			const attempt = new TypingAttempt(5, match, 1, 1200);
			
			expect(attempt.chunkIndex).toBe(5);
		});
	});

	describe('unsuccessful attempts', () => {
		it('should represent a failed attempt', () => {
			const match = new TypingMatch('helo', 'Hello', false, strategy);
			const attempt = new TypingAttempt(0, match, 1, 1800);
			
			expect(attempt.isCorrect).toBe(false);
			expect(attempt.input).toBe('helo');
			expect(attempt.target).toBe('Hello');
		});

		it('should track multiple attempts on same chunk', () => {
			const match1 = new TypingMatch('helo', 'Hello', false, strategy);
			const attempt1 = new TypingAttempt(0, match1, 1, 1500);
			
			const match2 = new TypingMatch('hllo', 'Hello', false, strategy);
			const attempt2 = new TypingAttempt(0, match2, 2, 1800);
			
			const match3 = new TypingMatch('hello', 'Hello', true, strategy);
			const attempt3 = new TypingAttempt(0, match3, 3, 1200);
			
			expect(attempt1.attemptNumber).toBe(1);
			expect(attempt2.attemptNumber).toBe(2);
			expect(attempt3.attemptNumber).toBe(3);
			expect(attempt1.chunkIndex).toBe(0);
			expect(attempt2.chunkIndex).toBe(0);
			expect(attempt3.chunkIndex).toBe(0);
		});
	});

	describe('strategyName', () => {
		it('should return strategy name from match', () => {
			const match = new TypingMatch('hello', 'Hello', true, strategy);
			const attempt = new TypingAttempt(0, match, 1, 1500);
			
			expect(attempt.strategyName).toBe('lenient');
		});
	});

	describe('charactersPerMinute', () => {
		it('should calculate CPM for typical input', () => {
			const match = new TypingMatch('hello', 'Hello', true, strategy); // 5 chars
			const attempt = new TypingAttempt(0, match, 1, 1000); // 1 second
			
			// 5 chars in 1 second = 300 chars per minute
			expect(attempt.charactersPerMinute).toBe(300);
		});

		it('should calculate CPM for fast typing', () => {
			const match = new TypingMatch('hello world', 'Hello World', true, strategy); // 11 chars
			const attempt = new TypingAttempt(0, match, 1, 2000); // 2 seconds
			
			// 11 chars in 2 seconds = 330 CPM
			expect(attempt.charactersPerMinute).toBe(330);
		});

		it('should calculate CPM for slow typing', () => {
			const match = new TypingMatch('hi', 'Hi', true, strategy); // 2 chars
			const attempt = new TypingAttempt(0, match, 1, 6000); // 6 seconds
			
			// 2 chars in 6 seconds = 20 CPM
			expect(attempt.charactersPerMinute).toBe(20);
		});

		it('should return 0 for zero duration', () => {
			const match = new TypingMatch('hello', 'Hello', true, strategy);
			const attempt = new TypingAttempt(0, match, 1, 0);
			
			expect(attempt.charactersPerMinute).toBe(0);
		});

		it('should round to nearest integer', () => {
			const match = new TypingMatch('hello', 'Hello', true, strategy); // 5 chars
			const attempt = new TypingAttempt(0, match, 1, 1500); // 1.5 seconds
			
			// 5 chars in 1.5 seconds = 200 CPM (exactly)
			expect(attempt.charactersPerMinute).toBe(200);
		});
	});

	describe('duration tracking', () => {
		it('should track fast completion', () => {
			const match = new TypingMatch('hi', 'Hi', true, strategy);
			const attempt = new TypingAttempt(0, match, 1, 500); // 0.5 seconds
			
			expect(attempt.duration).toBe(500);
		});

		it('should track slow completion', () => {
			const match = new TypingMatch('hello', 'Hello', true, strategy);
			const attempt = new TypingAttempt(0, match, 1, 10000); // 10 seconds
			
			expect(attempt.duration).toBe(10000);
		});

		it('should handle very long duration', () => {
			const match = new TypingMatch('hello', 'Hello', true, strategy);
			const attempt = new TypingAttempt(0, match, 1, 300000); // 5 minutes
			
			expect(attempt.duration).toBe(300000);
		});
	});

	describe('equals', () => {
		it('should return true for identical attempts', () => {
			const match = new TypingMatch('hello', 'Hello', true, strategy, fixedDate);
			const attempt1 = new TypingAttempt(0, match, 1, 1500, fixedDate);
			const attempt2 = new TypingAttempt(0, match, 1, 1500, fixedDate);
			
			expect(attempt1.equals(attempt2)).toBe(true);
		});

		it('should return false for different chunk index', () => {
			const match = new TypingMatch('hello', 'Hello', true, strategy, fixedDate);
			const attempt1 = new TypingAttempt(0, match, 1, 1500, fixedDate);
			const attempt2 = new TypingAttempt(1, match, 1, 1500, fixedDate);
			
			expect(attempt1.equals(attempt2)).toBe(false);
		});

		it('should return false for different attempt number', () => {
			const match = new TypingMatch('hello', 'Hello', true, strategy, fixedDate);
			const attempt1 = new TypingAttempt(0, match, 1, 1500, fixedDate);
			const attempt2 = new TypingAttempt(0, match, 2, 1500, fixedDate);
			
			expect(attempt1.equals(attempt2)).toBe(false);
		});

		it('should return false for different duration', () => {
			const match = new TypingMatch('hello', 'Hello', true, strategy, fixedDate);
			const attempt1 = new TypingAttempt(0, match, 1, 1500, fixedDate);
			const attempt2 = new TypingAttempt(0, match, 1, 1800, fixedDate);
			
			expect(attempt1.equals(attempt2)).toBe(false);
		});

		it('should return false for different input (via match)', () => {
			const match1 = new TypingMatch('hello', 'Hello', true, strategy, fixedDate);
			const match2 = new TypingMatch('world', 'Hello', false, strategy, fixedDate);
			const attempt1 = new TypingAttempt(0, match1, 1, 1500, fixedDate);
			const attempt2 = new TypingAttempt(0, match2, 1, 1500, fixedDate);
			
			expect(attempt1.equals(attempt2)).toBe(false);
		});
	});

	describe('immutability', () => {
		it('properties are readonly (enforced by TypeScript)', () => {
			const match = new TypingMatch('hello', 'Hello', true, strategy);
			const attempt = new TypingAttempt(0, match, 1, 1500);
			
			// TypeScript prevents modification at compile time
			// This test documents the expectation
			expect(attempt.chunkIndex).toBe(0);
			expect(attempt.attemptNumber).toBe(1);
		});
	});

	describe('edge cases', () => {
		it('should handle empty input', () => {
			const match = new TypingMatch('', '', true, strategy);
			const attempt = new TypingAttempt(0, match, 1, 100);
			
			expect(attempt.input).toBe('');
			expect(attempt.target).toBe('');
			expect(attempt.charactersPerMinute).toBe(0); // 0 chars
		});

		it('should handle very long strings', () => {
			const longString = 'a'.repeat(100);
			const match = new TypingMatch(longString, longString, true, strategy);
			const attempt = new TypingAttempt(0, match, 1, 10000); // 10 seconds
			
			// 100 chars in 10 seconds = 600 CPM
			expect(attempt.charactersPerMinute).toBe(600);
		});

		it('should handle high chunk indices', () => {
			const match = new TypingMatch('hello', 'Hello', true, strategy);
			const attempt = new TypingAttempt(999, match, 1, 1500);
			
			expect(attempt.chunkIndex).toBe(999);
		});

		it('should handle many attempts on same chunk', () => {
			const match = new TypingMatch('hello', 'Hello', true, strategy);
			const attempt = new TypingAttempt(0, match, 50, 1500);
			
			expect(attempt.attemptNumber).toBe(50);
		});
	});
});

