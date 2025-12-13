import { ChunkingType } from './ChunkingType';

/**
 * ChunkingStrategy - Value Object
 * 
 * Configuration for how text should be chunked.
 * Immutable value object specifying chunking approach and size.
 */
export class ChunkingStrategy {
	private readonly _type: ChunkingType;
	private readonly _chunkSize: number;

	private constructor(type: ChunkingType, chunkSize: number) {
		if (chunkSize <= 0) {
			throw new Error('Chunk size must be positive');
		}
		this._type = type;
		this._chunkSize = chunkSize;
	}

	/**
	 * Create a word-based chunking strategy
	 * @param wordCount Number of words per chunk
	 */
	static wordBased(wordCount: number): ChunkingStrategy {
		return new ChunkingStrategy(ChunkingType.WORD_BASED, wordCount);
	}

	/**
	 * Create a character-based chunking strategy
	 * @param charCount Number of characters per chunk
	 * @deprecated Character-based chunking is not yet implemented. Use wordBased() instead.
	 * @throws Error - Character-based chunking violates comprehension principle
	 */
	static characterBased(charCount: number): ChunkingStrategy {
		throw new Error('Character-based chunking is not yet supported. Use wordBased() for comprehension-focused segmentation.');
	}

	/**
	 * Get the chunking type
	 */
	get type(): ChunkingType {
		return this._type;
	}

	/**
	 * Get the chunk size (in words or characters, depending on type)
	 */
	get chunkSize(): number {
		return this._chunkSize;
	}

	/**
	 * Check equality with another strategy
	 */
	equals(other: ChunkingStrategy): boolean {
		return this._type === other._type && this._chunkSize === other._chunkSize;
	}
}

