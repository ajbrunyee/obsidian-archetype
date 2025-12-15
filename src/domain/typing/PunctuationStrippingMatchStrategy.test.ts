import { describe, it, expect } from 'vitest';
import { PunctuationStrippingMatchStrategy } from './PunctuationStrippingMatchStrategy';
import { LenientMatchStrategy } from './LenientMatchStrategy';
import { StrictMatchStrategy } from './StrictMatchStrategy';

describe('PunctuationStrippingMatchStrategy', () => {
	describe('with LenientMatchStrategy', () => {
		const baseStrategy = new LenientMatchStrategy();
		const strategy = new PunctuationStrippingMatchStrategy(baseStrategy);

		it('should have composite name', () => {
			expect(strategy.name).toBe('lenient-no-punctuation');
		});

		it('should match text with quotes', () => {
			expect(strategy.matches('domain', '"domain"')).toBe(true);
			expect(strategy.matches('domain', "'domain'")).toBe(true);
			// Use Unicode escape sequences for curly quotes (U+201C and U+201D)
			expect(strategy.matches('domain', '\u201Cdomain\u201D')).toBe(true); // Curly quotes
		});

		it('should match text with periods', () => {
			expect(strategy.matches('domain', 'domain.')).toBe(true);
			expect(strategy.matches('domain', 'domain')).toBe(true);
		});

		it('should match text with commas', () => {
			expect(strategy.matches('hello', 'hello,')).toBe(true);
			expect(strategy.matches('world', 'world,')).toBe(true);
		});

		it('should match text with multiple punctuation', () => {
			expect(strategy.matches('Hello world', '"Hello world."')).toBe(true);
			expect(strategy.matches('test', '(test)')).toBe(true);
			expect(strategy.matches('code', '[code]')).toBe(true);
			expect(strategy.matches('value', '{value}')).toBe(true);
		});

		it('should match text with hyphens replaced by spaces', () => {
			// Hyphens are replaced with spaces to preserve word boundaries
			expect(strategy.matches('hello world', 'hello-world')).toBe(true);
			expect(strategy.matches('self aware', 'self-aware')).toBe(true);
		});

		it('should match text with em dash and en dash', () => {
			// Em dash (U+2014) and en dash (U+2013) are replaced with spaces
			expect(strategy.matches('models where', 'models\u2014where')).toBe(true); // em dash
			expect(strategy.matches('models where', 'models\u2013where')).toBe(true); // en dash
			expect(strategy.matches('hello world test', 'hello\u2014world\u2014test')).toBe(true);
		});

		it('should match text with apostrophes', () => {
			expect(strategy.matches('dont', "don't")).toBe(true);
			expect(strategy.matches('its', "it's")).toBe(true);
		});

		it('should match text with exclamation and question marks', () => {
			expect(strategy.matches('Hello', 'Hello!')).toBe(true);
			expect(strategy.matches('Why', 'Why?')).toBe(true);
		});

		it('should match text with semicolons and colons', () => {
			expect(strategy.matches('note', 'note:')).toBe(true);
			expect(strategy.matches('statement', 'statement;')).toBe(true);
		});

		it('should match text with slashes replaced by spaces', () => {
			// Slashes are replaced with spaces to preserve word boundaries
			expect(strategy.matches('and or', 'and/or')).toBe(true);
			expect(strategy.matches('path file', 'path\\file')).toBe(true);
		});

		it('should match text with special characters', () => {
			// Special characters are stripped, numbers remain
			expect(strategy.matches('emaildomain', 'email@domain')).toBe(true);
			expect(strategy.matches('money', '$money')).toBe(true);
			expect(strategy.matches('50percent', '50%percent')).toBe(true);
		});

		it('should preserve case-insensitivity from wrapped strategy', () => {
			expect(strategy.matches('DOMAIN', '"domain"')).toBe(true);
			expect(strategy.matches('domain', '"DOMAIN"')).toBe(true);
		});

		it('should preserve whitespace handling from wrapped strategy', () => {
			expect(strategy.matches('  hello  ', '"hello"')).toBe(true);
			expect(strategy.matches('hello', '  "hello"  ')).toBe(true);
		});

		it('should not match different words even without punctuation', () => {
			expect(strategy.matches('hello', '"world"')).toBe(false);
			expect(strategy.matches('test', 'test2')).toBe(false);
		});

		it('should handle empty strings', () => {
			expect(strategy.matches('', '')).toBe(true);
			expect(strategy.matches('', '""')).toBe(true);
			expect(strategy.matches('', "''")).toBe(true);
		});

		it('should handle strings with only punctuation', () => {
			expect(strategy.matches('', '...')).toBe(true);
			expect(strategy.matches('', '!!!')).toBe(true);
			expect(strategy.matches('', '"""')).toBe(true);
		});
	});

	describe('with StrictMatchStrategy', () => {
		const baseStrategy = new StrictMatchStrategy();
		const strategy = new PunctuationStrippingMatchStrategy(baseStrategy);

		it('should have composite name', () => {
			expect(strategy.name).toBe('strict-no-punctuation');
		});

		it('should require exact match after stripping punctuation', () => {
			expect(strategy.matches('domain', '"domain"')).toBe(true);
			expect(strategy.matches('Domain', '"domain"')).toBe(false); // Case sensitive
			expect(strategy.matches('domain', '"Domain"')).toBe(false);
		});

		it('should normalize whitespace during stripping', () => {
			// Edge spaces are trimmed
			expect(strategy.matches('hello', '"hello"')).toBe(true);
			expect(strategy.matches('hello', ' "hello" ')).toBe(true);
			// Multiple internal spaces are normalized to single spaces
			expect(strategy.matches('hello world', '"hello  world"')).toBe(true); // Double space normalized
		});

		it('should strip punctuation but keep strict matching', () => {
			expect(strategy.matches('Hello', '"Hello"')).toBe(true);
			expect(strategy.matches('Hello', '"hello"')).toBe(false);
		});
	});

	describe('punctuation stripping behavior', () => {
		const baseStrategy = new LenientMatchStrategy();
		const strategy = new PunctuationStrippingMatchStrategy(baseStrategy);

		it('should strip all common punctuation types', () => {
			const punctuationTests = [
				{ input: 'test', target: 'test.' },
				{ input: 'test', target: 'test,' },
				{ input: 'test', target: 'test;' },
				{ input: 'test', target: 'test:' },
				{ input: 'test', target: 'test!' },
				{ input: 'test', target: 'test?' },
				{ input: 'test', target: 'test-' },
				{ input: 'test', target: '(test)' },
				{ input: 'test', target: '[test]' },
				{ input: 'test', target: '{test}' },
				{ input: 'test', target: '<test>' },
				{ input: 'test', target: '"test"' },
				{ input: 'test', target: "'test'" },
				{ input: 'test', target: '/test/' },
				{ input: 'test', target: '\\test\\' },
			];

			punctuationTests.forEach(({ input, target }) => {
				expect(strategy.matches(input, target)).toBe(true);
			});
		});

		it('should preserve letters and numbers', () => {
			expect(strategy.matches('test123', 'test123')).toBe(true);
			expect(strategy.matches('abc', 'abc')).toBe(true);
			expect(strategy.matches('123', '123')).toBe(true);
		});

		it('should preserve spaces', () => {
			expect(strategy.matches('hello world', '"hello world"')).toBe(true);
			expect(strategy.matches('a b c', 'a b c')).toBe(true);
		});

		it('should handle multiple punctuation marks', () => {
			expect(strategy.matches('test', '"""test..."""')).toBe(true);
			expect(strategy.matches('hello', '((((hello))))')).toBe(true);
		});

		it('should handle mixed punctuation and text', () => {
			expect(strategy.matches('dont worry', "don't worry!")).toBe(true);
			expect(strategy.matches('its okay', "it's okay.")).toBe(true);
		});
	});

	describe('real-world examples', () => {
		const baseStrategy = new LenientMatchStrategy();
		const strategy = new PunctuationStrippingMatchStrategy(baseStrategy);

		it('should match text from Essay-DDD.md with curly quotes', () => {
			// This is the actual text from src/test-data/Essay-DDD.md line 6
			// The word "domain" appears with Unicode curly quotes (U+201C and U+201D)
			const target = 'The term "domain" in this context refers to the sphere of knowledge';
			
			// User should be able to type just: domain
			expect(strategy.matches('The term domain in this context refers to the sphere of knowledge', target)).toBe(true);
			
			// Or just the word itself
			expect(strategy.matches('domain', '"domain"')).toBe(true);
		});

		it('should match markdown quoted text', () => {
			expect(strategy.matches('domain', '`domain`')).toBe(true);
			expect(strategy.matches('code', '```code```')).toBe(true);
		});

		it('should match text with markdown emphasis', () => {
			expect(strategy.matches('bold', '**bold**')).toBe(true);
			expect(strategy.matches('italic', '_italic_')).toBe(true);
		});

		it('should match URLs without protocol', () => {
			expect(strategy.matches('examplecom', 'example.com')).toBe(true);
			expect(strategy.matches('githubcom', 'github.com')).toBe(true);
		});

		it('should match sentences with ending punctuation', () => {
			expect(strategy.matches('This is a test', 'This is a test.')).toBe(true);
			expect(strategy.matches('Is this working', 'Is this working?')).toBe(true);
			expect(strategy.matches('It works', 'It works!')).toBe(true);
		});

		it('should match list items', () => {
			// Punctuation is stripped, numbers are kept
			expect(strategy.matches('1 First item', '1. First item')).toBe(true);
			expect(strategy.matches('Second item', '- Second item')).toBe(true);
			expect(strategy.matches('Third item', '* Third item')).toBe(true);
		});
	});
});

