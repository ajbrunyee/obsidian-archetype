import { describe, it, expect } from 'vitest';
import { LenientMatchStrategy } from './LenientMatchStrategy';

describe('LenientMatchStrategy', () => {
	const strategy = new LenientMatchStrategy();

	describe('name', () => {
		it('should have correct name', () => {
			expect(strategy.name).toBe('lenient');
		});
	});

	describe('case sensitivity', () => {
		it('should match regardless of case', () => {
			expect(strategy.matches('Hello', 'hello')).toBe(true);
			expect(strategy.matches('hello', 'HELLO')).toBe(true);
			expect(strategy.matches('HeLLo', 'hEllO')).toBe(true);
		});

		it('should match all uppercase', () => {
			expect(strategy.matches('HELLO WORLD', 'hello world')).toBe(true);
		});

		it('should match all lowercase', () => {
			expect(strategy.matches('hello world', 'HELLO WORLD')).toBe(true);
		});

		it('should match mixed case', () => {
			expect(strategy.matches('HeLLo WoRLd', 'hello world')).toBe(true);
		});
	});

	describe('whitespace handling', () => {
		it('should trim leading whitespace from input', () => {
			expect(strategy.matches('  Hello', 'Hello')).toBe(true);
		});

		it('should trim trailing whitespace from input', () => {
			expect(strategy.matches('Hello  ', 'Hello')).toBe(true);
		});

		it('should trim leading whitespace from target', () => {
			expect(strategy.matches('Hello', '  Hello')).toBe(true);
		});

		it('should trim trailing whitespace from target', () => {
			expect(strategy.matches('Hello', 'Hello  ')).toBe(true);
		});

		it('should trim both leading and trailing whitespace', () => {
			expect(strategy.matches('  Hello  ', '  Hello  ')).toBe(true);
		});

		it('should preserve internal whitespace', () => {
			expect(strategy.matches('Hello World', 'Hello World')).toBe(true);
		});

		it('should NOT match when internal whitespace differs', () => {
			expect(strategy.matches('Hello  World', 'Hello World')).toBe(false);
			expect(strategy.matches('HelloWorld', 'Hello World')).toBe(false);
		});
	});

	describe('exact matches', () => {
		it('should match identical strings', () => {
			expect(strategy.matches('Hello', 'Hello')).toBe(true);
		});

		it('should match empty strings', () => {
			expect(strategy.matches('', '')).toBe(true);
		});

		it('should match whitespace-only strings (after trim)', () => {
			expect(strategy.matches('   ', '  ')).toBe(true);
		});
	});

	describe('mismatches', () => {
		it('should NOT match different text', () => {
			expect(strategy.matches('Hello', 'World')).toBe(false);
		});

		it('should NOT match with typos', () => {
			expect(strategy.matches('Helo', 'Hello')).toBe(false);
			expect(strategy.matches('Helloo', 'Hello')).toBe(false);
		});

		it('should NOT match substring', () => {
			expect(strategy.matches('Hello', 'Hello World')).toBe(false);
			expect(strategy.matches('Hello World', 'Hello')).toBe(false);
		});

		it('should NOT match with missing characters', () => {
			expect(strategy.matches('Hllo', 'Hello')).toBe(false);
		});

		it('should NOT match with extra characters', () => {
			expect(strategy.matches('Heello', 'Hello')).toBe(false);
		});

		it('should NOT match with transposed characters', () => {
			expect(strategy.matches('Helol', 'Hello')).toBe(false);
		});
	});

	describe('special characters', () => {
		it('should match with punctuation', () => {
			expect(strategy.matches('Hello!', 'hello!')).toBe(true);
		});

		it('should match with numbers', () => {
			expect(strategy.matches('Hello123', 'hello123')).toBe(true);
		});

		it('should match with symbols', () => {
			expect(strategy.matches('Hello@World', 'hello@world')).toBe(true);
		});

		it('should NOT match when punctuation differs', () => {
			expect(strategy.matches('Hello!', 'Hello')).toBe(false);
			expect(strategy.matches('Hello', 'Hello!')).toBe(false);
		});
	});

	describe('multi-word strings', () => {
		it('should match sentences', () => {
			expect(strategy.matches('The quick brown fox', 'the quick brown fox')).toBe(true);
		});

		it('should match with mixed case in sentences', () => {
			expect(strategy.matches('The Quick Brown Fox', 'the quick brown fox')).toBe(true);
		});

		it('should NOT match with word differences', () => {
			expect(strategy.matches('The quick brown fox', 'The quick brown dog')).toBe(false);
		});
	});

	describe('edge cases', () => {
		it('should match single character', () => {
			expect(strategy.matches('a', 'A')).toBe(true);
		});

		it('should NOT match empty to non-empty', () => {
			expect(strategy.matches('', 'Hello')).toBe(false);
			expect(strategy.matches('Hello', '')).toBe(false);
		});

		it('should match with tabs and newlines (after trim)', () => {
			expect(strategy.matches('\tHello\n', 'Hello')).toBe(true);
		});

		it('should handle very long strings', () => {
			const longString = 'a'.repeat(1000);
			expect(strategy.matches(longString, longString.toUpperCase())).toBe(true);
		});
	});
});

