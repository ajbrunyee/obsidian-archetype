import { describe, it, expect } from 'vitest';
import { Chunk } from './Chunk';
import { ChunkSequence } from './ChunkSequence';

describe('ChunkSequence', () => {
	describe('creation', () => {
		it('should create with valid chunks', () => {
			const chunks = [
				new Chunk('Hello', 0),
				new Chunk('world', 1),
			];
			const sequence = new ChunkSequence(chunks);
			expect(sequence.length).toBe(2);
		});

		it('should create empty sequence', () => {
			const sequence = new ChunkSequence([]);
			expect(sequence.isEmpty).toBe(true);
			expect(sequence.length).toBe(0);
		});

		it('should reject non-sequential chunk numbers', () => {
			const chunks = [
				new Chunk('Hello', 0),
				new Chunk('world', 2), // Gap in sequence
			];
			expect(() => new ChunkSequence(chunks)).toThrow('Invalid sequence');
		});

		it('should reject chunks not starting at 0', () => {
			const chunks = [
				new Chunk('Hello', 1),
				new Chunk('world', 2),
			];
			expect(() => new ChunkSequence(chunks)).toThrow('Invalid sequence');
		});

		it('should accept single chunk', () => {
			const chunks = [new Chunk('Hello', 0)];
			const sequence = new ChunkSequence(chunks);
			expect(sequence.length).toBe(1);
		});
	});

	describe('getChunk()', () => {
		it('should return chunk at valid index', () => {
			const chunks = [
				new Chunk('First', 0),
				new Chunk('Second', 1),
				new Chunk('Third', 2),
			];
			const sequence = new ChunkSequence(chunks);
			
			const chunk = sequence.getChunk(1);
			expect(chunk).not.toBeNull();
			expect(chunk?.content).toBe('Second');
		});

		it('should return null for negative index', () => {
			const chunks = [new Chunk('Hello', 0)];
			const sequence = new ChunkSequence(chunks);
			
			expect(sequence.getChunk(-1)).toBeNull();
		});

		it('should return null for index beyond length', () => {
			const chunks = [new Chunk('Hello', 0)];
			const sequence = new ChunkSequence(chunks);
			
			expect(sequence.getChunk(1)).toBeNull();
			expect(sequence.getChunk(100)).toBeNull();
		});

		it('should return null for empty sequence', () => {
			const sequence = new ChunkSequence([]);
			expect(sequence.getChunk(0)).toBeNull();
		});
	});

	describe('getFirst()', () => {
		it('should return first chunk', () => {
			const chunks = [
				new Chunk('First', 0),
				new Chunk('Second', 1),
			];
			const sequence = new ChunkSequence(chunks);
			
			const first = sequence.getFirst();
			expect(first).not.toBeNull();
			expect(first?.content).toBe('First');
		});

		it('should return null for empty sequence', () => {
			const sequence = new ChunkSequence([]);
			expect(sequence.getFirst()).toBeNull();
		});

		it('should return only chunk for single-chunk sequence', () => {
			const chunks = [new Chunk('Only', 0)];
			const sequence = new ChunkSequence(chunks);
			
			expect(sequence.getFirst()?.content).toBe('Only');
		});
	});

	describe('getLast()', () => {
		it('should return last chunk', () => {
			const chunks = [
				new Chunk('First', 0),
				new Chunk('Second', 1),
				new Chunk('Third', 2),
			];
			const sequence = new ChunkSequence(chunks);
			
			const last = sequence.getLast();
			expect(last).not.toBeNull();
			expect(last?.content).toBe('Third');
		});

		it('should return null for empty sequence', () => {
			const sequence = new ChunkSequence([]);
			expect(sequence.getLast()).toBeNull();
		});

		it('should return only chunk for single-chunk sequence', () => {
			const chunks = [new Chunk('Only', 0)];
			const sequence = new ChunkSequence(chunks);
			
			expect(sequence.getLast()?.content).toBe('Only');
		});
	});

	describe('hasNext()', () => {
		it('should return true when next chunk exists', () => {
			const chunks = [
				new Chunk('First', 0),
				new Chunk('Second', 1),
			];
			const sequence = new ChunkSequence(chunks);
			
			expect(sequence.hasNext(0)).toBe(true);
		});

		it('should return false at last chunk', () => {
			const chunks = [
				new Chunk('First', 0),
				new Chunk('Second', 1),
			];
			const sequence = new ChunkSequence(chunks);
			
			expect(sequence.hasNext(1)).toBe(false);
		});

		it('should return false for negative index', () => {
			const chunks = [new Chunk('First', 0)];
			const sequence = new ChunkSequence(chunks);
			
			expect(sequence.hasNext(-1)).toBe(false);
		});

		it('should return false for index beyond length', () => {
			const chunks = [new Chunk('First', 0)];
			const sequence = new ChunkSequence(chunks);
			
			expect(sequence.hasNext(5)).toBe(false);
		});

		it('should return false for empty sequence', () => {
			const sequence = new ChunkSequence([]);
			expect(sequence.hasNext(0)).toBe(false);
		});
	});

	describe('hasPrevious()', () => {
		it('should return true when previous chunk exists', () => {
			const chunks = [
				new Chunk('First', 0),
				new Chunk('Second', 1),
			];
			const sequence = new ChunkSequence(chunks);
			
			expect(sequence.hasPrevious(1)).toBe(true);
		});

		it('should return false at first chunk', () => {
			const chunks = [
				new Chunk('First', 0),
				new Chunk('Second', 1),
			];
			const sequence = new ChunkSequence(chunks);
			
			expect(sequence.hasPrevious(0)).toBe(false);
		});

		it('should return false for negative index', () => {
			const chunks = [new Chunk('First', 0)];
			const sequence = new ChunkSequence(chunks);
			
			expect(sequence.hasPrevious(-1)).toBe(false);
		});

		it('should return false for index beyond length', () => {
			const chunks = [new Chunk('First', 0)];
			const sequence = new ChunkSequence(chunks);
			
			expect(sequence.hasPrevious(5)).toBe(false);
		});

		it('should return false for empty sequence', () => {
			const sequence = new ChunkSequence([]);
			expect(sequence.hasPrevious(0)).toBe(false);
		});
	});

	describe('isEmpty', () => {
		it('should return true for empty sequence', () => {
			const sequence = new ChunkSequence([]);
			expect(sequence.isEmpty).toBe(true);
		});

		it('should return false for non-empty sequence', () => {
			const chunks = [new Chunk('Hello', 0)];
			const sequence = new ChunkSequence(chunks);
			expect(sequence.isEmpty).toBe(false);
		});
	});

	describe('immutability', () => {
		it('should not allow modification of chunks array', () => {
			const chunks = [
				new Chunk('First', 0),
				new Chunk('Second', 1),
			];
			const sequence = new ChunkSequence(chunks);
			
			// TypeScript prevents: sequence.chunks.push(new Chunk('Third', 2));
			// TypeScript prevents: sequence.chunks[0] = new Chunk('Modified', 0);
			
			expect(sequence.chunks.length).toBe(2);
		});

		it('should not be affected by modifications to original array', () => {
			const chunks = [
				new Chunk('First', 0),
				new Chunk('Second', 1),
			];
			const sequence = new ChunkSequence(chunks);
			
			// Modify original array
			chunks.push(new Chunk('Third', 2));
			
			// Sequence should be unaffected
			expect(sequence.length).toBe(2);
		});
	});
});

