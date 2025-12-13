import { describe, it, expect } from 'vitest';
import { Chunk } from './Chunk';

describe('Chunk', () => {
	describe('creation', () => {
		it('should create with valid content and sequence number', () => {
			const chunk = new Chunk('Hello world', 0);
			expect(chunk.content).toBe('Hello world');
			expect(chunk.sequenceNumber).toBe(0);
		});

		it('should reject empty content', () => {
			expect(() => new Chunk('', 0)).toThrow('Chunk content cannot be empty');
		});

		it('should reject negative sequence number', () => {
			expect(() => new Chunk('Hello', -1)).toThrow('Sequence number must be non-negative');
		});

		it('should accept single character content', () => {
			const chunk = new Chunk('A', 0);
			expect(chunk.content).toBe('A');
		});

		it('should accept content with special characters', () => {
			const chunk = new Chunk('Hello, world!', 0);
			expect(chunk.content).toBe('Hello, world!');
		});

		it('should accept content with newlines', () => {
			const chunk = new Chunk('Line 1\nLine 2', 0);
			expect(chunk.content).toBe('Line 1\nLine 2');
		});
	});

	describe('wordCount()', () => {
		it('should count single word', () => {
			const chunk = new Chunk('Hello', 0);
			expect(chunk.wordCount()).toBe(1);
		});

		it('should count multiple words', () => {
			const chunk = new Chunk('The quick brown fox', 0);
			expect(chunk.wordCount()).toBe(4);
		});

		it('should handle multiple spaces between words', () => {
			const chunk = new Chunk('Hello    world', 0);
			expect(chunk.wordCount()).toBe(2);
		});

		it('should handle leading/trailing whitespace', () => {
			const chunk = new Chunk('  Hello world  ', 0);
			expect(chunk.wordCount()).toBe(2);
		});

		it('should handle tabs and newlines as word separators', () => {
			const chunk = new Chunk('Hello\tworld\nfoo', 0);
			expect(chunk.wordCount()).toBe(3);
		});

		it('should count punctuation attached to words as single word', () => {
			const chunk = new Chunk('Hello, world!', 0);
			expect(chunk.wordCount()).toBe(2);
		});

		it('should handle single character as one word', () => {
			const chunk = new Chunk('A', 0);
			expect(chunk.wordCount()).toBe(1);
		});
	});

	describe('characterCount()', () => {
		it('should count single character', () => {
			const chunk = new Chunk('A', 0);
			expect(chunk.characterCount()).toBe(1);
		});

		it('should count multiple characters including spaces', () => {
			const chunk = new Chunk('Hello world', 0);
			expect(chunk.characterCount()).toBe(11);
		});

		it('should count special characters', () => {
			const chunk = new Chunk('Hello, world!', 0);
			expect(chunk.characterCount()).toBe(13);
		});

		it('should count newlines', () => {
			const chunk = new Chunk('Line 1\nLine 2', 0);
			expect(chunk.characterCount()).toBe(13);
		});
	});

	describe('equality', () => {
		it('should be equal when content and sequence number match', () => {
			const chunk1 = new Chunk('Hello', 0);
			const chunk2 = new Chunk('Hello', 0);
			expect(chunk1.equals(chunk2)).toBe(true);
		});

		it('should not be equal when content differs', () => {
			const chunk1 = new Chunk('Hello', 0);
			const chunk2 = new Chunk('World', 0);
			expect(chunk1.equals(chunk2)).toBe(false);
		});

		it('should not be equal when sequence number differs', () => {
			const chunk1 = new Chunk('Hello', 0);
			const chunk2 = new Chunk('Hello', 1);
			expect(chunk1.equals(chunk2)).toBe(false);
		});

		it('should not be equal when both content and sequence differ', () => {
			const chunk1 = new Chunk('Hello', 0);
			const chunk2 = new Chunk('World', 1);
			expect(chunk1.equals(chunk2)).toBe(false);
		});
	});

	describe('immutability', () => {
		it('should not allow modification of content', () => {
			const chunk = new Chunk('Hello', 0);
			expect(chunk.content).toBe('Hello');
			// TypeScript prevents: chunk.content = 'World';
		});

		it('should not allow modification of sequence number', () => {
			const chunk = new Chunk('Hello', 0);
			expect(chunk.sequenceNumber).toBe(0);
			// TypeScript prevents: chunk.sequenceNumber = 1;
		});
	});
});

