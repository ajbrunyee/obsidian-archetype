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

		// Strip markdown formatting first
		const cleanText = this.stripMarkdown(text);

		// Handle empty text
		if (cleanText.trim().length === 0) {
			return new ChunkSequence([]);
		}

		// Split into sentences first to respect boundaries
		const sentences = this.splitIntoSentences(cleanText);
		const chunks: Chunk[] = [];

		for (const sentence of sentences) {
			const words = sentence.trim().split(/\s+/).filter(w => w.length > 0);
			
			// Chunk each sentence by word count
			for (let i = 0; i < words.length; i += wordCount) {
				const chunkWords = words.slice(i, i + wordCount);
				const chunkContent = chunkWords.join(' ');
				chunks.push(new Chunk(chunkContent, chunks.length));
			}
		}

		return new ChunkSequence(chunks);
	}

	/**
	 * Strip markdown formatting from text
	 */
	private static stripMarkdown(text: string): string {
		let cleaned = text;

		// Remove image embeds: ![[image.png]] or ![alt](url)
		cleaned = cleaned.replace(/!\[\[([^\]]+)\]\]/g, '');
		cleaned = cleaned.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');

		// Extract link text: [[page|label]] -> label, [[page]] -> page
		cleaned = cleaned.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2');
		cleaned = cleaned.replace(/\[\[([^\]]+)\]\]/g, '$1');

		// Extract link text: [label](url) -> label
		cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

		// Remove bold: **text** or __text__
		cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
		cleaned = cleaned.replace(/__([^_]+)__/g, '$1');

		// Remove italic: *text* or _text_
		cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
		cleaned = cleaned.replace(/_([^_]+)_/g, '$1');

		// Remove strikethrough: ~~text~~
		cleaned = cleaned.replace(/~~([^~]+)~~/g, '$1');

		// Remove inline code: `code`
		cleaned = cleaned.replace(/`([^`]+)`/g, '$1');

		// Remove headings: ### Heading -> Heading
		cleaned = cleaned.replace(/^#{1,6}\s+(.+)$/gm, '$1');

		// Remove horizontal rules
		cleaned = cleaned.replace(/^([-*_])\1{2,}\s*$/gm, '');

		// Remove blockquote markers: > text -> text
		cleaned = cleaned.replace(/^>\s+/gm, '');

		// Remove list markers: - item or * item or 1. item -> item
		cleaned = cleaned.replace(/^[\s]*[-*+]\s+/gm, '');
		cleaned = cleaned.replace(/^[\s]*\d+\.\s+/gm, '');

		// Remove task list markers: - [ ] or - [x]
		cleaned = cleaned.replace(/^[\s]*[-*+]\s+\[([ x])\]\s+/gm, '');

		// Remove HTML tags
		cleaned = cleaned.replace(/<[^>]+>/g, '');

		// Normalize whitespace (tabs, multiple spaces, newlines to single space)
		cleaned = cleaned.replace(/[\t\r\n]+/g, ' ');
		cleaned = cleaned.replace(/\s{2,}/g, ' ');

		return cleaned.trim();
	}

	/**
	 * Split text into sentences, respecting sentence boundaries
	 */
	private static splitIntoSentences(text: string): string[] {
		// Split on sentence-ending punctuation followed by space and capital letter
		// Also handle end of string
		const sentences: string[] = [];
		
		// Match sentence endings: . ! ? followed by space or end of string
		const sentenceRegex = /[^.!?]+[.!?]+/g;
		const matches = text.match(sentenceRegex);
		
		if (matches) {
			return matches.map(s => s.trim()).filter(s => s.length > 0);
		}
		
		// Fallback: if no sentence boundaries found, return whole text
		return [text.trim()];
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

