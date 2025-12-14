import { describe, it, expect } from 'vitest';
import { ChunkingService } from './ChunkingService';
import { ChunkingStrategy } from './ChunkingStrategy';

describe('ChunkingService - Essay-DDD.md edge cases', () => {
	it('should not add extra quotes to words with curly quotes', () => {
		// From Essay-DDD.md line 6: The term "domain" in this context
		const textWithCurlyQuotes = 'The term "domain" in this context refers to the sphere';
		
		const sequence = ChunkingService.chunkByWords(textWithCurlyQuotes, 1);
		
		// Find the chunk containing "domain"
		const chunks = [];
		for (let i = 0; i < sequence.length; i++) {
			const chunk = sequence.getChunk(i);
			if (chunk) chunks.push(chunk.content);
		}
		
		console.log('Chunks created:', chunks);
		
		// Should contain just: "domain" (with curly quotes, or ideally stripped)
		// Should NOT contain: ""domain"" (with doubled quotes)
		const domainChunk = chunks.find(c => c.includes('domain'));
		expect(domainChunk).toBeDefined();
		console.log('Domain chunk:', JSON.stringify(domainChunk));
		
		// Check that we don't have 4 quotes (2 pairs)
		if (domainChunk) {
			const quoteCount = (domainChunk.match(/["""]/g) || []).length;
			console.log('Quote count in chunk:', quoteCount);
			expect(quoteCount).toBeLessThanOrEqual(2); // Should have at most 2 (the curly quotes)
		}
	});

	it('should strip markdown and not introduce extra quotes', () => {
		const markdown = 'The term **"domain"** in context';
		const sequence = ChunkingService.chunkByWords(markdown, 1);
		
		const chunks = [];
		for (let i = 0; i < sequence.length; i++) {
			const chunk = sequence.getChunk(i);
			if (chunk) chunks.push(chunk.content);
		}
		
		console.log('Chunks from markdown:', chunks);
		
		// After stripping **bold**, should have: "domain" (not ""domain"")
		const domainChunk = chunks.find(c => c.includes('domain'));
		if (domainChunk) {
			console.log('Domain chunk:', JSON.stringify(domainChunk));
			// Should not have doubled quotes
			expect(domainChunk).not.toContain('""');
		}
	});
});

