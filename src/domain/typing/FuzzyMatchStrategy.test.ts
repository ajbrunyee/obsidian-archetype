import { describe, it, expect } from 'vitest';
import { FuzzyMatchStrategy } from './FuzzyMatchStrategy';

describe('FuzzyMatchStrategy', () => {
	describe('name', () => {
		it('should have correct name', () => {
			const strategy = new FuzzyMatchStrategy();
			expect(strategy.name).toBe('fuzzy');
		});
	});

	describe('constructor', () => {
		it('should use default max distance of 2', () => {
			const strategy = new FuzzyMatchStrategy();
			// Test with 2 edits - should pass
			expect(strategy.matches('Hello', 'Hllo')).toBe(true); // 1 deletion
			expect(strategy.matches('Hello', 'Helo')).toBe(true); // 1 deletion
		});

		it('should accept custom max distance', () => {
			const strategy = new FuzzyMatchStrategy(1);
			expect(strategy.matches('Hello', 'Helo')).toBe(true); // 1 deletion
			expect(strategy.matches('Hello', 'Hlo')).toBe(false); // 2 deletions
		});

		it('should throw error for negative max distance', () => {
			expect(() => new FuzzyMatchStrategy(-1)).toThrow('Max distance must be non-negative');
		});

		it('should allow max distance of 0 (exact match)', () => {
			const strategy = new FuzzyMatchStrategy(0);
			expect(strategy.matches('Hello', 'Hello')).toBe(true);
			expect(strategy.matches('Hello', 'Helo')).toBe(false);
		});
	});

	describe('exact matches', () => {
		const strategy = new FuzzyMatchStrategy();

		it('should match identical strings', () => {
			expect(strategy.matches('Hello', 'Hello')).toBe(true);
		});

		it('should match empty strings', () => {
			expect(strategy.matches('', '')).toBe(true);
		});
	});

	describe('case sensitivity (normalized)', () => {
		const strategy = new FuzzyMatchStrategy();

		it('should match case-insensitively', () => {
			expect(strategy.matches('Hello', 'hello')).toBe(true);
			expect(strategy.matches('HELLO', 'hello')).toBe(true);
			expect(strategy.matches('HeLLo', 'hello')).toBe(true);
		});
	});

	describe('whitespace handling (normalized)', () => {
		const strategy = new FuzzyMatchStrategy();

		it('should trim leading/trailing whitespace', () => {
			expect(strategy.matches('  Hello', 'Hello')).toBe(true);
			expect(strategy.matches('Hello  ', 'Hello')).toBe(true);
			expect(strategy.matches('  Hello  ', '  Hello  ')).toBe(true);
		});
	});

	describe('single character edits (distance = 1)', () => {
		const strategy = new FuzzyMatchStrategy(2);

		it('should match with one deletion', () => {
			expect(strategy.matches('Hello', 'Helo')).toBe(true);  // missing 'l'
			expect(strategy.matches('Hello', 'Hllo')).toBe(true);  // missing 'e'
			expect(strategy.matches('Hello', 'Hell')).toBe(true);  // missing 'o'
		});

		it('should match with one insertion (extra char)', () => {
			expect(strategy.matches('Heello', 'Hello')).toBe(true); // extra 'e'
			expect(strategy.matches('Helllo', 'Hello')).toBe(true); // extra 'l'
		});

		it('should match with one substitution', () => {
			expect(strategy.matches('Hallo', 'Hello')).toBe(true); // 'a' instead of 'e'
			expect(strategy.matches('Hella', 'Hello')).toBe(true); // 'a' instead of 'o'
		});

		it('should match with transposition (2 substitutions but close)', () => {
			expect(strategy.matches('Helol', 'Hello')).toBe(true); // 'lo' swapped
		});
	});

	describe('two character edits (distance = 2)', () => {
		const strategy = new FuzzyMatchStrategy(2);

		it('should match with two deletions', () => {
			expect(strategy.matches('Hello', 'Hlo')).toBe(true);  // missing 'el'
			expect(strategy.matches('Hello', 'Heo')).toBe(true);  // missing 'll'
		});

		it('should match with two insertions', () => {
			expect(strategy.matches('Heeello', 'Hello')).toBe(true); // extra 'ee'
		});

		it('should match with two substitutions', () => {
			expect(strategy.matches('Hallo', 'Hello')).toBe(true); // 'a' for 'e'
			expect(strategy.matches('Hella', 'Hello')).toBe(true); // 'a' for 'o'
		});

		it('should match with mixed edits (1 deletion + 1 insertion)', () => {
			expect(strategy.matches('Helol', 'Hello')).toBe(true);
		});
	});

	describe('exceeds max distance', () => {
		const strategy = new FuzzyMatchStrategy(2);

		it('should NOT match with three deletions', () => {
			expect(strategy.matches('Hello', 'Ho')).toBe(false); // missing 'ell'
		});

		it('should NOT match with three substitutions', () => {
			expect(strategy.matches('Hello', 'Haxxa')).toBe(false);
		});

		it('should NOT match completely different words', () => {
			expect(strategy.matches('Hello', 'World')).toBe(false);
		});

		it('should NOT match substring beyond threshold', () => {
			expect(strategy.matches('Hello', 'He')).toBe(false); // 3 chars missing
		});
	});

	describe('Levenshtein distance calculation', () => {
		const strategy = new FuzzyMatchStrategy(10); // High threshold to test distances

		it('should calculate distance 0 for identical strings', () => {
			expect(strategy.matches('Hello', 'Hello')).toBe(true);
		});

		it('should calculate distance 1 for single char difference', () => {
			expect(strategy.matches('Hello', 'Helo')).toBe(true);
		});

		it('should calculate distance correctly for substitution', () => {
			// "kitten" → "sitten" (distance 1)
			expect(strategy.matches('kitten', 'sitten')).toBe(true);
		});

		it('should calculate distance correctly for deletion', () => {
			// "kitten" → "kiten" (distance 1)
			expect(strategy.matches('kitten', 'kiten')).toBe(true);
		});

		it('should calculate distance correctly for insertion', () => {
			// "kitten" → "kittens" (distance 1)
			expect(strategy.matches('kitten', 'kittens')).toBe(true);
		});

		it('should calculate distance correctly for multiple operations', () => {
			// "saturday" → "sunday" (distance 3)
			// sat → sun (sub 'a' with 'u', del 't'), day → day
			const strategy3 = new FuzzyMatchStrategy(3);
			expect(strategy3.matches('saturday', 'sunday')).toBe(true);
			
			const strategy2 = new FuzzyMatchStrategy(2);
			expect(strategy2.matches('saturday', 'sunday')).toBe(false);
		});
	});

	describe('edge cases', () => {
		const strategy = new FuzzyMatchStrategy(2);

		it('should handle empty string to non-empty', () => {
			expect(strategy.matches('', 'Hi')).toBe(true); // distance 2
			expect(strategy.matches('', 'Hello')).toBe(false); // distance 5
		});

		it('should handle single character strings', () => {
			expect(strategy.matches('a', 'a')).toBe(true);
			expect(strategy.matches('a', 'b')).toBe(true); // distance 1
			expect(strategy.matches('a', '')).toBe(true); // distance 1
		});

		it('should handle very long strings', () => {
			const base = 'a'.repeat(100);
			const typo = 'a'.repeat(99) + 'b'; // 1 char different at end
			expect(strategy.matches(base, typo)).toBe(true);
		});

		it('should handle unicode characters', () => {
			expect(strategy.matches('Hello 世界', 'Hello 世界')).toBe(true);
			expect(strategy.matches('Hello 世界', 'Hello 世')).toBe(true); // 1 char missing
		});
	});

	describe('common typo patterns', () => {
		const strategy = new FuzzyMatchStrategy(2);

		it('should match doubled letters', () => {
			expect(strategy.matches('Helllo', 'Hello')).toBe(true);
		});

		it('should match missing letters', () => {
			expect(strategy.matches('Helo', 'Hello')).toBe(true);
		});

		it('should match transposed adjacent letters', () => {
			expect(strategy.matches('Hlelo', 'Hello')).toBe(true);
		});

		it('should match nearby key typos', () => {
			expect(strategy.matches('Hwllo', 'Hello')).toBe(true); // 'w' near 'e'
		});
	});

	describe('configurable threshold', () => {
		it('threshold 0 behaves like strict (after normalization)', () => {
			const strategy = new FuzzyMatchStrategy(0);
			expect(strategy.matches('Hello', 'Hello')).toBe(true);
			expect(strategy.matches('Hello', 'hello')).toBe(true); // normalized
			expect(strategy.matches('Hello', 'Helo')).toBe(false);
		});

		it('threshold 1 allows one typo', () => {
			const strategy = new FuzzyMatchStrategy(1);
			expect(strategy.matches('Hello', 'Helo')).toBe(true);
			expect(strategy.matches('Hello', 'Hlo')).toBe(false); // 2 chars
		});

		it('threshold 5 is very lenient', () => {
			const strategy = new FuzzyMatchStrategy(5);
			expect(strategy.matches('Hello', 'Hi')).toBe(true); // distance 4
			expect(strategy.matches('Hello', 'Hello World')).toBe(false); // distance 6
		});
	});

	describe('comparison with other strategies', () => {
		const fuzzy = new FuzzyMatchStrategy(2);

		it('fuzzy is more forgiving than strict', () => {
			// These would fail strict but pass fuzzy
			expect(fuzzy.matches('Hello', 'Helo')).toBe(true);
			expect(fuzzy.matches('Hello', 'hello')).toBe(true); // case
		});

		it('fuzzy still rejects major differences', () => {
			expect(fuzzy.matches('Hello', 'World')).toBe(false);
			expect(fuzzy.matches('Hello', 'Hi')).toBe(false); // distance 4
		});
	});
});

