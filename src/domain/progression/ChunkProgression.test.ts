import { describe, it, expect, beforeEach } from 'vitest';
import { ChunkProgression } from './ChunkProgression';
import { ProgressionState } from './ProgressionState';
import { Chunk } from '../chunking/Chunk';
import { ChunkSequence } from '../chunking/ChunkSequence';

describe('ChunkProgression', () => {
	let sequence: ChunkSequence;
	let progression: ChunkProgression;

	beforeEach(() => {
		// Create a test sequence with 3 chunks
		const chunks = [
			new Chunk('First chunk', 0),
			new Chunk('Second chunk', 1),
			new Chunk('Third chunk', 2),
		];
		sequence = new ChunkSequence(chunks);
		progression = new ChunkProgression(sequence);
	});

	describe('creation', () => {
		it('should create with valid sequence', () => {
			expect(progression).toBeDefined();
			expect(progression.state).toBe(ProgressionState.IDLE);
			expect(progression.currentIndex).toBe(0);
		});

		it('should reject empty sequence', () => {
			const emptySequence = new ChunkSequence([]);
			expect(() => new ChunkProgression(emptySequence)).toThrow('Cannot create progression from empty sequence');
		});

		it('should start at first chunk', () => {
			expect(progression.currentChunk?.content).toBe('First chunk');
		});
	});

	describe('state management', () => {
		it('should start in IDLE state', () => {
			expect(progression.state).toBe(ProgressionState.IDLE);
		});

		it('should transition from IDLE to PLAYING on start', () => {
			progression.start();
			expect(progression.state).toBe(ProgressionState.PLAYING);
		});

		it('should transition from PLAYING to PAUSED on pause', () => {
			progression.start();
			progression.pause();
			expect(progression.state).toBe(ProgressionState.PAUSED);
		});

		it('should transition from PAUSED to PLAYING on resume', () => {
			progression.start();
			progression.pause();
			progression.resume();
			expect(progression.state).toBe(ProgressionState.PLAYING);
		});

		it('should transition to IDLE on stop', () => {
			progression.start();
			progression.stop();
			expect(progression.state).toBe(ProgressionState.IDLE);
		});

		it('should throw when starting if already playing', () => {
			progression.start();
			expect(() => progression.start()).toThrow('already playing');
		});

		it('should throw when pausing if not playing', () => {
			expect(() => progression.pause()).toThrow('not playing');
		});

		it('should throw when resuming if not paused', () => {
			expect(() => progression.resume()).toThrow('not paused');
		});
	});

	describe('navigation', () => {
		beforeEach(() => {
			progression.start();
		});

		it('should advance to next chunk', () => {
			const nextChunk = progression.next();
			expect(nextChunk?.content).toBe('Second chunk');
			expect(progression.currentIndex).toBe(1);
		});

		it('should go back to previous chunk', () => {
			progression.next(); // Move to second
			const prevChunk = progression.previous();
			expect(prevChunk?.content).toBe('First chunk');
			expect(progression.currentIndex).toBe(0);
		});

		it('should return null when going previous at beginning', () => {
			const prevChunk = progression.previous();
			expect(prevChunk).toBeNull();
			expect(progression.currentIndex).toBe(0);
		});

		it('should transition to COMPLETED when reaching end', () => {
			progression.next(); // Index 1
			progression.next(); // Index 2
			const result = progression.next(); // Try to go beyond

			expect(result).toBeNull();
			expect(progression.state).toBe(ProgressionState.COMPLETED);
		});

		it('should throw when advancing if not playing', () => {
			progression.pause();
			expect(() => progression.next()).toThrow('must be playing');
		});

		it('should throw when going back if not playing', () => {
			progression.pause();
			expect(() => progression.previous()).toThrow('must be playing');
		});
	});

	describe('hasNext and hasPrevious', () => {
		it('should have next at beginning', () => {
			expect(progression.hasNext).toBe(true);
		});

		it('should not have previous at beginning', () => {
			expect(progression.hasPrevious).toBe(false);
		});

		it('should have both next and previous in middle', () => {
			progression.start();
			progression.next(); // Move to middle

			expect(progression.hasNext).toBe(true);
			expect(progression.hasPrevious).toBe(true);
		});

		it('should not have next at end', () => {
			progression.start();
			progression.next(); // Index 1
			progression.next(); // Index 2 (last)

			expect(progression.hasNext).toBe(false);
			expect(progression.hasPrevious).toBe(true);
		});
	});

	describe('currentChunk', () => {
		it('should return current chunk at any position', () => {
			expect(progression.currentChunk?.content).toBe('First chunk');

			progression.start();
			progression.next();
			expect(progression.currentChunk?.content).toBe('Second chunk');

			progression.next();
			expect(progression.currentChunk?.content).toBe('Third chunk');
		});
	});

	describe('reset', () => {
		it('should reset to beginning', () => {
			progression.start();
			progression.next();
			progression.next();

			progression.reset();

			expect(progression.currentIndex).toBe(0);
			expect(progression.currentChunk?.content).toBe('First chunk');
		});

		it('should reset from COMPLETED to IDLE', () => {
			progression.start();
			progression.next();
			progression.next();
			progression.next(); // Complete

			expect(progression.state).toBe(ProgressionState.COMPLETED);

			progression.reset();

			expect(progression.state).toBe(ProgressionState.IDLE);
			expect(progression.currentIndex).toBe(0);
		});

		it('should not change non-COMPLETED states', () => {
			progression.start();
			progression.next();
			progression.pause();

			progression.reset();

			expect(progression.state).toBe(ProgressionState.PAUSED);
			expect(progression.currentIndex).toBe(0);
		});
	});

	describe('stop', () => {
		it('should reset to beginning and IDLE state', () => {
			progression.start();
			progression.next();
			progression.next();

			progression.stop();

			expect(progression.state).toBe(ProgressionState.IDLE);
			expect(progression.currentIndex).toBe(0);
		});

		it('should work from any state', () => {
			// From PLAYING
			progression.start();
			progression.stop();
			expect(progression.state).toBe(ProgressionState.IDLE);

			// From PAUSED
			progression.start();
			progression.pause();
			progression.stop();
			expect(progression.state).toBe(ProgressionState.IDLE);

			// From COMPLETED
			progression.start();
			while (progression.hasNext) {
				progression.next();
			}
			progression.next(); // Complete
			progression.stop();
			expect(progression.state).toBe(ProgressionState.IDLE);
		});
	});

	describe('start after completion', () => {
		it('should restart from beginning when starting after completion', () => {
			progression.start();
			// Go to end
			while (progression.hasNext) {
				progression.next();
			}
			progression.next(); // Complete

			expect(progression.state).toBe(ProgressionState.COMPLETED);

			// Start again
			progression.start();

			expect(progression.state).toBe(ProgressionState.PLAYING);
			expect(progression.currentIndex).toBe(0);
			expect(progression.currentChunk?.content).toBe('First chunk');
		});
	});

	describe('sequence property', () => {
		it('should provide access to the sequence', () => {
			expect(progression.sequence).toBe(sequence);
			expect(progression.sequence.length).toBe(3);
		});
	});

	describe('edge cases', () => {
		it('should handle single-chunk sequence', () => {
			const singleChunk = new ChunkSequence([new Chunk('Only chunk', 0)]);
			const singleProgression = new ChunkProgression(singleChunk);

			expect(singleProgression.hasNext).toBe(false);
			expect(singleProgression.hasPrevious).toBe(false);

			singleProgression.start();
			const result = singleProgression.next();

			expect(result).toBeNull();
			expect(singleProgression.state).toBe(ProgressionState.COMPLETED);
		});

		it('should maintain position when pausing and resuming', () => {
			progression.start();
			progression.next(); // Move to index 1

			progression.pause();
			expect(progression.currentIndex).toBe(1);

			progression.resume();
			expect(progression.currentIndex).toBe(1);
			expect(progression.currentChunk?.content).toBe('Second chunk');
		});
	});
});

