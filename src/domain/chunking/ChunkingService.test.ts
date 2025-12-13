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
		it('should chunk by exact character count', () => {
			const text = 'Hello world';
			const sequence = ChunkingService.chunkByCharacters(text, 5);

			expect(sequence.length).toBe(3);
			expect(sequence.getChunk(0)?.content).toBe('Hello');
			expect(sequence.getChunk(1)?.content).toBe(' worl');
			expect(sequence.getChunk(2)?.content).toBe('d');
		});

		it('should split words mid-character if needed', () => {
			const text = 'abcdefghij';
			const sequence = ChunkingService.chunkByCharacters(text, 3);

			expect(sequence.length).toBe(4);
			expect(sequence.getChunk(0)?.content).toBe('abc');
			expect(sequence.getChunk(1)?.content).toBe('def');
			expect(sequence.getChunk(2)?.content).toBe('ghi');
			expect(sequence.getChunk(3)?.content).toBe('j');
		});

		it('should handle last chunk with fewer characters', () => {
			const text = 'Hello';
			const sequence = ChunkingService.chunkByCharacters(text, 3);

			expect(sequence.length).toBe(2);
			expect(sequence.getChunk(0)?.content).toBe('Hel');
			expect(sequence.getChunk(1)?.content).toBe('lo');
		});

		it('should include whitespace in character count', () => {
			const text = 'A B C D';
			const sequence = ChunkingService.chunkByCharacters(text, 2);

			expect(sequence.length).toBe(4);
			expect(sequence.getChunk(0)?.content).toBe('A ');
			expect(sequence.getChunk(1)?.content).toBe('B ');
			expect(sequence.getChunk(2)?.content).toBe('C ');
			expect(sequence.getChunk(3)?.content).toBe('D');
		});

		it('should handle special characters', () => {
			const text = 'Hello, world!';
			const sequence = ChunkingService.chunkByCharacters(text, 7);

			expect(sequence.length).toBe(2);
			expect(sequence.getChunk(0)?.content).toBe('Hello, ');
			expect(sequence.getChunk(1)?.content).toBe('world!');
		});

		it('should handle newlines', () => {
			const text = 'Line1\nLine2';
			const sequence = ChunkingService.chunkByCharacters(text, 6);

			expect(sequence.length).toBe(2);
			expect(sequence.getChunk(0)?.content).toBe('Line1\n');
			expect(sequence.getChunk(1)?.content).toBe('Line2');
		});

		it('should return empty sequence for empty text', () => {
			const sequence = ChunkingService.chunkByCharacters('', 5);
			expect(sequence.isEmpty).toBe(true);
		});

		it('should reject non-positive character count', () => {
			expect(() => ChunkingService.chunkByCharacters('Hello', 0)).toThrow('Character count must be positive');
			expect(() => ChunkingService.chunkByCharacters('Hello', -1)).toThrow('Character count must be positive');
		});

		it('should handle single character text', () => {
			const text = 'A';
			const sequence = ChunkingService.chunkByCharacters(text, 1);

			expect(sequence.length).toBe(1);
			expect(sequence.getChunk(0)?.content).toBe('A');
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

		it('should use character-based chunking for character strategy', () => {
			const text = 'Hello world';
			const strategy = ChunkingStrategy.characterBased(5);
			const sequence = ChunkingService.chunk(text, strategy);

			expect(sequence.length).toBe(3);
			expect(sequence.getChunk(0)?.content).toBe('Hello');
			expect(sequence.getChunk(1)?.content).toBe(' worl');
			expect(sequence.getChunk(2)?.content).toBe('d');
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

		it('should not lose any characters during character-based chunking', () => {
			const text = 'Hello, world! This is a test.';
			const sequence = ChunkingService.chunkByCharacters(text, 7);

			// Reconstruct text from chunks
			const reconstructed = sequence.chunks
				.map(chunk => chunk.content)
				.join('');

			expect(reconstructed).toBe(text);
		});
	});
});

