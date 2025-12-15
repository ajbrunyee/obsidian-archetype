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
	 * Chunk text by word count with section awareness
	 */
	static chunkByWords(text: string, wordCount: number): ChunkSequence {
		if (wordCount <= 0) {
			throw new Error('Word count must be positive');
		}

		// Strip frontmatter first
		const textWithoutFrontmatter = this.stripFrontmatter(text);

		// Parse into sections
		const sections = this.parseMarkdownSections(textWithoutFrontmatter);

		// Handle empty text
		if (sections.length === 0) {
			return new ChunkSequence([]);
		}

		const chunks: Chunk[] = [];

		// Process each section
		for (let i = 0; i < sections.length; i++) {
			const section = sections[i];
			const sectionStartLength = chunks.length;

			// Add section heading as its own chunk if present
			if (section.heading) {
				chunks.push(new Chunk(section.heading, chunks.length));
			}

			// Strip markdown formatting from section content
			const cleanText = this.stripMarkdown(section.content);

			// Only process content if it's not empty
			if (cleanText.trim().length > 0) {
				// Split into sentences to respect boundaries
				const sentences = this.splitIntoSentences(cleanText);

				for (const sentence of sentences) {
					const words = sentence.trim().split(/\s+/).filter(w => w.length > 0);
					
					// Chunk each sentence by word count
					for (let j = 0; j < words.length; j += wordCount) {
						const chunkWords = words.slice(j, j + wordCount);
						const chunkContent = chunkWords.join(' ');
						chunks.push(new Chunk(chunkContent, chunks.length));
					}
				}
			}

			// Add a pause after each section if:
			// 1. We added content for this section (more chunks than when we started)
			// 2. This isn't the last section
			const addedContentThisSection = chunks.length > sectionStartLength;
			const isLastSection = i === sections.length - 1;
			
			if (addedContentThisSection && !isLastSection) {
				// Small pause represented by ellipsis
				chunks.push(new Chunk('...', chunks.length));
			}
		}

		return new ChunkSequence(chunks);
	}

	/**
	 * Strip YAML frontmatter from the beginning of markdown text
	 */
	private static stripFrontmatter(text: string): string {
		// Match frontmatter: --- at start, content, --- at end (with optional trailing newline)
		const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---(\r?\n|$)/;
		return text.replace(frontmatterRegex, '');
	}

	/**
	 * Parse markdown into sections based on headings
	 * Returns array of sections with optional heading and content
	 */
	private static parseMarkdownSections(text: string): Array<{ heading: string | null; content: string }> {
		const sections: Array<{ heading: string | null; content: string }> = [];
		
		// Split by headings (# at start of line)
		const lines = text.split(/\r?\n/);
		let currentHeading: string | null = null;
		let currentContent: string[] = [];

		for (const line of lines) {
			// Check if line is a heading
			const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
			
			if (headingMatch) {
				// Save previous section if it has content
				if (currentContent.length > 0 || currentHeading) {
					sections.push({
						heading: currentHeading,
						content: currentContent.join('\n').trim()
					});
				}
				
				// Start new section
				currentHeading = headingMatch[2].trim();
				currentContent = [];
			} else {
				// Add to current section content
				currentContent.push(line);
			}
		}

		// Add final section
		if (currentContent.length > 0 || currentHeading) {
			sections.push({
				heading: currentHeading,
				content: currentContent.join('\n').trim()
			});
		}

		return sections.filter(s => s.heading || s.content.trim().length > 0);
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

