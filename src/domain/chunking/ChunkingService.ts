import { Chunk } from './Chunk';
import { ChunkSequence } from './ChunkSequence';
import { ChunkingStrategy } from './ChunkingStrategy';
import { ChunkingType } from './ChunkingType';

/**
 * ChunkingService - Domain Service
 * 
 * Responsible for converting text into chunks based on a strategy.
 */
export class ChunkingService {
	/**
	 * Chunk text according to the given strategy
	 */
	static chunk(text: string, strategy: ChunkingStrategy): ChunkSequence {
		if (strategy.type === ChunkingType.WORD_BASED) {
			return this.chunkByWords(text, strategy.chunkSize);
		} else {
			return this.chunkByCharacters(text, strategy.chunkSize);
		}
	}

	/**
	 * Chunk text by word count
	 */
	static chunkByWords(text: string, wordCount: number): ChunkSequence {
		if (wordCount <= 0) {
			throw new Error('Word count must be positive');
		}

		// Handle empty text
		if (text.trim().length === 0) {
			return new ChunkSequence([]);
		}

		// Split into words (by whitespace)
		const words = text.trim().split(/\s+/);
		const chunks: Chunk[] = [];

		for (let i = 0; i < words.length; i += wordCount) {
			const chunkWords = words.slice(i, i + wordCount);
			const chunkContent = chunkWords.join(' ');
			chunks.push(new Chunk(chunkContent, chunks.length));
		}

		return new ChunkSequence(chunks);
	}

	/**
	 * Chunk text by character count
	 * @deprecated Not yet implemented - would break hyphenated words
	 * @throws Error - Character-based chunking violates comprehension principle
	 */
	static chunkByCharacters(text: string, charCount: number): ChunkSequence {
		throw new Error('Character-based chunking is not yet supported. Use chunkByWords() for comprehension-focused segmentation.');
	}
}

