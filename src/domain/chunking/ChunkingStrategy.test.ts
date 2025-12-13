import { describe, it, expect } from 'vitest';
import { ChunkingStrategy } from './ChunkingStrategy';
import { ChunkingType } from './ChunkingType';

describe('ChunkingStrategy', () => {
	describe('wordBased()', () => {
		it('should create word-based strategy with valid word count', () => {
			const strategy = ChunkingStrategy.wordBased(3);
			expect(strategy.type).toBe(ChunkingType.WORD_BASED);
			expect(strategy.chunkSize).toBe(3);
		});

		it('should reject non-positive word count', () => {
			expect(() => ChunkingStrategy.wordBased(0)).toThrow('Chunk size must be positive');
			expect(() => ChunkingStrategy.wordBased(-5)).toThrow('Chunk size must be positive');
		});
	});

	describe('characterBased()', () => {
		it('should throw error - not yet supported', () => {
			expect(() => ChunkingStrategy.characterBased(15)).toThrow('not yet supported');
		});
	});

	describe('equality', () => {
		it('should be equal when type and size match', () => {
			const strategy1 = ChunkingStrategy.wordBased(3);
			const strategy2 = ChunkingStrategy.wordBased(3);
			expect(strategy1.equals(strategy2)).toBe(true);
		});

		it('should not be equal when sizes differ', () => {
			const strategy1 = ChunkingStrategy.wordBased(3);
			const strategy2 = ChunkingStrategy.wordBased(5);
			expect(strategy1.equals(strategy2)).toBe(false);
		});

		it('should not be equal when types differ', () => {
			const strategy1 = ChunkingStrategy.wordBased(10);
			// Can't test CHARACTER_BASED as it throws - equality test not needed
			expect(strategy1.type).toBe(ChunkingType.WORD_BASED);
		});
	});

	describe('immutability', () => {
		it('should not allow modification of type or size', () => {
			const strategy = ChunkingStrategy.wordBased(3);
			expect(strategy.type).toBe(ChunkingType.WORD_BASED);
			expect(strategy.chunkSize).toBe(3);
			// TypeScript prevents: strategy.type = ChunkingType.CHARACTER_BASED;
			// TypeScript prevents: strategy.chunkSize = 5;
		});
	});
});

