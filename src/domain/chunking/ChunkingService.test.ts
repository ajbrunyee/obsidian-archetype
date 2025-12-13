import { describe, it, expect } from 'vitest';
import { ChunkingService } from './ChunkingService';
import { ChunkingStrategy } from './ChunkingStrategy';

describe('ChunkingService', () => {
	describe('chunkByWords()', () => {
		it('should chunk simple text into word groups', () => {
			const text = 'The quick brown fox jumps over';
			const sequence = ChunkingService.chunkByWords(text, 2);

			expect(sequence.length).toBe(3);
			expect(sequence.getChunk(0)?.content).toBe('The quick');
			expect(sequence.getChunk(1)?.content).toBe('brown fox');
			expect(sequence.getChunk(2)?.content).toBe('jumps over');
		});

		it('should handle last chunk with fewer words', () => {
			const text = 'One two three four five';
			const sequence = ChunkingService.chunkByWords(text, 2);

			expect(sequence.length).toBe(3);
			expect(sequence.getChunk(0)?.content).toBe('One two');
			expect(sequence.getChunk(1)?.content).toBe('three four');
			expect(sequence.getChunk(2)?.content).toBe('five');
		});

		it('should handle single word', () => {
			const text = 'Hello';
			const sequence = ChunkingService.chunkByWords(text, 3);

			expect(sequence.length).toBe(1);
			expect(sequence.getChunk(0)?.content).toBe('Hello');
		});

		it('should handle multiple spaces between words', () => {
			const text = 'Hello    world    foo';
			const sequence = ChunkingService.chunkByWords(text, 2);

			expect(sequence.length).toBe(2);
			expect(sequence.getChunk(0)?.content).toBe('Hello world');
			expect(sequence.getChunk(1)?.content).toBe('foo');
		});

		it('should handle leading and trailing whitespace', () => {
			const text = '  Hello world  ';
			const sequence = ChunkingService.chunkByWords(text, 1);

			expect(sequence.length).toBe(2);
			expect(sequence.getChunk(0)?.content).toBe('Hello');
			expect(sequence.getChunk(1)?.content).toBe('world');
		});

		it('should handle newlines and tabs', () => {
			const text = 'Hello\tworld\nfoo bar';
			const sequence = ChunkingService.chunkByWords(text, 2);

			expect(sequence.length).toBe(2);
			expect(sequence.getChunk(0)?.content).toBe('Hello world');
			expect(sequence.getChunk(1)?.content).toBe('foo bar');
		});

		it('should preserve punctuation attached to words', () => {
			const text = 'Hello, world! How are you?';
			const sequence = ChunkingService.chunkByWords(text, 2);

			expect(sequence.length).toBe(3);
			expect(sequence.getChunk(0)?.content).toBe('Hello, world!');
			expect(sequence.getChunk(1)?.content).toBe('How are');
			expect(sequence.getChunk(2)?.content).toBe('you?');
		});

		it('should treat hyphenated words as single words', () => {
			const text = 'A well-known state-of-the-art solution';
			const sequence = ChunkingService.chunkByWords(text, 2);

			// Hyphenated words are treated as single units
			expect(sequence.length).toBe(2);
			expect(sequence.getChunk(0)?.content).toBe('A well-known');
			expect(sequence.getChunk(1)?.content).toBe('state-of-the-art solution');
		});

		it('should handle em-dashes and hyphens correctly', () => {
			const text = 'Hello—world and well-known text';
			const sequence = ChunkingService.chunkByWords(text, 2);

			// Em-dash without spaces creates single "word", hyphen is within word
			expect(sequence.length).toBe(2);
			expect(sequence.getChunk(0)?.content).toBe('Hello—world and');
			expect(sequence.getChunk(1)?.content).toBe('well-known text');
		});

		it('should return empty sequence for empty text', () => {
			const sequence = ChunkingService.chunkByWords('', 3);
			expect(sequence.isEmpty).toBe(true);
		});

		it('should return empty sequence for whitespace-only text', () => {
			const sequence = ChunkingService.chunkByWords('   \n\t  ', 3);
			expect(sequence.isEmpty).toBe(true);
		});

		it('should reject non-positive word count', () => {
			expect(() => ChunkingService.chunkByWords('Hello', 0)).toThrow('Word count must be positive');
			expect(() => ChunkingService.chunkByWords('Hello', -1)).toThrow('Word count must be positive');
		});

		it('should preserve word order', () => {
			const text = 'First Second Third Fourth Fifth';
			const sequence = ChunkingService.chunkByWords(text, 2);

			expect(sequence.getChunk(0)?.content).toBe('First Second');
			expect(sequence.getChunk(1)?.content).toBe('Third Fourth');
			expect(sequence.getChunk(2)?.content).toBe('Fifth');
		});
	});

	describe('chunkByCharacters()', () => {
		it('should throw error - not yet supported', () => {
			expect(() => ChunkingService.chunkByCharacters('Hello world', 5)).toThrow('not yet supported');
		});
	});

	describe('chunk() with strategy', () => {
		it('should use word-based chunking for word strategy', () => {
			const text = 'The quick brown fox';
			const strategy = ChunkingStrategy.wordBased(2);
			const sequence = ChunkingService.chunk(text, strategy);

			expect(sequence.length).toBe(2);
			expect(sequence.getChunk(0)?.content).toBe('The quick');
			expect(sequence.getChunk(1)?.content).toBe('brown fox');
		});

		it('should throw for character-based strategy', () => {
			const text = 'Hello world';
			expect(() => ChunkingStrategy.characterBased(5)).toThrow('not yet supported');
		});
	});

	describe('text coverage', () => {
		it('should not lose any text during word-based chunking', () => {
			const text = 'The quick brown fox jumps over the lazy dog';
			const sequence = ChunkingService.chunkByWords(text, 3);

			// Reconstruct text from chunks
			const reconstructed = sequence.chunks
				.map(chunk => chunk.content)
				.join(' ');

			expect(reconstructed).toBe(text);
		});
	});
});

