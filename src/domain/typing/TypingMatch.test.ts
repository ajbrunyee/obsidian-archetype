import { describe, it, expect } from 'vitest';
import { TypingMatch } from './TypingMatch';
import { LenientMatchStrategy } from './LenientMatchStrategy';
import { StrictMatchStrategy } from './StrictMatchStrategy';

describe('TypingMatch', () => {
	const lenientStrategy = new LenientMatchStrategy();
	const strictStrategy = new StrictMatchStrategy();
	const fixedDate = new Date('2025-12-13T10:00:00Z');

	describe('constructor', () => {
		it('should create a match with all properties', () => {
			const match = new TypingMatch('hello', 'Hello', true, lenientStrategy, fixedDate);
			
			expect(match.input).toBe('hello');
			expect(match.target).toBe('Hello');
			expect(match.isMatch).toBe(true);
			expect(match.strategy).toBe(lenientStrategy);
			expect(match.timestamp).toBe(fixedDate);
		});

		it('should use current date if timestamp not provided', () => {
			const before = Date.now();
			const match = new TypingMatch('hello', 'Hello', true, lenientStrategy);
			const after = Date.now();
			
			expect(match.timestamp.getTime()).toBeGreaterThanOrEqual(before);
			expect(match.timestamp.getTime()).toBeLessThanOrEqual(after);
		});
	});

	describe('immutability', () => {
		it('properties are readonly (enforced by TypeScript)', () => {
			const match = new TypingMatch('hello', 'Hello', true, lenientStrategy);
			
			// TypeScript prevents modification at compile time
			// This test documents the expectation
			expect(match.input).toBe('hello');
			expect(match.target).toBe('Hello');
		});
	});

	describe('strategyName', () => {
		it('should return strategy name', () => {
			const match = new TypingMatch('hello', 'Hello', true, lenientStrategy);
			expect(match.strategyName).toBe('lenient');
		});

		it('should return correct name for different strategies', () => {
			const strictMatch = new TypingMatch('hello', 'hello', true, strictStrategy);
			expect(strictMatch.strategyName).toBe('strict');
		});
	});

	describe('successful matches', () => {
		it('should represent a successful lenient match', () => {
			const match = new TypingMatch('hello', 'Hello', true, lenientStrategy);
			
			expect(match.isMatch).toBe(true);
			expect(match.input).toBe('hello');
			expect(match.target).toBe('Hello');
		});

		it('should represent a successful strict match', () => {
			const match = new TypingMatch('Hello', 'Hello', true, strictStrategy);
			
			expect(match.isMatch).toBe(true);
		});
	});

	describe('unsuccessful matches', () => {
		it('should represent a failed match', () => {
			const match = new TypingMatch('helo', 'Hello', false, lenientStrategy);
			
			expect(match.isMatch).toBe(false);
			expect(match.input).toBe('helo');
			expect(match.target).toBe('Hello');
		});

		it('should represent a failed strict match (case difference)', () => {
			const match = new TypingMatch('hello', 'Hello', false, strictStrategy);
			
			expect(match.isMatch).toBe(false);
		});
	});

	describe('equals', () => {
		it('should return true for identical matches', () => {
			const match1 = new TypingMatch('hello', 'Hello', true, lenientStrategy, fixedDate);
			const match2 = new TypingMatch('hello', 'Hello', true, lenientStrategy, fixedDate);
			
			expect(match1.equals(match2)).toBe(true);
		});

		it('should return false for different input', () => {
			const match1 = new TypingMatch('hello', 'Hello', true, lenientStrategy, fixedDate);
			const match2 = new TypingMatch('world', 'Hello', true, lenientStrategy, fixedDate);
			
			expect(match1.equals(match2)).toBe(false);
		});

		it('should return false for different target', () => {
			const match1 = new TypingMatch('hello', 'Hello', true, lenientStrategy, fixedDate);
			const match2 = new TypingMatch('hello', 'World', true, lenientStrategy, fixedDate);
			
			expect(match1.equals(match2)).toBe(false);
		});

		it('should return false for different isMatch', () => {
			const match1 = new TypingMatch('hello', 'Hello', true, lenientStrategy, fixedDate);
			const match2 = new TypingMatch('hello', 'Hello', false, lenientStrategy, fixedDate);
			
			expect(match1.equals(match2)).toBe(false);
		});

		it('should return false for different strategy', () => {
			const match1 = new TypingMatch('hello', 'Hello', true, lenientStrategy, fixedDate);
			const match2 = new TypingMatch('hello', 'Hello', true, strictStrategy, fixedDate);
			
			expect(match1.equals(match2)).toBe(false);
		});

		it('should return false for different timestamp', () => {
			const date1 = new Date('2025-12-13T10:00:00Z');
			const date2 = new Date('2025-12-13T10:00:01Z');
			
			const match1 = new TypingMatch('hello', 'Hello', true, lenientStrategy, date1);
			const match2 = new TypingMatch('hello', 'Hello', true, lenientStrategy, date2);
			
			expect(match1.equals(match2)).toBe(false);
		});
	});

	describe('edge cases', () => {
		it('should handle empty strings', () => {
			const match = new TypingMatch('', '', true, lenientStrategy);
			
			expect(match.input).toBe('');
			expect(match.target).toBe('');
			expect(match.isMatch).toBe(true);
		});

		it('should handle very long strings', () => {
			const longString = 'a'.repeat(1000);
			const match = new TypingMatch(longString, longString, true, lenientStrategy);
			
			expect(match.input).toBe(longString);
			expect(match.target).toBe(longString);
		});

		it('should handle special characters', () => {
			const match = new TypingMatch('Hello@World!', 'Hello@World!', true, lenientStrategy);
			
			expect(match.input).toBe('Hello@World!');
			expect(match.target).toBe('Hello@World!');
		});

		it('should handle unicode characters', () => {
			const match = new TypingMatch('Hello 世界', 'Hello 世界', true, lenientStrategy);
			
			expect(match.input).toBe('Hello 世界');
			expect(match.target).toBe('Hello 世界');
		});
	});

	describe('timestamp behavior', () => {
		it('should preserve exact timestamp when provided', () => {
			const specificTime = new Date('2025-12-13T15:30:45.123Z');
			const match = new TypingMatch('hello', 'Hello', true, lenientStrategy, specificTime);
			
			expect(match.timestamp.getTime()).toBe(specificTime.getTime());
		});

		it('should create different timestamps for matches created at different times', () => {
			const match1 = new TypingMatch('hello', 'Hello', true, lenientStrategy);
			
			// Wait a bit
			const delayPromise = new Promise(resolve => setTimeout(resolve, 10));
			
			return delayPromise.then(() => {
				const match2 = new TypingMatch('hello', 'Hello', true, lenientStrategy);
				expect(match2.timestamp.getTime()).toBeGreaterThan(match1.timestamp.getTime());
			});
		});
	});
});

