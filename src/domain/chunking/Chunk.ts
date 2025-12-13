/**
 * Chunk - Value Object
 * 
 * Represents an immutable unit of text for display.
 * Contains the text content and its position in a sequence.
 */
export class Chunk {
	private readonly _content: string;
	private readonly _sequenceNumber: number;

	constructor(content: string, sequenceNumber: number) {
		if (content.length === 0) {
			throw new Error('Chunk content cannot be empty');
		}
		if (sequenceNumber < 0) {
			throw new Error('Sequence number must be non-negative');
		}
		this._content = content;
		this._sequenceNumber = sequenceNumber;
	}

	/**
	 * The text content of this chunk
	 */
	get content(): string {
		return this._content;
	}

	/**
	 * The position of this chunk in its sequence (0-based)
	 */
	get sequenceNumber(): number {
		return this._sequenceNumber;
	}

	/**
	 * Count the number of words in this chunk
	 * Words are defined as sequences of non-whitespace characters
	 */
	wordCount(): number {
		// Split by whitespace and filter out empty strings
		const words = this._content.trim().split(/\s+/).filter(word => word.length > 0);
		return words.length;
	}

	/**
	 * Count the number of characters in this chunk
	 */
	characterCount(): number {
		return this._content.length;
	}

	/**
	 * Check equality with another Chunk
	 * Two chunks are equal if they have the same content and sequence number
	 */
	equals(other: Chunk): boolean {
		return this._content === other._content && 
		       this._sequenceNumber === other._sequenceNumber;
	}
}

