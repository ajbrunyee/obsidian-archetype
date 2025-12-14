import { describe, it, expect } from 'vitest';
import { StrictMatchStrategy } from './StrictMatchStrategy';

describe('StrictMatchStrategy', () => {
	const strategy = new StrictMatchStrategy();

	describe('name', () => {
		it('should have correct name', () => {
			expect(strategy.name).toBe('strict');
		});
	});

	describe('exact matches', () => {
		it('should match identical strings', () => {
			expect(strategy.matches('Hello', 'Hello')).toBe(true);
		});

		it('should match empty strings', () => {
			expect(strategy.matches('', '')).toBe(true);
		});

		it('should match with spaces', () => {
			expect(strategy.matches('Hello World', 'Hello World')).toBe(true);
		});

		it('should match with punctuation', () => {
			expect(strategy.matches('Hello!', 'Hello!')).toBe(true);
		});

		it('should match with numbers', () => {
			expect(strategy.matches('Hello123', 'Hello123')).toBe(true);
		});

		it('should match with symbols', () => {
			expect(strategy.matches('Hello@World', 'Hello@World')).toBe(true);
		});
	});

	describe('case sensitivity', () => {
		it('should NOT match different case', () => {
			expect(strategy.matches('Hello', 'hello')).toBe(false);
			expect(strategy.matches('hello', 'HELLO')).toBe(false);
		});

		it('should NOT match mixed case', () => {
			expect(strategy.matches('HeLLo', 'hEllO')).toBe(false);
		});

		it('should NOT match uppercase to lowercase', () => {
			expect(strategy.matches('HELLO WORLD', 'hello world')).toBe(false);
		});

		it('should match when case is identical', () => {
			expect(strategy.matches('HELLO', 'HELLO')).toBe(true);
			expect(strategy.matches('hello', 'hello')).toBe(true);
		});
	});

	describe('whitespace sensitivity', () => {
		it('should NOT match with leading whitespace', () => {
			expect(strategy.matches(' Hello', 'Hello')).toBe(false);
			expect(strategy.matches('Hello', ' Hello')).toBe(false);
		});

		it('should NOT match with trailing whitespace', () => {
			expect(strategy.matches('Hello ', 'Hello')).toBe(false);
			expect(strategy.matches('Hello', 'Hello ')).toBe(false);
		});

		it('should NOT match with different internal whitespace', () => {
			expect(strategy.matches('Hello  World', 'Hello World')).toBe(false);
		});

		it('should NOT match whitespace-only to empty', () => {
			expect(strategy.matches(' ', '')).toBe(false);
			expect(strategy.matches('  ', ' ')).toBe(false);
		});

		it('should match identical whitespace', () => {
			expect(strategy.matches('  ', '  ')).toBe(true);
			expect(strategy.matches('Hello  World', 'Hello  World')).toBe(true);
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

		it('should NOT match when punctuation differs', () => {
			expect(strategy.matches('Hello!', 'Hello')).toBe(false);
			expect(strategy.matches('Hello', 'Hello!')).toBe(false);
		});
	});

	describe('special characters', () => {
		it('should match with tabs', () => {
			expect(strategy.matches('Hello\tWorld', 'Hello\tWorld')).toBe(true);
		});

		it('should match with newlines', () => {
			expect(strategy.matches('Hello\nWorld', 'Hello\nWorld')).toBe(true);
		});

		it('should NOT match tab vs space', () => {
			expect(strategy.matches('Hello\tWorld', 'Hello World')).toBe(false);
		});

		it('should NOT match newline vs space', () => {
			expect(strategy.matches('Hello\nWorld', 'Hello World')).toBe(false);
		});
	});

	describe('edge cases', () => {
		it('should match single character', () => {
			expect(strategy.matches('a', 'a')).toBe(true);
		});

		it('should NOT match single character different case', () => {
			expect(strategy.matches('a', 'A')).toBe(false);
		});

		it('should NOT match empty to non-empty', () => {
			expect(strategy.matches('', 'Hello')).toBe(false);
			expect(strategy.matches('Hello', '')).toBe(false);
		});

		it('should handle very long strings', () => {
			const longString = 'a'.repeat(1000);
			expect(strategy.matches(longString, longString)).toBe(true);
			expect(strategy.matches(longString, longString.toUpperCase())).toBe(false);
		});

		it('should match unicode characters', () => {
			expect(strategy.matches('Hello 世界', 'Hello 世界')).toBe(true);
		});

		it('should NOT match different unicode characters', () => {
			expect(strategy.matches('Hello 世界', 'Hello 世')).toBe(false);
		});
	});

	describe('comparison with lenient strategy', () => {
		it('strict is more demanding than lenient', () => {
			// Cases where lenient would pass but strict fails
			expect(strategy.matches('Hello', 'hello')).toBe(false); // case
			expect(strategy.matches(' Hello', 'Hello')).toBe(false); // whitespace
			expect(strategy.matches('Hello ', 'Hello')).toBe(false); // whitespace
		});
	});
});

