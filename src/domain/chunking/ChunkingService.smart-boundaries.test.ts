import { describe, it, expect } from 'vitest';
import { ChunkingService } from './ChunkingService';

describe('ChunkingService - Smart Boundary Detection', () => {
	describe('character-based chunking with hyphenated words', () => {
		it.skip('should avoid splitting hyphenated words mid-word', () => {
			// TODO: Implement smart boundary detection
			const text = 'A well-known solution';
			const sequence = ChunkingService.chunkByCharacters(text, 10);

			// Should intelligently adjust boundaries to keep hyphenated words readable
			// Either break AT hyphen or keep word together
			
			// Current bad behavior: "A well-kno", "wn solutio", "n"
			// Desired: Could break at hyphen "A well-" or keep together
			
			// For now, just document that we DON'T split mid-hyphen-word
			const allChunks = sequence.chunks.map(c => c.content);
			
			// No chunk should start or end mid-hyphenated-word
			// (avoiding patterns like "kno" followed by "wn")
			for (let i = 0; i < allChunks.length - 1; i++) {
				const current = allChunks[i];
				const next = allChunks[i + 1];
				
				// If current ends with letters and next starts with letters,
				// check if they're part of a hyphenated word
				if (/[a-z]$/i.test(current) && /^[a-z]/i.test(next)) {
					// This might be a bad split - we should avoid this
					// unless there was intentional boundary adjustment
				}
			}
		});

		it.skip('should prefer breaking at hyphen boundaries when possible', () => {
			// TODO: Implement smart boundary detection
			const text = 'state-of-the-art design';
			const sequence = ChunkingService.chunkByCharacters(text, 10);

			// Ideal chunking would break at natural hyphen points:
			// "state-", "of-the-", "art design"
			// Rather than arbitrary character counts
			
			const allChunks = sequence.chunks.map(c => c.content);
			
			// Check that we prefer hyphen boundaries
			// (chunks ending with hyphen are natural break points)
			const hyphenBreaks = allChunks.filter(c => c.endsWith('-'));
			
			// We should have SOME hyphen breaks when text has many hyphens
			expect(hyphenBreaks.length).toBeGreaterThan(0);
		});

		it.skip('should keep short hyphenated words together', () => {
			// TODO: Implement smart boundary detection
			const text = 'This is a so-called well-known fact';
			const sequence = ChunkingService.chunkByCharacters(text, 15);

			// Short hyphenated words like "so-called" should stay together
			// when they fit within (or close to) the chunk size
			
			const allChunks = sequence.chunks.map(c => c.content);
			
			// "so-called" (9 chars) should NOT be split when chunk size is 15
			const hasSoCalled = allChunks.some(c => c.includes('so-called'));
			expect(hasSoCalled).toBe(true);
			
			// Should not have fragments like "so-cal" and "led"
			const hasFragment = allChunks.some(c => 
				c === 'so-cal' || c === 'led' || c.match(/^led/)
			);
			expect(hasFragment).toBe(false);
		});

		it.skip('should handle multiple hyphens intelligently', () => {
			// TODO: Implement smart boundary detection  
			const text = 'state-of-the-art';
			const sequence = ChunkingService.chunkByCharacters(text, 6);

			// "state-of-the-art" (16 chars) with chunk size 6
			// Smart options:
			// 1. "state-", "of-", "the-", "art" (break at each hyphen)
			// 2. Adjust sizes slightly to keep components together
			
			const allChunks = sequence.chunks.map(c => c.content);
			
			// Should NOT have: "state-", "of-the", "-art" (hyphen orphaned)
			// Should NOT have: "state", "-of-th", "e-art" (random breaks)
			
			// Ideally, each chunk is a meaningful component
			expect(allChunks).toContain('state-');
			expect(allChunks).toContain('of-');
			expect(allChunks).toContain('the-');
			expect(allChunks).toContain('art');
		});
	});

	describe('word-based chunking already handles this correctly', () => {
		it('keeps hyphenated words together naturally', () => {
			const text = 'A well-known state-of-the-art solution';
			const sequence = ChunkingService.chunkByWords(text, 2);

			// Word-based chunking already works well because it splits on whitespace
			expect(sequence.getChunk(0)?.content).toBe('A well-known');
			expect(sequence.getChunk(1)?.content).toBe('state-of-the-art solution');
			
			// Hyphenated words stay intact ✓
		});
	});

	describe('current problematic behavior (DEMO)', () => {
		it('SHOWS: character chunking currently splits hyphenated words badly', () => {
			const text = 'A well-known solution';
			const sequence = ChunkingService.chunkByCharacters(text, 10);

			// Current behavior - demonstrates the problem
			const allChunks = sequence.chunks.map(c => c.content);
			console.log('Current chunks:', allChunks);
			
			// This is what happens NOW (problematic):
			expect(allChunks[0]).toBe('A well-kno'); // ❌ Splits "well-known"
			expect(allChunks[1]).toBe('wn solutio'); // ❌ Unreadable fragment
			expect(allChunks[2]).toBe('n');          // ❌ Single character
			
			// This proves we need smart boundary detection!
		});

		it('SHOWS: multi-hyphen words get mangled', () => {
			const text = 'state-of-the-art';
			const sequence = ChunkingService.chunkByCharacters(text, 6);

			const allChunks = sequence.chunks.map(c => c.content);
			console.log('Multi-hyphen chunks:', allChunks);
			
			// Current (bad): "state-", "of-the", "-art"
			expect(allChunks[0]).toBe('state-');
			expect(allChunks[1]).toBe('of-the'); // ❌ Includes part of next component
			expect(allChunks[2]).toBe('-art');   // ❌ Hyphen orphaned at start
			
			// Would be better: "state-", "of-", "the-", "art"
		});
	});
});

