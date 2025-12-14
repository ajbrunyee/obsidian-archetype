import { describe, it, expect } from 'vitest';
import { TypingAttempt } from './TypingAttempt';
import { TypingMatch } from './TypingMatch';
import { LenientMatchStrategy } from './LenientMatchStrategy';

describe('TypingAttempt', () => {
	const strategy = new LenientMatchStrategy();
	const fixedTimestamp = Date.parse('2025-12-13T10:00:00Z');

	describe('constructor', () => {
		it('should create an attempt with all properties', () => {
			const match = new TypingMatch('hello', 'Hello', true, strategy);
			const attempt = new TypingAttempt(match, fixedTimestamp, 1500);
			
			expect(attempt.input).toBe('hello');
			expect(attempt.target).toBe('Hello');
			expect(attempt.isCorrect).toBe(true);
			expect(attempt.duration).toBe(1500);
			expect(attempt.timestamp).toBe(fixedTimestamp);
			expect(attempt.match).toBe(match);
		});

		it('should derive properties from match', () => {
			const match = new TypingMatch('hello', 'Hello', true, strategy);
			const attempt = new TypingAttempt(match, fixedTimestamp, 1500);
			
			expect(attempt.input).toBe(match.input);
			expect(attempt.target).toBe(match.target);
			expect(attempt.isCorrect).toBe(match.isMatch);
		});
	});

	describe('validation', () => {
		it('should throw error for negative duration', () => {
			const match = new TypingMatch('hello', 'Hello', true, strategy);
			
			expect(() => new TypingAttempt(match, fixedTimestamp, -1)).toThrow('Duration cannot be negative');
		});

		it('should allow zero duration', () => {
			const match = new TypingMatch('hello', 'Hello', true, strategy);
			const attempt = new TypingAttempt(match, fixedTimestamp, 0);
			
			expect(attempt.duration).toBe(0);
		});
	});

	describe('strategyName getter', () => {
		it('should return strategy name from match', () => {
			const match = new TypingMatch('hello', 'Hello', true, strategy);
			const attempt = new TypingAttempt(match, fixedTimestamp, 1500);
			
			expect(attempt.strategyName).toBe('lenient');
			expect(attempt.strategyName).toBe(match.strategyName);
		});
	});

	describe('charactersPerMinute getter', () => {
		it('should calculate CPM correctly for normal attempt', () => {
			const match = new TypingMatch('hello', 'hello', true, strategy); // 5 characters
			const attempt = new TypingAttempt(match, fixedTimestamp, 10000); // 10 seconds
			
			// 5 characters in 10000ms = 30 CPM
			expect(attempt.charactersPerMinute).toBe(30);
		});

		it('should handle zero duration', () => {
			const match = new TypingMatch('hello', 'hello', true, strategy);
			const attempt = new TypingAttempt(match, fixedTimestamp, 0);
			
			expect(attempt.charactersPerMinute).toBe(0);
		});

		it('should calculate CPM for fast typing', () => {
			const match = new TypingMatch('hello', 'hello', true, strategy); // 5 characters
			const attempt = new TypingAttempt(match, fixedTimestamp, 1000); // 1 second
			
			// 5 characters in 1000ms = 300 CPM
			expect(attempt.charactersPerMinute).toBe(300);
		});

		it('should round CPM to nearest integer', () => {
			const match = new TypingMatch('hello', 'hello', true, strategy); // 5 characters
			const attempt = new TypingAttempt(match, fixedTimestamp, 9999); // ~10 seconds
			
			// Should be rounded
			expect(Number.isInteger(attempt.charactersPerMinute)).toBe(true);
		});
	});

	describe('equals', () => {
		it('should return true for identical attempts', () => {
			const match = new TypingMatch('hello', 'Hello', true, strategy);
			const attempt1 = new TypingAttempt(match, fixedTimestamp, 1500);
			const attempt2 = new TypingAttempt(match, fixedTimestamp, 1500);
			
			expect(attempt1.equals(attempt2)).toBe(true);
		});

		it('should return false for different input', () => {
			const match1 = new TypingMatch('hello', 'Hello', true, strategy);
			const match2 = new TypingMatch('world', 'Hello', false, strategy);
			const attempt1 = new TypingAttempt(match1, fixedTimestamp, 1500);
			const attempt2 = new TypingAttempt(match2, fixedTimestamp, 1500);
			
			expect(attempt1.equals(attempt2)).toBe(false);
		});

		it('should return false for different duration', () => {
			const match = new TypingMatch('hello', 'Hello', true, strategy);
			const attempt1 = new TypingAttempt(match, fixedTimestamp, 1500);
			const attempt2 = new TypingAttempt(match, fixedTimestamp, 2000);
			
			expect(attempt1.equals(attempt2)).toBe(false);
		});

		it('should return false for different timestamp', () => {
			const match = new TypingMatch('hello', 'Hello', true, strategy);
			const attempt1 = new TypingAttempt(match, fixedTimestamp, 1500);
			const attempt2 = new TypingAttempt(match, fixedTimestamp + 1000, 1500);
			
			expect(attempt1.equals(attempt2)).toBe(false);
		});
	});

	describe('edge cases', () => {
		it('should handle empty string input', () => {
			const match = new TypingMatch('', 'hello', false, strategy);
			const attempt = new TypingAttempt(match, fixedTimestamp, 1000);
			
			expect(attempt.input).toBe('');
			expect(attempt.charactersPerMinute).toBe(0);
		});

		it('should handle very long input', () => {
			const longText = 'a'.repeat(10000);
			const match = new TypingMatch(longText, longText, true, strategy);
			const attempt = new TypingAttempt(match, fixedTimestamp, 60000); // 1 minute
			
			expect(attempt.input).toBe(longText);
			expect(attempt.charactersPerMinute).toBe(10000);
		});

		it('should handle very short duration', () => {
			const match = new TypingMatch('hello', 'hello', true, strategy);
			const attempt = new TypingAttempt(match, fixedTimestamp, 1); // 1ms
			
			// 5 characters in 1ms = very high CPM
			expect(attempt.charactersPerMinute).toBeGreaterThan(100000);
		});
	});
});

