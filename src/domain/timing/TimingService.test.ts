import { describe, it, expect } from 'vitest';
import { TimingService } from './TimingService';
import { ChunkTiming } from './ChunkTiming';
import { ReadingSpeed } from './ReadingSpeed';
import { Chunk } from '../chunking/Chunk';
import { ChunkSequence } from '../chunking/ChunkSequence';

describe('TimingService', () => {
	describe('calculateSequenceDuration()', () => {
		it('should calculate total duration for sequence', () => {
			const chunks = [
				new Chunk('The quick brown', 0),  // 3 words = 600ms at 300 WPM
				new Chunk('fox jumps', 1),         // 2 words = 400ms at 300 WPM
				new Chunk('over', 2),              // 1 word = 200ms at 300 WPM
			];
			const sequence = new ChunkSequence(chunks);
			const timing = new ChunkTiming(ReadingSpeed.fromWPM(300));

			const totalDuration = TimingService.calculateSequenceDuration(sequence, timing);
			
			// Total: 600 + 400 + 200 = 1200ms
			expect(totalDuration).toBe(1200);
		});

		it('should return 0 for empty sequence', () => {
			const sequence = new ChunkSequence([]);
			const timing = new ChunkTiming(ReadingSpeed.fromWPM(300));

			const totalDuration = TimingService.calculateSequenceDuration(sequence, timing);
			expect(totalDuration).toBe(0);
		});

		it('should handle single chunk sequence', () => {
			const chunks = [new Chunk('Hello world', 0)];  // 2 words = 400ms at 300 WPM
			const sequence = new ChunkSequence(chunks);
			const timing = new ChunkTiming(ReadingSpeed.fromWPM(300));

			const totalDuration = TimingService.calculateSequenceDuration(sequence, timing);
			expect(totalDuration).toBe(400);
		});

		it('should sum durations correctly for large sequence', () => {
			// Create 10 chunks, each with 2 words
			const chunks: Chunk[] = [];
			for (let i = 0; i < 10; i++) {
				chunks.push(new Chunk('word word', i));
			}
			const sequence = new ChunkSequence(chunks);
			const timing = new ChunkTiming(ReadingSpeed.fromWPM(300));

			// At 300 WPM: 2 words = 400ms per chunk
			// Total: 10 * 400 = 4000ms
			const totalDuration = TimingService.calculateSequenceDuration(sequence, timing);
			expect(totalDuration).toBe(4000);
		});

		it('should account for minimum duration constraints', () => {
			// Create chunks that would individually be below minimum
			const chunks = [
				new Chunk('A', 0),   // Would be ~100ms, constrained to MIN_DURATION
				new Chunk('B', 1),   // Would be ~100ms, constrained to MIN_DURATION
			];
			const sequence = new ChunkSequence(chunks);
			const timing = new ChunkTiming(ReadingSpeed.fromWPM(600));

			const totalDuration = TimingService.calculateSequenceDuration(sequence, timing);
			// Each chunk gets MIN_DISPLAY_DURATION (100ms)
			expect(totalDuration).toBe(200);
		});

		it('should work with different reading speeds', () => {
			const chunks = [
				new Chunk('One two three', 0),  // 3 words
			];
			const sequence = new ChunkSequence(chunks);

			// At 200 WPM: (3/200) * 60000 = 900ms
			const slowTiming = new ChunkTiming(ReadingSpeed.fromWPM(200));
			expect(TimingService.calculateSequenceDuration(sequence, slowTiming)).toBe(900);

			// At 300 WPM: (3/300) * 60000 = 600ms
			const normalTiming = new ChunkTiming(ReadingSpeed.fromWPM(300));
			expect(TimingService.calculateSequenceDuration(sequence, normalTiming)).toBe(600);

			// At 450 WPM: (3/450) * 60000 = 400ms
			const fastTiming = new ChunkTiming(ReadingSpeed.fromWPM(450));
			expect(TimingService.calculateSequenceDuration(sequence, fastTiming)).toBe(400);
		});

		it('should handle chunks with varying word counts', () => {
			const chunks = [
				new Chunk('One', 0),              // 1 word = 200ms
				new Chunk('Two words', 1),        // 2 words = 400ms
				new Chunk('Three word chunk', 2), // 3 words = 600ms
			];
			const sequence = new ChunkSequence(chunks);
			const timing = new ChunkTiming(ReadingSpeed.fromWPM(300));

			const totalDuration = TimingService.calculateSequenceDuration(sequence, timing);
			expect(totalDuration).toBe(1200);
		});
	});
});

