import { Chunk } from './Chunk';

/**
 * ChunkSequence - Value Object
 * 
 * Represents an immutable ordered collection of chunks.
 * Provides navigation and query operations for chunk sequences.
 */
export class ChunkSequence {
	private readonly _chunks: ReadonlyArray<Chunk>;

	constructor(chunks: Chunk[]) {
		// Validate sequence numbers are sequential starting from 0
		for (let i = 0; i < chunks.length; i++) {
			if (chunks[i].sequenceNumber !== i) {
				throw new Error(`Invalid sequence: chunk at index ${i} has sequence number ${chunks[i].sequenceNumber}`);
			}
		}
		this._chunks = Object.freeze([...chunks]);
	}

	/**
	 * Get all chunks in the sequence
	 */
	get chunks(): ReadonlyArray<Chunk> {
		return this._chunks;
	}

	/**
	 * Get the total number of chunks
	 */
	get length(): number {
		return this._chunks.length;
	}

	/**
	 * Check if the sequence is empty
	 */
	get isEmpty(): boolean {
		return this._chunks.length === 0;
	}

	/**
	 * Get chunk at specified index
	 * Returns null if index is out of bounds
	 */
	getChunk(index: number): Chunk | null {
		if (index < 0 || index >= this._chunks.length) {
			return null;
		}
		return this._chunks[index];
	}

	/**
	 * Get the first chunk
	 * Returns null if sequence is empty
	 */
	getFirst(): Chunk | null {
		return this._chunks.length > 0 ? this._chunks[0] : null;
	}

	/**
	 * Get the last chunk
	 * Returns null if sequence is empty
	 */
	getLast(): Chunk | null {
		return this._chunks.length > 0 ? this._chunks[this._chunks.length - 1] : null;
	}

	/**
	 * Check if there is a next chunk after the given index
	 */
	hasNext(index: number): boolean {
		return index >= 0 && index < this._chunks.length - 1;
	}

	/**
	 * Check if there is a previous chunk before the given index
	 */
	hasPrevious(index: number): boolean {
		return index > 0 && index < this._chunks.length;
	}
}

